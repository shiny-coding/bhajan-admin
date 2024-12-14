import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { BhajanList } from './components/BhajanList'
import { BhajanForm } from './components/BhajanForm'

const remoteUrl = 'https://bhajan.miracall.net/api'
const localUrl = 'http://localhost:4000'

const client = new ApolloClient({
  uri: localUrl,
  cache: new InMemoryCache(),
})

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="main-container h-screen flex gap-4 p-4">
        <BhajanList />
        <BhajanForm />
      </div>
    </ApolloProvider>
  )
}

export default App
