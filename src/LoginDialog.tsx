import { useState, useRef, Dispatch, SetStateAction } from 'react'
import bcrypt from 'bcryptjs';
import { gql, useQuery } from '@apollo/client';

// Material UI
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const fetchCompanyGQL = gql`
  query getCompanyById($id: Int!) {
    company(where: {id: {_eq: $id}}) {
      id,
      companyName,
      hashedPassword,
    }
  }
`

type Props = {
  loginState: string
  setLoginState: Dispatch<SetStateAction<string>>
  setCompanyId: Dispatch<SetStateAction<number>>
  setCompanyName: Dispatch<SetStateAction<string>>
}

const LoginDialog = ({ loginState, setLoginState, setCompanyId, setCompanyName }: Props) =>  {
  const [loginSwitch, setLoginSwitch] = useState(false)

  const idRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const { loading, error, data } = useQuery(fetchCompanyGQL, { variables: { id: idRef.current?.value } })

  console.log(data)

  if (
    data?.company?.length === 1
    && !loading
    && !error
    && loginSwitch
  ) {
    // ハッシュ化されたパスワードと入力されたパスワードを比較(非同期)
    bcrypt.compare(passwordRef.current?.value ?? '', data?.company[0]?.hashedPassword ?? '')
    .then((isCollect) => {
      if (isCollect) {
        console.log('login success')
        setLoginState('logged in')
        setCompanyId(data.company[0].id)
        setCompanyName(data.company[0].companyName)
      } else {
        console.log('login failed')
        setLoginState('failed')
      }
      setLoginSwitch(false)
    })
  }

  const handleClose = () => {
    setLoginState('logged in')
  }

  return (
    <Dialog open={loginState !== 'logged in'} onClose={handleClose}>
      <DialogTitle>ログイン</DialogTitle>
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
        <Button onClick={() => setLoginSwitch(true)}>ログイン</Button>
      </DialogActions>
    </Dialog>
  )
}

export default LoginDialog