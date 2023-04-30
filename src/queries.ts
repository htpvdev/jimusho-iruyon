import { gql } from '@apollo/client'

export const fetchCompanyGQL = gql`
  query getCompanyById($id: Int!) {
    company(where: {id: {_eq: $id}}) {
      id,
      companyName,
      hashedPassword,
    }
  }
`

export const fetchOfficeVisitsGQL = gql`
  query getOfficeVisitsByCompanyId($companyId: Int!, $gteDateTo: timestamp!) {
    office(where: {companyId: {_eq: $companyId}}) {
      id,
      officeName,
      companyId,
      officeVisits(where: {visitDateTimeTo: { _gte: $gteDateTo }}) {
        visitorName
        visitDateTimeFrom
        visitDateTimeTo
      }
    }
  }
`

export const registerVisitGQL = gql`
  mutation registerVisit (
    $officeId: Int!,
    $visitorName: bpchar!,
    $visitDateTimeFrom: timestamp!,
    $visitDateTimeTo: timestamp!
  ) {
    insert_visit(objects: [
      {
        officeId: $officeId,
        visitorName: $visitorName,
        visitDateTimeFrom: $visitDateTimeFrom,
        visitDateTimeTo: $visitDateTimeTo,
      }
    ]) { returning { officeId } }
  }
`
