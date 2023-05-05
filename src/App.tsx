import { useAuth0 } from '@auth0/auth0-react'

import RoutePage from './RoutePage'
import { Backdrop, CircularProgress } from '@mui/material'

const App = () => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()
  if (!isAuthenticated && !isLoading) {
    loginWithRedirect({
      authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
    })
  }

  return (
    <>
      {isAuthenticated && !isLoading && <RoutePage />}
      {isLoading && (
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={true}
        >
          <CircularProgress color='inherit' />
        </Backdrop>
      )}
    </>
  )
}

export default App
