import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { gql, useLazyQuery } from '@apollo/client'

import {
  AppBar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Toolbar,
  Typography
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

import DailyVisitList from './DailyVisitList'

type Office = {
  id: number
  officeName: string
  companyId: number
}

type Visit = {
  officeId: number
  visitorName: string
  visitDateTimeFrom: string
  visitDateTimeTo: string
}

type VisitInfo = {
  visitDate: string
  visitList: Visit[]
}

const createVisitInfoList = (visits: Visit[]): VisitInfo[] => {
  const visitDateList: string[] = [
    ...new Set(
      visits.map(visit => visit.visitDateTimeTo.split('T')[0])
    )
  ]

  const visitInfoList: VisitInfo[] = visitDateList.map((visitDate) => {
    const date = new Date(visitDate)
    const visitList = visits.filter((visit) => {
      return date.getTime() === new Date(visit.visitDateTimeTo.split('T')[0]).getTime()
    })

    return {
      visitDate: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`,
      visitList,
    }
  })

  return visitInfoList
}

const fetchOfficeGQL = gql`
  query getOfficeByCompanyId($companyId: Int!) {
    office(where: {companyId: {_eq: $companyId}}) {
      id,
      officeName,
      companyId,
    }
  }
`

const fetchVisitGQL = gql`
  query getVisitByOfficeId($officeId: Int!, $gteDateTo: timestamp!) {
    visit(where: {
      officeId: {_eq: $officeId },
      visitDateTimeTo: { _gte: $gteDateTo }
    }) {
      officeId,
      visitorName,
      visitDateTimeFrom,
      visitDateTimeTo,
    }
  }
`

type Props = {
  companyId: number|null
  companyName: string
  setCompanyId: Dispatch<SetStateAction<number|null>>
  setCompanyName: Dispatch<SetStateAction<string>>
  setLoginState: Dispatch<SetStateAction<string>>
}

const RoutePage = ({ companyId, companyName, setCompanyId, setCompanyName, setLoginState }: Props) => {
  // officeを取得する処理
  const [fetchOfficeByCompanyId, { ...fetchOfficeResponse }]
  = useLazyQuery(fetchOfficeGQL, { variables: { companyId } })

  const officeList = fetchOfficeResponse?.data?.office ?? []
  const fetchOfficeLoading = fetchOfficeResponse.loading

  const [currentOfficeId, setCurrentOfficeId] = useState<number>(officeList[0]?.id ?? 0)
  // const currentOfficeId = officeList[0]?.id ?? null

  // visitを取得する処理
  const [fetchVisitByOfficeId, { ...fetchVisitResponse }]
  = useLazyQuery(fetchVisitGQL, { variables: {
    officeId: currentOfficeId,
    gteDateTo: new Date().toISOString().slice(0, -1),
  }})

  // visitテーブルのデータを加工する処理
  console.log('visitを取得する処理=>', fetchVisitResponse)
  const visitInfoList = createVisitInfoList(fetchVisitResponse?.data?.visit ?? [])
  console.log('visitInfoList is...', visitInfoList)

  useEffect(() => {
    // この関数が実行されると、このコンポーネントが再レンダリングされる
    if (companyId !== null) fetchOfficeByCompanyId()
  }, [companyId, officeList])

  useEffect(() => {
    // この関数が実行されると、このコンポーネントが再レンダリングされる
    if (currentOfficeId !== 0 && fetchOfficeLoading) fetchVisitByOfficeId()
  }, [currentOfficeId, fetchOfficeLoading])

  const handleChangeOfficeList = (e) => {
    setCurrentOfficeId(e.target.value)
  }

  const onClickLogout = () => {
    setCurrentOfficeId(0)
    setCompanyId(null)
    setCompanyName('loading...')
    setLoginState('logged out')
  }

  const onClickReload = () => {
    fetchOfficeByCompanyId()
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">{companyName}</Typography>
          <div style={{ flexGrow: 1 }}></div>
          <Button color="inherit" onClick={onClickLogout}><LogoutIcon />ログアウト</Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex' }}>
          <Select
            labelId="officeList"
            id="officeList"
            value={currentOfficeId}
            label="オフィスを選択..."
            onChange={handleChangeOfficeList}
            sx={{ width: '90%', mr: 2 }}
          >
            {officeList.length === 0 && <MenuItem value={0}>loading...</MenuItem>}
            {officeList.map((office: Office) => <MenuItem value={office.id}>{office.officeName}</MenuItem>)}
          </Select>
          <Button disabled={fetchOfficeLoading} onClick={onClickReload} variant="contained">
            {fetchOfficeLoading ? <CircularProgress /> : '更新'}
          </Button>
        </Box>
        {visitInfoList.map(
          (visitInfo: VisitInfo) => (<DailyVisitList {...visitInfo} />)
        )}
      </Box>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={fetchOfficeLoading ?? false}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  )
}

export default RoutePage
