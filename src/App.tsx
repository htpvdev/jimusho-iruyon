import { useState, useEffect } from 'react'
import { ApolloClient, ApolloProvider, InMemoryCache, gql } from '@apollo/client';

import RoutePage from './RoutePage';
import LoginDialog from './LoginDialog';
import './App.css'

const client = new ApolloClient({
  uri: // ここにAPIのURIを入力
  cache: new InMemoryCache(),
  headers: {
    'x-hasura-admin-secret':
  },
});

const App = () => {
  const [loginState, setLoginState] = useState('unLogin')
  const [companyId, setCompanyId] = useState(0)
  const [companyName, setCompanyName] = useState('')

  const loginDialogProps = { loginState, setLoginState, setCompanyId, setCompanyName }

  useEffect(() => {
    client.query({
      query: gql`
        query {
          __schema {
            types {
              name
              kind
              description
            }
          }
        }
      `,
      variables: {
        id: 1,
      },
    })
    .then((result) => console.log(result));
  }, []);

  return (
    <ApolloProvider client={client}>
      <LoginDialog {...loginDialogProps} />
      <RoutePage />
    </ApolloProvider>
  )
}

export default App
