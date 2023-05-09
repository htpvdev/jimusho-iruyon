import { useState } from 'react'
import { useMutation } from '@apollo/client'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Delete } from '@mui/icons-material'

import { nowInOffice, getTimeLabel } from './methods'
import { deleteVisitGQL } from './queries'
import { Visit } from './types'

type Props = {
  handleName: string
  visitDate: string
  visitList: Visit[]
  refetch: () => Promise<any>
}

const DailyVisitList = ({ handleName, visitDate, visitList, refetch }: Props) => {
  const [open, setOpen] = useState(false)
  const [deleteTargetOfficeId, setDeleteTargetOfficeId] = useState(0)
  const [deleteTargetVisitDateTimeFrom, setDeleteTargetVisitDateTimeFrom] = useState('')

  // 本日であれば、日付の後ろに「(本日)」と表示する
  const today = `${new Date().getFullYear()}/${new Date().getMonth()+1}/${new Date().getDate()}`
  const visitDateText = String(visitDate) + (new Date(visitDate).getTime() === new Date(today).getTime() ? ' (本日)' : '')

  const [deleteVisit] = useMutation(deleteVisitGQL)

  const onClickDeleteButton = (visit: Visit) => {
    setDeleteTargetOfficeId(visit.office_id)
    setDeleteTargetVisitDateTimeFrom(visit.visit_datetime_from ?? '')
    setOpen(true)
  }

  const onClickDelete = () => {
    deleteVisit({
      variables: {
        officeId: deleteTargetOfficeId,
        visitDateTimeFrom: deleteTargetVisitDateTimeFrom,
        handleName: handleName,
      }
    }).then(() => {
      refetch()
    })
  }

  return (
    <Accordion defaultExpanded sx={{ p: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls='panel1a-content'
        id='panel1a-header'
      >
        <Typography>{ visitDateText }</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {
          visitList.map((visit) => {
            const isInOffice = nowInOffice(visit)
            return (
              <Card
                key={visit.user_handle_name + visit.visit_datetime_from}
                sx={{ m: 1, bgcolor: isInOffice ? 'lightgreen' : 'orange' }}
              >
                <CardContent>
                  <Typography>
                    {`【${isInOffice ? '在社中' : '出社予定'}】 ${visit.user_handle_name}`}
                  {
                    handleName === visit.user_handle_name &&
                    <Button color='inherit' sx={{ ml: 3 }} onClick={() => onClickDeleteButton(visit)}><Delete /></Button>
                  }
                  </Typography>
                  <Typography>
                    {getTimeLabel(visit.visit_datetime_from)} - {getTimeLabel(visit.visit_datetime_to)}
                  </Typography>
                </CardContent>
              </Card>
            )
          })
        }
      </AccordionDetails>
      <Dialog open={open}>
        <Box sx={{ mx: 1, my: 3 }}>
          <Typography sx={{ mx: 1, my: 2 }}>
            この出社登録を削除しますか？
          </Typography>

          <Box maxWidth='xs' sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              onClick={() => setOpen(false)}
              fullWidth
              variant='outlined'
              color='error'
              sx={{ mr: 2, fontSize: 20 }}
            >
              いいえ
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button
              onClick={onClickDelete}
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
    </Accordion>
  )
}

export default DailyVisitList
