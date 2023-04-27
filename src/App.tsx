import { useState, ChangeEvent, useEffect } from 'react'
// import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import './App.css'

import bcrypt from 'bcryptjs';

console.log(bcrypt.hashSync('123456', 10));

function App() {
  const [inputPassword, setInputPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hashedPassword, setHashedPassword] = useState('hashing...')
  const [result, setResult] = useState('確認中...')

  useEffect(() => {
    const f = async () => {
      setHashedPassword(await bcrypt.hash(inputPassword, 8))
    }
    f()
  }, [inputPassword])

  useEffect(() => {
    const f = async () => {
      setResult(await bcrypt.compare(confirmPassword, hashedPassword)?'合致':'不一致')
    }
    f()
  }, [confirmPassword, hashedPassword])

  return (
    <>
      <TextField
        label='パスワードを入力してね'
        variant='outlined'
        onChange={(event) => setInputPassword(event.target.value)}
      />
      <TextField
        label='パスワードを入力してね(確認)'
        variant='outlined'
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      {/* <Button variant="contained" >
        ハッシュ化
      </Button> */}
      <p>パスワード平文: {inputPassword}</p>
      <p>パスワード平文(確認):{confirmPassword}</p>
      <p>ハッシュ化: {hashedPassword}</p>
      <p>パスワード合致してるかどうか: {result}</p>
    </>
  )
}

export default App
