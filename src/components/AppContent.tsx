import { gql, useMutation, useLazyQuery } from '@apollo/client'
import { BhajanList } from './BhajanList'
import { BhajanForm } from './BhajanForm'
import { LoginModal } from './LoginModal'
import { useAuthStore } from '../stores/authStore'
import { useState } from 'react'
import { hashToken } from '../utils/hash'
import { useBhajanStore } from '../stores/bhajanStore'

const CHECK_TOKEN = gql`
  query CheckWriteToken($writeTokenHash: String!) {
    checkWriteToken(writeTokenHash: $writeTokenHash)
  }
`

const REINDEX_ALL = gql`
  mutation ReindexAll {
    reindexAll
  }
`

export function AppContent() {
  const { writeTokenHash, setWriteTokenHash } = useAuthStore()
  const { setCurrentBhajan } = useBhajanStore()
  const [error, setError] = useState<string>()
  const [checkToken] = useLazyQuery(CHECK_TOKEN)
  const [reindexAll, { loading: reindexing }] = useMutation(REINDEX_ALL)

  const handleTokenCheck = async (writeToken: string) => {
    try {
      const writeTokenHash = await hashToken(writeToken)
      const { data } = await checkToken({ variables: { writeTokenHash } })
      if (data?.checkWriteToken === true) {
        setWriteTokenHash(writeTokenHash)
        setError(undefined)
      } else {
        setError('Invalid token')
      }
    } catch (err) {
      let errorMessage = err.cause.result.errors.map(e=>e.extensions.code + ': ' + e.message).join('<br>')
      setError(errorMessage)
    }
  }

  const handleAddBhajan = () => {
    setCurrentBhajan({
      title: '',
      author: ''
    })
  }

  const handleLogout = () => {
    setWriteTokenHash(null)
  }

  const handleReindex = async () => {
    try {
      await reindexAll()
    } catch (err) {
      alert('Reindex failed: ' + (err as Error).message)
    }
  }

  return writeTokenHash ? (<>
    <div className="h-screen flex flex-col p-4">
      <div className="flex justify-between mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleAddBhajan}
        >
          Add Bhajan
        </button>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
            onClick={handleReindex}
            disabled={reindexing}
          >
            {reindexing ? 'Reindexing...' : 'Reindex'}
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
      <div className="main-container flex gap-4 grow">
        <BhajanList />
        <BhajanForm />
      </div>
    </div>
  </>) : (
    <LoginModal
      onConfirm={handleTokenCheck}
      error={error}
    />
  )
} 