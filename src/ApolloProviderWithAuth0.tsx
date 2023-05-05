import { useRef } from 'react'
import {
  ApolloProvider,
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { useAuth0 } from '@auth0/auth0-react'

type Props = {
  children: React.ReactNode
}

const ApolloProviderWithAuth0 = ({ children }: Props) => {
  const { user, getAccessTokenSilently } = useAuth0()

  const httpLink = new HttpLink({
    uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  })

  const authLink = setContext(async (_, { headers, ...rest }) => {
    let token
    try {
      token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        },
      })
    } catch (error) {
      console.log(error)
    }

    if (!token) return { headers, ...rest }

    return {
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
        'X-Hasura-Default-Role': 'user',
        'X-Hasura-User-Id': user?.sub,
      },
    }
  })

  const client = useRef<ApolloClient<NormalizedCacheObject>>()

  if (!client.current) {
    client.current = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    })
  }

  return (
    <ApolloProvider client={client.current}>
      {children}
    </ApolloProvider>
  )
}

export { ApolloProviderWithAuth0 }
