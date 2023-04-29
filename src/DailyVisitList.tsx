import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

type Visit = {
  visitorName: string
  visitDateTimeFrom: string
  visitDateTimeTo: string
}

type Props = {
  visitDate: string
  visitList: Visit[]
}

const nowInOffice = (visit: Visit) => {
  const nowDate = new Date()
  return (
    new Date(visit.visitDateTimeFrom) <= nowDate
    && nowDate <= new Date(visit.visitDateTimeTo)
  )
}

const getTimeLabel = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
}

const DailyVisitList = ({ visitDate, visitList }: Props) => {

  // 本日であれば、日付の後ろに「(本日)」と表示する
  const today = `${new Date().getFullYear()}/${new Date().getMonth()+1}/${new Date().getDate()}`
  const visitDateText = String(visitDate) + (new Date(visitDate).getTime() === new Date(today).getTime() ? ' (本日)' : '')

  return (
    <Accordion defaultExpanded sx={{ p: 2 }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{ visitDateText }</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {
          visitList.map((visit) => {
            const isInOffice = nowInOffice(visit)
            return (
            // <Card key={visitor.id} sx={{ bgcolor: 'lightgreen', mb: 1 }}>
            <Card
              key={visit.visitorName + visit.visitDateTimeFrom}
              sx={{ m: 1, bgcolor: isInOffice ? 'lightgreen' : 'orange' }}
            >
              <CardContent>
                <Typography>
                  {`【${isInOffice ? '在社中' : '出社予定'}】 ${visit.visitorName}`}
                  <Typography sx={ {textAlign: 'right'} }>
                    {getTimeLabel(visit.visitDateTimeFrom)} - {getTimeLabel(visit.visitDateTimeTo)}
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
            )
          })
        }
      </AccordionDetails>
    </Accordion>
  )
}

export default DailyVisitList
