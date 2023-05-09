
export type Visit = {
  office_id: number
  user_handle_name: string
  visit_datetime_from: string
  visit_datetime_to: string
}

export type Office = {
  id: number
  office_name: string
  company_id: number
  office_visits: Visit[]
}

export type VisitInfo = {
  visitDate: string
  visitList: Visit[]
}
