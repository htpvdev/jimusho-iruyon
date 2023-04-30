import { useState } from 'react'
import { ApolloClient } from '@apollo/client'
import { ApolloProvider } from '@apollo/client'
import { InMemoryCache } from '@apollo/client'

import RoutePage from './RoutePage'
import LoginDialog from './LoginDialog'

// Apollo を使って HasuraのGraphQLサーバ に接続
const client = new ApolloClient({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET as string,
  },
})

const App = () => {
  console.log(import.meta.env.VITE_AUTH0_DOMAIN)
  const [loginState, setLoginState] = useState('logged out')
  const [companyId, setCompanyId] = useState<number|null>(null)
  const [companyName, setCompanyName] = useState('loading...')

  const loginDialogProps = { loginState, setLoginState, setCompanyId, setCompanyName }
  const routePageProps = { companyId, companyName, setCompanyId, setCompanyName, setLoginState }

  return (
    <ApolloProvider client={client}>
      <LoginDialog {...loginDialogProps} />
      <RoutePage {...routePageProps} />
    </ApolloProvider>
  )
}

export default App
