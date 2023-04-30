import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  Typography
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

import { Visit } from './types'
import { nowInOffice, getTimeLabel } from './methods'

type Props = {
  visitDate: string
  visitList: Visit[]
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
              <Card
                key={visit.visitorName + visit.visitDateTimeFrom}
                sx={{ m: 1, bgcolor: isInOffice ? 'lightgreen' : 'orange' }}
              >
                <CardContent>
                  <Typography>
                    {`【${isInOffice ? '在社中' : '出社予定'}】 ${visit.visitorName}`}
                  </Typography>
                  <Typography sx={ {textAlign: 'right'} }>
                    {getTimeLabel(visit.visitDateTimeFrom)} - {getTimeLabel(visit.visitDateTimeTo)}
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
