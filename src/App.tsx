import { ApolloClient, InMemoryCache, ApolloProvider, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { AppContent } from './components/AppContent'
import { useAuthStore } from './stores/authStore'

const uploadLink = createUploadLink({
  uri: import.meta.env.VITE_API_URL,
  credentials: 'include',
  headers: {
    'apollo-require-preflight': 'true',
    'content-type': 'application/json'
  },
  // credentials: 'same-origin'
})

function App() {
  const { writeTokenHash } = useAuthStore()

  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      'Write-Token-Hash': writeTokenHash || ''
    }
  }))

  const client = new ApolloClient({
    link: from([authLink, uploadLink]),
    cache: new InMemoryCache(),
  })

  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  )
}

export default App
