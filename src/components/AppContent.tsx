import { gql, useMutation, useLazyQuery, useApolloClient } from '@apollo/client'
import { BhajanList, SEARCH_BHAJANS } from './BhajanList'
import { BhajanForm, GET_BHAJAN } from './BhajanForm'
import { LoginModal } from './LoginModal'
import { useAuthStore } from '../stores/authStore'
import { useState, useRef } from 'react'
import { hashToken } from '../utils/hash'
import { useBhajanStore } from '../stores/bhajanStore'
import { DeleteModal } from './DeleteModal'
import { ImportStatsModal } from './ImportStatsModal'

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

const EXPORT_BHAJANS = gql`
  mutation ExportBhajans {
    exportBhajans
  }
`

const IMPORT_BHAJANS = gql`
  mutation ImportBhajans($file: Upload!) {
    importBhajans(file: $file) {
      numberAdded
      numberReplaced
      numberSkipped
    }
  }
`

const DELETE_ALL_BHAJANS = gql`
  mutation DeleteAllBhajans {
    deleteAllBhajans
  }
`

export function AppContent() {
  const client = useApolloClient()
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
  const [exportBhajans, { loading: exporting }] = useMutation(EXPORT_BHAJANS)
  const [importBhajans, { loading: importing }] = useMutation(IMPORT_BHAJANS)
  const [deleteAllBhajans, { loading: deletingAll }] = useMutation(DELETE_ALL_BHAJANS)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [importStats, setImportStats] = useState<{
    numberAdded: number
    numberReplaced: number
    numberSkipped: number
  } | null>(null)

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

  const handleExport = async () => {
    try {
      const { data } = await exportBhajans()
      if (data?.exportBhajans) {
        window.open(`${import.meta.env.VITE_WEB_URL}/${data.exportBhajans}`, '_blank')
      }
    } catch (err) {
      alert('Export failed: ' + (err as Error).message)
    }
  }

  const handleImport = async () => {
    importInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const { data } = await importBhajans({ 
          variables: { file }
        })
        
        if (data?.importBhajans) {
          setImportStats(data.importBhajans)
          await client.refetchQueries({
            include: 'active'
          })

          await client.clearStore()
        }
        
        e.target.value = ''
      } catch (err) {
        alert('Import failed: ' + (err as Error).message)
      }
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL bhajans? This cannot be undone!')) {
      try {
        await deleteAllBhajans()
        setCurrentBhajan(null)
        await client.refetchQueries({
          include: 'active'
        })
        await client.clearStore()
      } catch (err) {
        alert('Failed to delete all bhajans: ' + (err as Error).message)
      }
    }
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
            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800 disabled:opacity-50"
            onClick={handleDeleteAll}
            disabled={deletingAll}
          >
            {deletingAll ? 'Deleting All...' : 'Delete All'}
          </button>
          <input
            type="file"
            ref={importInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".xlsx"
          />
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
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
    {importStats && (
      <ImportStatsModal 
        stats={importStats}
        onClose={() => setImportStats(null)}
      />
    )}
  </>) : (
    <LoginModal
      onConfirm={handleTokenCheck}
      error={error}
    />
  )
} 