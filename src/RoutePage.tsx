import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'

import AppBar from '@mui/material/AppBar'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import SpeedDial from '@mui/material/SpeedDial'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'

import DailyVisitList from './DailyVisitList'
import RegisterMessage from './RegisterMessage'
import RegisterVisitDialog from './RegisterVisitDialog'
import SetupDialog from './SetupDialog'
import { getISOString, createVisitInfoList } from './methods'
import { fetchOfficeVisitsGQL, fetchUserGQL } from './queries'
import { Office, VisitInfo } from './types'

const RoutePage = () => {
  const { user, logout } = useAuth0()
  const [nowDate, setNowDate] = useState(new Date())
  const [currentOfficeId, setCurrentOfficeId] = useState<number>(0)
  const [registerMode, setRegisterMode] = useState<string>('off')

  const resFetchUser = useQuery(fetchUserGQL, {
    variables: { id: user?.sub }
  })
  const companyId = resFetchUser?.data?.users[0]?.user_company?.id ?? null
  const companyName = resFetchUser?.data?.users[0]?.user_company?.company_name ?? 'loading...'

  const resFetchOfficeVisit = useQuery(fetchOfficeVisitsGQL, {
    variables: { companyId, gteDateTo: getISOString(nowDate) }
  })
  const officeList: Office[] = resFetchOfficeVisit?.data?.offices ?? []
  const visitInfoList = createVisitInfoList(
    officeList.find(o => o.id === currentOfficeId)?.office_visits ?? []
  )

  if (currentOfficeId === 0 && officeList.length !== 0) {
    setCurrentOfficeId(officeList[0].id)
  }

  const handleChangeOfficeList = (e: SelectChangeEvent) => {
    setCurrentOfficeId(Number(e.target.value))
  }

  const onClickLogout = () => {
    setCurrentOfficeId(0)
    logout()
  }

  const onClickReload = () => setNowDate(new Date())

  const onClickRegister = () => {
    if (currentOfficeId !== 0) {
      setRegisterMode('on')
    } else {
      setRegisterMode('cannotOpen')
    }
  }

  const onClickCloseAlert = () => {
    setRegisterMode('off')
    setNowDate(new Date())
  }

  const registerVisitDialogProps = {
    userId: user?.sub ?? '',
    userName: resFetchUser?.data?.users[0]?.handle_name ?? '',
    officeId: currentOfficeId,
    officeName: officeList.find(o => o.id === currentOfficeId)?.office_name ?? 'Error',
    setRegisterMode,
  }

  const loading = resFetchUser.loading || resFetchOfficeVisit.loading
  return (
    <>
      {
        !loading &&
        (resFetchUser?.data?.users[0]?.user_company == null
        || resFetchUser?.data?.users[0]?.handle_name == null)
        && <SetupDialog userId={user?.sub} />
      }
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>{companyName}</Typography>
          <div style={{ flexGrow: 1 }}></div>
          <Button color='inherit' onClick={onClickLogout}><LogoutIcon />ログアウト</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <RegisterMessage open={registerMode === 'cannotOpen'} severity={'error'} message={'オフィスを選択してください。'} onClick={onClickCloseAlert} />
        <RegisterMessage open={registerMode === 'registerFailed'} severity={'error'} message={'登録が失敗しました。もう一度お試しください。'} onClick={onClickCloseAlert} />
        <RegisterMessage open={registerMode === 'registerCompleted'} severity={'success'} message={'出社登録が完了しました！'} onClick={onClickCloseAlert} />
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Select
            labelId='officeList'
            id='officeList'
            defaultValue={officeList.length !== 0 ? String(officeList[0].id) : ''}
            value={String(currentOfficeId)}
            label='オフィスを選択...'
            onChange={handleChangeOfficeList}
            sx={{ width: '90%', mr: 2 }}
          >
            {officeList.length === 0 && <MenuItem value={0}>loading...</MenuItem>}
            {officeList.map((office: Office, index) => <MenuItem defaultChecked={index === 0} key={office.id} value={office.id}>{office.office_name}</MenuItem>)}
          </Select>
          <Button disabled={loading} onClick={onClickReload} variant='contained'>
            {loading ? <CircularProgress /> : '更新'}
          </Button>
        </Box>
        {visitInfoList.map(
          (visitInfo: VisitInfo) => (<DailyVisitList key={visitInfo.visitDate} {...visitInfo} />)
        )}
        {visitInfoList.length === 0
          && companyId !== null
          && <Typography sx={{ textAlign: 'center', fontSize: 50 }}>訪問者なし！</Typography>
        }
      </Box>
      <SpeedDial
        onClick={onClickRegister}
        ariaLabel='registerVisit'
        icon={<SpeedDialIcon openIcon={<EditIcon />} />}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
      />
      {registerMode === 'on' && <RegisterVisitDialog {...registerVisitDialogProps} />}
      <BD open={loading} />
    </>
  )
}

const BD = ({ open }: { open: boolean }) => (
  <Backdrop
    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    open={open}
  >
    <CircularProgress color='inherit' />
  </Backdrop>
)

export default RoutePage
