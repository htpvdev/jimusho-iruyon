import Alert, { AlertColor } from '@mui/material/Alert';
import { Collapse, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean
  severity: AlertColor
  title?: string
  message: string
  onClick: () => void
}

const RegisterMessage = ({ open, severity, message, onClick }: Props) => (
  <Collapse in={open}>
    <Alert
      severity={severity}
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={onClick}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{ mb: 2 }}
    >
      {message}
    </Alert>
  </Collapse>
)

export default RegisterMessage
