import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { AppContent } from './components/AppContent'
import { useAuthStore } from './stores/authStore'

export const remoteUrl = 'https://bhajan.miracall.net/api'
export const localUrl = 'http://localhost:4000'

const httpLink = createHttpLink({
  uri: remoteUrl,
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
    link: from([authLink, httpLink]),
    cache: new InMemoryCache(),
  })

  return (
    <ApolloProvider client={client}>
      <AppContent />
    </ApolloProvider>
  )
}

export default App
