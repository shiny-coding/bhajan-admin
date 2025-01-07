import { gql, useMutation, useLazyQuery } from '@apollo/client'
import { BhajanList, SEARCH_BHAJANS } from './BhajanList'
import { BhajanForm, GET_BHAJAN } from './BhajanForm'
import { LoginModal } from './LoginModal'
import { useAuthStore } from '../stores/authStore'
import { useState } from 'react'
import { hashToken } from '../utils/hash'
import { useBhajanStore } from '../stores/bhajanStore'
import { DeleteModal } from './DeleteModal'

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

const DELETE_BHAJAN = gql`
  mutation DeleteBhajan($title: String!, $author: String!) {
    deleteBhajan(title: $title, author: $author)
  }
`

export function AppContent() {
  const { writeTokenHash, setWriteTokenHash } = useAuthStore()
  const { setCurrentBhajan, searchTerm, currentBhajan } = useBhajanStore()
  const [error, setError] = useState<string>()
  const [checkToken] = useLazyQuery(CHECK_TOKEN)
  const [reindexAll, { loading: reindexing }] = useMutation(REINDEX_ALL)
  const [deleteModal, setDeleteModal] = useState<{ title: string; author: string } | null>(null)
  const [deleteBhajan] = useMutation(DELETE_BHAJAN, {
    refetchQueries: [
      {
        query: SEARCH_BHAJANS,
        variables: { searchTerm }
      },
      ...(currentBhajan && currentBhajan.title ? [{
        query: GET_BHAJAN,
        variables: currentBhajan
      }] : []),
      ...(deleteModal?.title ? [{
        query: GET_BHAJAN,
        variables: { title: deleteModal.title, author: deleteModal.author }
      }] : [])
    ]
  })

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

  const handleDelete = async (title: string, author: string) => {
    setDeleteModal({ title, author })
  }

  const handleConfirmDelete = async () => {
    if (deleteModal) {
      try {
        await deleteBhajan({ 
          variables: { title: deleteModal.title, author: deleteModal.author }
        })

        if (currentBhajan?.title === deleteModal.title && currentBhajan?.author === deleteModal.author) {
          setCurrentBhajan(null)
        }

      } catch (err) {
        alert('Error deleting bhajan: ' + (err as Error).message)
      }
    }
    setDeleteModal(null)
  }

  return writeTokenHash ? (<>
    <div className="h-screen flex flex-col p-4 overflow-hidden">
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
      <div className="main-container flex gap-4 grow overflow-hidden">
        <BhajanList onDelete={handleDelete} />
        <BhajanForm />
      </div>
    </div>
    {deleteModal && (
      <DeleteModal 
        title={deleteModal.title}
        author={deleteModal.author}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(null)}
      />
    )}
  </>) : (
    <LoginModal
      onConfirm={handleTokenCheck}
      error={error}
    />
  )
} 