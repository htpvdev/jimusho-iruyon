import { useState } from 'react'
import { ApolloClient, ApolloProvider, InMemoryCache, gql } from '@apollo/client'

import RoutePage from './RoutePage'
import LoginDialog from './LoginDialog'

// Apollo を使って HasuraのGraphQLサーバ に接続
const client = new ApolloClient({
  uri: '',
  cache: new InMemoryCache(),
  headers: {
  },
})

const App = () => {
  const [loginState, setLoginState] = useState('logged out')
  const [companyId, setCompanyId] = useState<number|null>(null)
  const [companyName, setCompanyName] = useState('loading...')

  const loginDialogProps = { loginState, setLoginState, setCompanyId, setCompanyName }
  const routePageProps = { companyId, companyName, setCompanyId, setCompanyName, setLoginState }

  // useEffect(() => {
  //   client.query({
  //     query: gql`
  //       query {
  //         __schema {
  //           types {
  //             name
  //             kind
  //             description
  //           }
  //         }
  //       }
  //     `,
  //     variables: {
  //       id: 1,
  //     },
  //   })
  //   .then((result) => console.log(result))
  // }, [])

  return (
    <ApolloProvider client={client}>
      <LoginDialog {...loginDialogProps} />
      <RoutePage {...routePageProps} />
    </ApolloProvider>
  )
}

export default App
