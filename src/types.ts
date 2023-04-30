
export type Visit = {
  visitorName: string
  visitDateTimeFrom: string
  visitDateTimeTo: string
}

export type Office = {
  id: number
  officeName: string
  companyId: number
  officeVisits: Visit[]
}

export type VisitInfo = {
  visitDate: string
  visitList: Visit[]
}
