import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useAuth0 } from '@auth0/auth0-react'

import AppBar from '@mui/material/AppBar'
import Backdrop from '@mui/material/Backdrop'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import AccountCircle from '@mui/icons-material/AccountCircle'
import EditIcon from '@mui/icons-material/Edit'

import DailyVisitList from './DailyVisitList'
import RegisterMessage from './RegisterMessage'
import RegisterVisitDialog from './RegisterVisitDialog'
import SetupDialog from './SetupDialog'
import { getISOString, createVisitInfoList, getAlertMessage } from './methods'
import { fetchOfficeVisitsGQL, fetchUserGQL, resetCompanyGQL, setHandleNameGQL } from './queries'
import { Office, VisitInfo } from './types'

const RoutePage = () => {
  const { user, logout } = useAuth0()

  //#region State定義
  const [nowDate, setNowDate] = useState(new Date())
  const [currentOfficeId, setCurrentOfficeId] = useState<number>(0)
  const [dialogState, setDialogState] = useState<string>('off')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [inputHandleName, setInputHandleName] = useState<string|null>(null)
  //#endregion State定義

  //#region GraphQLデータ関連
  const [resetCompany, resResetCompany] = useMutation(resetCompanyGQL)
  const [resetHandleName, resResetHandleName] = useMutation(setHandleNameGQL)

  const resFetchUser = useQuery(fetchUserGQL, {
    variables: { id: user?.sub }
  })
  const handleName = resFetchUser?.data?.users[0]?.handle_name ?? null
  const companyId = resFetchUser?.data?.users[0]?.user_company?.id ?? null
  const companyName = resFetchUser?.data?.users[0]?.user_company?.company_name ?? 'loading...'

  const resFetchOfficeVisit = useQuery(fetchOfficeVisitsGQL, {
    variables: { companyId, gteDateTo: getISOString(nowDate) }
  })
  const officeList: Office[] = resFetchOfficeVisit?.data?.offices ?? []
  const visitInfoList = createVisitInfoList(
    officeList.find(o => o.id === currentOfficeId)?.office_visits ?? []
  )
  //#endregion GraphQLデータ関連

  const registerVisitDialogProps = {
    userId: user?.sub ?? '',
    userName: handleName ?? 'unknown',
    officeId: currentOfficeId,
    officeName: officeList.find(o => o.id === currentOfficeId)?.office_name ?? 'Error',
    setDialogState,
  }

  const loading = resFetchUser.loading
  || resFetchOfficeVisit.loading
  || resResetCompany.loading
  || resResetHandleName.loading

  if (currentOfficeId === 0 && officeList.length !== 0) {
    setCurrentOfficeId(officeList[0].id)
  }

  //#region イベント関数
  const handleChangeOfficeList = (e: SelectChangeEvent) => {
    setCurrentOfficeId(Number(e.target.value))
  }

  const onClickLogout = () => {
    setAnchorEl(null)
    setCurrentOfficeId(0)
    logout()
  }

  const onClickCompanyLogout = () => {
    resetCompany({ variables: { userId: user?.sub } }).then(() => {
      setDialogState('off')
      setAnchorEl(null)
      setCurrentOfficeId(0)
      resFetchUser.refetch()
      resFetchOfficeVisit.refetch()
    })
  }

  const onClickReload = () => setNowDate(new Date())

  const onClickRegister = () => {
    if (currentOfficeId !== 0) {
      setDialogState('visitRegisterOn')
    } else {
      setDialogState('officeUnSelected')
    }
  }

  const onClickCloseAlert = () => {
    setDialogState('off')
    setNowDate(new Date())
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const onClickHandleNameReset = () => {
    resetHandleName({ variables: {
      userId: user?.sub,
      handleName: inputHandleName,
    }}).then(() => {
      setInputHandleName(null)
      setDialogState('off')
      resFetchUser.refetch()
      resFetchOfficeVisit.refetch()
    })
  }
  //#endregion イベント関数

  return (
    <>
      {
        !loading &&
        ( companyName === 'loading...' || handleName === null )
        && <SetupDialog userId={user?.sub} />
      }
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6'>{companyName}</Typography>
          <div style={{ flexGrow: 1 }}></div>
          <Typography variant='h6'>{handleName}</Typography>
          {/* <Button color='inherit' onClick={onClickLogout}><LogoutIcon />ログアウト</Button> */}
          <IconButton
              size='large'
              edge='end'
              aria-label='アカウント設定'
              aria-haspopup='true'
              onClick={handleMenu}
              color='inherit'
            >
              <AccountCircle />
            </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <RegisterMessage open={dialogState === 'officeUnSelected'} severity={'error'} message={'オフィスを選択してください。'} onClick={onClickCloseAlert} />
        <RegisterMessage open={dialogState === 'registerFailed'} severity={'error'} message={'登録が失敗しました。もう一度お試しください。'} onClick={onClickCloseAlert} />
        <RegisterMessage open={dialogState === 'registerCompleted'} severity={'success'} message={'出社登録が完了しました！'} onClick={onClickCloseAlert} />
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
          (visitInfo: VisitInfo) => (<DailyVisitList key={visitInfo.visitDate} handleName={handleName} {...visitInfo} refetch={resFetchOfficeVisit.refetch} />)
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
      {/* アカウントボタン押下じのメニュー */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setDialogState('handleNameResetOn')
            setAnchorEl(null)
          }}
        >ハンドルネームの再設定</MenuItem>
        <MenuItem
          onClick={() => {
            setDialogState('logoutOn')
            setAnchorEl(null)
          }}
        >会社ログアウト</MenuItem>
        <MenuItem onClick={onClickLogout}>ログアウト</MenuItem>
      </Menu>
      {/* 出社登録ダイアログ */}
      {dialogState === 'visitRegisterOn' && <RegisterVisitDialog {...registerVisitDialogProps} />}
      {/* 会社ログアウト確認ダイアログ */}
      <Dialog open={dialogState === 'logoutOn'}>
        <Box sx={{ mx: 1, my: 3 }}>
          <Typography sx={{ mx: 1, my: 2 }}>
            ログアウトすると、再度会社コードとパスワードを入力する必要があります。
          </Typography>
          <Typography sx={{ mx: 1, my: 2 }}>
            本当にログアウトしますか？
          </Typography>

          <Box maxWidth='xs' sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              onClick={() => setDialogState('off')}
              fullWidth
              variant='outlined'
              color='error'
              sx={{ mr: 2, fontSize: 20 }}
            >
              いいえ
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              onClick={onClickCompanyLogout}
              fullWidth
              variant='contained'
              color='error'
              sx={{ ml: 2, fontSize: 20 }}
            >
              はい
            </Button>
          </Box>
        </Box>
      </Dialog>
      {/* ハンドルネーム再設定ダイアログ */}
      <Dialog open={dialogState === 'handleNameResetOn'}>
        <DialogContentText variant='h6' textAlign={'center'} sx={{ m: 1 }}>
          表示する名前を<br />入力してください。
        </DialogContentText>
        <TextField
          onChange={(e) => setInputHandleName(e.target.value)}
          error={getAlertMessage(inputHandleName) !== null}
          helperText={getAlertMessage(inputHandleName)}
          label='ハンドルネーム'
          sx={{ m: 2 }}
        />
        <DialogActions>
          <Button onClick={() => setDialogState('off')}>キャンセル</Button>
          <div style={{ flexGrow: 1 }}></div>
          <Button
            disabled={getAlertMessage(inputHandleName) !== null || inputHandleName === null}
            onClick={onClickHandleNameReset}
          >
            ハンドルネーム再設定
          </Button>
        </DialogActions>
      </Dialog>
      {/* ローディング画面表示 */}
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
