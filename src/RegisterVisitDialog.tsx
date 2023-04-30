import { useState, forwardRef, Dispatch, SetStateAction } from 'react'
import { useMutation } from '@apollo/client'

import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  LinearProgress,
  Slide,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import  CloseIcon from '@mui/icons-material/Close';
import { DatePicker, LocalizationProvider, TimeField } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { getISOString, getAlertMessage } from './methods';

import { registerVisitGQL } from './queries';

const steps = [
  '登録種別の選択',
  '日時の入力',
  'ハンドルネームを入力',
];

type Props = {
  officeId: number
  officeName: string
  setRegisterMode: Dispatch<SetStateAction<string>>
}

type ChooseVisitTypeProps = {
  setNowInOffice: Dispatch<SetStateAction<boolean>>
  setActiveStep: Dispatch<SetStateAction<number>>
}

type SetDateTimeProps = {
  nowInOffice: boolean
  selectedDateFrom: Date|null
  selectedDateTo: Date|null
  setSelectedDateFrom: Dispatch<SetStateAction<Date|null>>
  setSelectedDateTo: Dispatch<SetStateAction<Date|null>>
}

type SetHandleNameProps = {
  handleName: string
  setHandleName: Dispatch<SetStateAction<string>>
  setCanNextStep: Dispatch<SetStateAction<boolean>>
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ChooseVisitType = ({ setNowInOffice, setActiveStep }: ChooseVisitTypeProps) => {
  const onClick = (nowInOffice: boolean) => {
    setNowInOffice(nowInOffice)
    setActiveStep((state) => state + 1)
  }
  return (
    <Container maxWidth="xs">
      <Typography variant='h5' textAlign={'center'}>今、オフィスにいますか？</Typography>
      <Button onClick={() => onClick(true)} fullWidth variant='contained' color='success' sx={{ my: 3, fontSize: 30 }}>いる！</Button>
      <br />
      <Button onClick={() => onClick(false)} fullWidth variant='contained' color='warning' sx={{ my: 3, fontSize: 30 }}>後で行く</Button>
    </Container>
  )
}

const SetDateTime = (props: SetDateTimeProps) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container maxWidth="xs">
      <Typography variant='h6' textAlign={'center'} sx={{ mb: 3 }}>
        {props.nowInOffice ? '何時までオフィスにいますか？' : 'いつ、オフィスに行きますか？'}
      </Typography>
      <DatePicker
        value={props.selectedDateFrom}
        disabled={props.nowInOffice}
        onChange={(newDate) => props.setSelectedDateFrom(newDate)}
        sx={{ width: '100%', my: 2 }}
        label="出社予定日"
      />
      <TimeField
        value={props.selectedDateFrom}
        disabled={props.nowInOffice}
        onChange={(newValue) => props.setSelectedDateFrom(newValue)}
        format="HH:mm"
        sx={{ width: '100%', my: 3 }}
        label="出社予定時間"
      />
      <TimeField
        value={props.selectedDateTo}
        onChange={(newValue) => props.setSelectedDateTo(newValue)}
        format="HH:mm"
        sx={{ width: '100%', my: 3 }}
        label="退社予定時間"
      />
    </Container>
  </LocalizationProvider>
)

const SetHandleName = ({ handleName, setHandleName, setCanNextStep }: SetHandleNameProps) => {
  const [error, setError] = useState(false)
  const [helperText, setHelperText] = useState<string|null>('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHelperText = getAlertMessage(e.target.value)
    if (newHelperText === null) {
      setError(false)
      setCanNextStep(true)
    } else {
      setError(true)
      setCanNextStep(false)
    }
    setHelperText(newHelperText)
    setHandleName(e.target.value)
  }

  return (
    <Container  maxWidth="xs">
      <Typography variant='h6' textAlign={'center'} sx={{ mb: 3 }}>
        表示する名前を入力してください。
      </Typography>
      <TextField
        value={handleName}
        error={error}
        helperText={helperText}
        onChange={onChange}
        label="ハンドルネーム"
        sx={{ width: '100%', my: 6 }}
      />
    </Container>
  )
}

const RegisterVisitDialog = ({ officeId, officeName, setRegisterMode }: Props) => {
  const [activeStep, setActiveStep] = useState(0)
  const [nowInOffice, setNowInOffice] = useState(true)
  const [canNextStep, setCanNextStep] = useState(false)
  const [selectedDateFrom, setSelectedDateFrom] = useState<Date|null>(new Date())
  const [selectedDateTo, setSelectedDateTo] = useState<Date|null>(new Date())
  const [handleName, setHandleName] = useState('')

  const setDateTimeProps = { nowInOffice, selectedDateFrom, selectedDateTo, setSelectedDateFrom, setSelectedDateTo }

  const [registerVisit] = useMutation(registerVisitGQL)

  const onClickNext = () => {
    setActiveStep((state) => state + 1)
    if (activeStep === 2) {
      registerVisit({
        variables: {
          officeId,
          visitorName: handleName,
          visitDateTimeFrom: getISOString(selectedDateFrom),
          visitDateTimeTo: `${getISOString(selectedDateFrom).split('T')[0]}T${getISOString(selectedDateTo).split('T')[1]}`,
        }
      }).then((result) => {
        if (result.errors !== undefined) {
          setRegisterMode('registerFailed')
        } else if (result.data.insert_visit !== undefined) {
          setRegisterMode('registerCompleted')
        }
      })
    }
  }

  return (
    <Dialog fullScreen open TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setRegisterMode('off')}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            出社登録 : {officeName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mx: 1, my: 3 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={index} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Typography sx={{ mx: 1, my: 2 }}>
          {activeStep < steps.length ? 'Step ' + (activeStep + 1) : 'Finished!'}
        </Typography>

        {activeStep === 0 && <ChooseVisitType {...{setNowInOffice, setActiveStep}} />}
        {activeStep === 1 && <SetDateTime {...setDateTimeProps} />}
        {activeStep === 2 && <SetHandleName {...{handleName, setHandleName, setCanNextStep}} />}
        {activeStep === 3 && (<>
          <Typography  variant='h4' textAlign={'center'} sx={{ mb: 3 }}>
            登録中です...
          </Typography>
          <LinearProgress />
        </>)}

        {activeStep !== 0 && activeStep <= 2 && (
          <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              onClick={() => setActiveStep((state) => state - 1)}
              disabled={activeStep === 0}
              fullWidth
              variant="contained"
              color="error"
              sx={{ mr: 2, fontSize: 20 }}
            >
              Back
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              onClick={onClickNext}
              disabled={!canNextStep && activeStep !== 1}
              fullWidth
              variant="contained"
              sx={{ ml: 2, fontSize: 20 }}
            >
              NEXT
            </Button>
          </Container>
        )}
      </Box>
    </Dialog>
  )
}

export default RegisterVisitDialog
