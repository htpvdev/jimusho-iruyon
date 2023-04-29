import { useState } from 'react'
import { ApolloClient, ApolloProvider, InMemoryCache, gql } from '@apollo/client'

import RoutePage from './RoutePage'
import LoginDialog from './LoginDialog'

// Apollo を使って HasuraのGraphQLサーバ に接続
const client = new ApolloClient({
  uri: 'https://optimal-goshawk-18.hasura.app/v1/graphql',
  // uri: '',
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret': 'IwjMtnY4pFY2QeozfrDyRjl8HS6Gvpj4nGOh6LsFKSGAaa1aeZoYG2v3cFKnOdHI',
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
