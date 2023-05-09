import { gql } from '@apollo/client'

export const fetchUserGQL = gql`
  query getUserById($id: String!) {
    users(where: {id: {_eq: $id}}) {
      id,
      name,
      handle_name,
      user_company {
        id,
        company_name,
        company_code,
      },
    }
  }
`

export const fetchCompanyGQL = gql`
  query getCompany(
    $companyCode: String!,
    $hashedPassword: String!,
  ) {
    companies(where: {
      _and: [
        {company_code: {_eq: $companyCode}},
        {hashed_password: {_eq: $hashedPassword}},
      ]
    }) {
      id,
      company_name,
    }
  }
`

export const setCompanyGQL = gql`
  mutation setCompanyId (
    $userId: String!,
    $companyId: Int!,
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId },
      _set: { company_id: $companyId }
    ) { company_id }
  }
`

export const resetCompanyGQL = gql`
  mutation resetCompanyId (
    $userId: String!,
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId },
      _set: {
        company_id: null,
        handle_name: null,
      }
    ) { company_id }
  }
`

export const setHandleNameGQL = gql`
  mutation setHandleName (
    $userId: String!,
    $handleName: String!,
  ) {
    update_users_by_pk(
      pk_columns: { id: $userId },
      _set: { handle_name: $handleName }
    ) { company_id }
    update_visits(
      where: {}
      _set: { user_handle_name: $handleName }
    )
    {
      affected_rows
    }
  }
`

export const fetchOfficeVisitsGQL = gql`
  query getOfficeVisitsByCompanyId($companyId: Int!, $gteDateTo: timestamp!) {
    offices(where: {company_id: {_eq: $companyId}}) {
      id,
      office_name,
      company_id,
      office_visits(
        where: {visit_datetime_to: { _gte: $gteDateTo }},
        order_by: {visit_datetime_from: asc}
      ) {
        office_id
        visit_datetime_from
        visit_datetime_to
        user_handle_name
      }
    }
  }
`

export const registerVisitGQL = gql`
  mutation registerVisit (
    $officeId: Int!,
    $userId: String!,
    $userName: String!,
    $visitDateTimeFrom: timestamp!,
    $visitDateTimeTo: timestamp!
  ) {
    insert_visits(objects: [
      {
        office_id: $officeId,
        user_id: $userId,
        user_handle_name: $userName,
        visit_datetime_from: $visitDateTimeFrom,
        visit_datetime_to: $visitDateTimeTo,
      }
    ]) { returning { office_id } }
  }
`

export const deleteVisitGQL = gql`
  mutation deleteVisit (
    $officeId: Int!,
    $visitDateTimeFrom: timestamp!,
    $handleName: String!,
  ) {
    delete_visits(
      where: {
        _and: [
          {office_id: {_eq: $officeId}},
          {visit_datetime_from: {_eq: $visitDateTimeFrom}},
          {user_handle_name: {_eq: $handleName}},
        ]
      }
    ) { affected_rows }
  }
`
