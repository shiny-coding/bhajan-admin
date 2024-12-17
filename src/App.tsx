import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { AppContent } from './components/AppContent'
import { useAuthStore } from './stores/authStore'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
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
