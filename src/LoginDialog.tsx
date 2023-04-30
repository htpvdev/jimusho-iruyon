import { useRef, Dispatch, SetStateAction } from 'react'
import { useLazyQuery } from '@apollo/client'
import bcrypt from 'bcryptjs'

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material'

import { fetchCompanyGQL } from './queries'

type Props = {
  loginState: string
  setLoginState: Dispatch<SetStateAction<string>>
  setCompanyId: Dispatch<SetStateAction<number|null>>
  setCompanyName: Dispatch<SetStateAction<string>>
}

const LoginDialog = ({ loginState, setLoginState, setCompanyId, setCompanyName }: Props) =>  {
  const idRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const [ fetchCompanyById, { loading, error, data } ]
  = useLazyQuery(fetchCompanyGQL, { variables: { id: idRef.current?.value } })

  if (
    data?.company?.length === 1
    && error === undefined
  ) {
    // ハッシュ化されたパスワードと入力されたパスワードを比較(非同期)
    bcrypt.compare(passwordRef.current?.value ?? '', data?.company[0]?.hashedPassword ?? '')
    .then((isCollect) => {
      if (isCollect && passwordRef.current?.value !== '') {
        setLoginState('logged in')
        setCompanyName(data.company[0].companyName)
        setCompanyId(data.company[0].id)
      } else {
        setLoginState('failed')
      }
    })
  }

  return (
    <Dialog open={loginState !== 'logged in'}>
      <DialogTitle>
        {loading && <CircularProgress size={15} sx={{ mr: 1 }} />}
        ログイン
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          会社ナンバーとパスワードを入力してください。
        </DialogContentText>
        {loginState === 'failed' && <DialogContentText style={{ color: 'red' }}
          >
            パスワードまたは会社ナンバーが違います
          </DialogContentText>
        }
        <TextField
          autoFocus
          margin='dense'
          id='companyName'
          label='会社ナンバー'
          type='number'
          fullWidth
          variant='standard'
          inputRef={idRef}
        />
        <TextField
          autoFocus
          margin='dense'
          id='password'
          label='パスワード'
          fullWidth
          variant='standard'
          inputRef={passwordRef}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => fetchCompanyById()}>ログイン</Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoginDialog