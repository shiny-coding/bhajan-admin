import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'
import { BhajanList } from './components/BhajanList'


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
        <div className="grow border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-left">
          Some text
        </div>
      </div>
    </ApolloProvider>
  )
}

export default App
