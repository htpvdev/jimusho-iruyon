import { useState, Dispatch, SetStateAction, useEffect } from 'react'
import { useQuery } from '@apollo/client'

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
import RegisterVisitDialog from './RegisterVisitDialog'
import RegisterMessage from './RegisterMessage'
import { getISOString, createVisitInfoList } from './methods'
import { fetchOfficeVisitsGQL } from './queries'
import { Office, VisitInfo } from './types'

type Props = {
  companyId: number|null
  companyName: string
  setCompanyId: Dispatch<SetStateAction<number|null>>
  setCompanyName: Dispatch<SetStateAction<string>>
  setLoginState: Dispatch<SetStateAction<string>>
}

const RoutePage = ({ companyId, companyName, setCompanyId, setCompanyName, setLoginState }: Props) => {
  const [nowDate, setNowDate] = useState(new Date())
  const [currentOfficeId, setCurrentOfficeId] = useState<number>(0)
  const [registerMode, setRegisterMode] = useState<string>('off')

  const { data, loading, refetch } = useQuery(fetchOfficeVisitsGQL, {
    variables: {
      companyId,
      gteDateTo: getISOString(nowDate),
    }
  })

  // visitテーブルのデータを加工する処理
  const visitInfoList = createVisitInfoList(
    (data?.office ?? []).find((o: Office) => o.id === currentOfficeId)?.officeVisits ?? []
  )

  const handleChangeOfficeList = (e: SelectChangeEvent) => {
    setCurrentOfficeId(Number(e.target.value))
  }

  const onClickLogout = () => {
    setCurrentOfficeId(0)
    setCompanyId(null)
    setCompanyName('loading...')
    setLoginState('logged out')
  }

  const onClickReload = () => setNowDate(new Date())

  const onClickRegister = () => {
    if (currentOfficeId !== 0) {
      setRegisterMode('on')
    } else {
      setRegisterMode('cannotOpen')
    }
  }

  const registerVisitDialogProps = {
    officeId: currentOfficeId,
    officeName: (data?.office ?? []).find((o: Office) => o.id === currentOfficeId)?.officeName ?? 'Error',
    setRegisterMode,
  }

  useEffect(() => {
    if (registerMode === 'registerCompleted') {
      refetch().then(() => setCurrentOfficeId(currentOfficeId))
    }
  }, [registerMode, refetch])

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{companyName}</Typography>
          <div style={{ flexGrow: 1 }}></div>
          <Button color="inherit" onClick={onClickLogout}><LogoutIcon />ログアウト</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <RegisterMessage open={registerMode === 'cannotOpen'} severity={'error'} message={'オフィスを選択してください。'} onClick={() => setRegisterMode('off')} />
        <RegisterMessage open={registerMode === 'registerFailed'} severity={'error'} message={'登録が失敗しました。もう一度お試しください。'} onClick={() => setRegisterMode('off')} />
        <RegisterMessage open={registerMode === 'registerCompleted'} severity={'success'} message={'出社登録が完了しました！'} onClick={() => setRegisterMode('off')} />
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Select
            labelId="officeList"
            id="officeList"
            defaultValue={(data?.office ?? []).length !== 0 ? data.office[0].id : ''}
            value={String(currentOfficeId)}
            label="オフィスを選択..."
            onChange={handleChangeOfficeList}
            sx={{ width: '90%', mr: 2 }}
          >
            {(data?.office ?? []).length === 0 && <MenuItem value={0}>loading...</MenuItem>}
            {(data?.office as Array<Office> ?? []).map((office: Office, index) => <MenuItem defaultChecked={index === 0} key={office.id} value={office.id}>{office.officeName}</MenuItem>)}
          </Select>
          <Button disabled={loading} onClick={onClickReload} variant="contained">
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
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

export default RoutePage
