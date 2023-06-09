import { Visit, VisitInfo } from './types'

export const nowInOffice = (visit: Visit) => {
  const nowDate = new Date()
  return (
    new Date(visit.visit_datetime_from) <= nowDate
    && nowDate <= new Date(visit.visit_datetime_to)
  )
}

export const getTimeLabel = (dateTimeStr: string) => {
  const date = new Date(dateTimeStr)
  return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2)
}

export const getISOString = (date: Date|null): string => {
  if (!date) return ''

  const month = `0${date.getMonth()+1}`.slice(-2)
  const day = `0${date.getDate()}`.slice(-2)
  const hour = `0${date.getHours()}`.slice(-2)
  const minutes = `0${date.getMinutes()}`.slice(-2)

  return `${date.getFullYear()}-${month}-${day}T${hour}:${minutes}:00.000`
}

export const getAlertMessage = (handleName: string|null): string|null => {
  if (handleName === null) return null
  if (handleName === '') return 'ハンドルネームを入力してください'
  if (handleName.length > 20) return 'ハンドルネームは20文字以内で入力してください'
  return null
}

export const createVisitInfoList = (visits: Visit[]): VisitInfo[] => {
  const visitDateList: string[] = [
    ...new Set(
      visits.map(visit => visit.visit_datetime_to.split('T')[0])
    )
  ]

  const visitInfoList: VisitInfo[] = visitDateList.map((visitDate) => {
    const date = new Date(visitDate)
    const visitList = visits.filter((visit) => {
      return date.getTime() === new Date(visit.visit_datetime_to.split('T')[0]).getTime()
    })

    return {
      visitDate: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`,
      visitList,
    }
  })

  return visitInfoList
}
