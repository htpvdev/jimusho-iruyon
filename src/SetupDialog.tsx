import { useState, useRef } from 'react'
import { useQuery, useLazyQuery, useMutation } from '@apollo/client'

import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider/Divider'
import { Step, StepLabel, Stepper } from '@mui/material'

import { fetchCompanyGQL, fetchUserGQL, setCompanyGQL, setHandleNameGQL } from './queries'
import { getAlertMessage } from './methods'

const steps = [
  '会社ログイン',
  'ハンドルネームを入力',
]

type Props = {
  userId?: string
}

const SetupDialog = ({ userId }: Props) =>  {
  const companyCodeRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const handleNameRef = useRef<HTMLInputElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [helperText, setHelperText] = useState<string|null>(null)


  const resFetchUser = useQuery(fetchUserGQL, { variables: { id: userId } })


  const [ fetchCompany, resFetchCompany ]
  = useLazyQuery(fetchCompanyGQL)

  const [setCompanyId] = useMutation(setCompanyGQL)
  const [setUserHandleName] = useMutation(setHandleNameGQL)

  const loading = resFetchCompany.loading

  const onClickLogin = () => {
    fetchCompany({
      variables: {
        companyCode: companyCodeRef?.current?.value,
        hashedPassword: passwordRef.current?.value
      }
    }).then(async (res) => {
      if (res.data.companies.length === 1) {
        await setCompanyId({ variables: { userId, companyId: res.data.companies[0].id } })
        setActiveStep(1)
      }
    })
  }

  const onClickHandleName = () => {
    setUserHandleName({
      variables: { userId, handleName: handleNameRef.current?.value }
    }).then((res) => {
      if (res?.data?.update_users_by_pk?.company_id !== null) {
        resFetchUser.refetch()
      }
    })
  }

  console.log(resFetchCompany.data)

  return (
    <Dialog open={true}>
      <DialogTitle>
        {loading && <CircularProgress size={15} sx={{ mr: 1 }} />}
        ご利用前に、初回設定が必要です。
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <DialogContentText sx={{ mx: 1, my: 2 }}>
          {activeStep < steps.length ? 'Step ' + (activeStep + 1) : 'Finished!'}
        </DialogContentText>
        {activeStep === 0 && (
          <>
            <DialogContentText sx={{ mx: 1, px: 0 }}>
              会社コードと会社パスワードを入力してください。
            </DialogContentText>
            {(resFetchCompany.error !== undefined || resFetchCompany?.data?.companies?.length === 0) && (
              <DialogContentText sx={{ mx: 1, px: 0 }} style={{ color: 'red' }}>
                パスワードまたは会社ナンバーが違います
              </DialogContentText>
            )}
            <TextField
              autoFocus
              margin='dense'
              id='companyName'
              label='会社コード'
              type='text'
              fullWidth
              variant='standard'
              inputRef={companyCodeRef}
              sx={{ mx: 1, px: 0 }}
            />
            <TextField
              autoFocus
              margin='dense'
              id='password'
              label='会社パスワード'
              type='password'
              fullWidth
              variant='standard'
              inputRef={passwordRef}
              sx={{ mx: 1, px: 0 }}
            />
            <DialogActions>
              <Button onClick={onClickLogin}>会社ログイン</Button>
            </DialogActions>
          </>
        )}
        {activeStep === 1 && (
          <>
            <DialogContentText variant='h6' textAlign={'center'} sx={{ mx: 1 }}>
              表示する名前を入力してください。
            </DialogContentText>
            <TextField
              inputRef={handleNameRef}
              error={helperText !== null}
              helperText={helperText}
              onChange={(e) => setHelperText(getAlertMessage(e.target.value))}
              label='ハンドルネーム'
              sx={{ width: '100%', my: 2 }}
            />
            <DialogActions>
              <Button
                disabled={helperText !== null || handleNameRef.current?.value == ''}
                onClick={onClickHandleName}>ハンドルネーム登録
              </Button>
            </DialogActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SetupDialog