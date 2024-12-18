import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useBhajanStore } from '../stores/bhajanStore'
import { Bhajan } from '../gql/graphql'
import { keys } from 'ts-transformer-keys'
import { useRef, useState, useEffect } from 'react'
import { SEARCH_BHAJANS } from './BhajanList'

const BHAJAN_FIELDS = keys<Bhajan>().filter(key => !key.startsWith('_'))

const BIG_FIELDS = ['text', 'translation'];

const FIELDS_ORDER = ['title', 'author', 'text', 'translation', 'chords', 'review', 'lessons', 'options']

const GET_BHAJAN = gql`
  query GetBhajan($author: String!, $title: String!) {
    getBhajan(author: $author, title: $title) {
      ${BHAJAN_FIELDS.join('\n      ')},
      audioPath
    }
  }
`

const CREATE_BHAJAN = gql`
  mutation CreateBhajan(
    ${BHAJAN_FIELDS.map(field => `$${field}: String!`).join(',\n    ')}
    $oldTitle: String,
    $oldAuthor: String,
    $audioFile: Upload,
    $deleteAudio: Boolean
  ) {
    createBhajan(
      ${BHAJAN_FIELDS.map(field => `${field}: $${field}`).join(',\n      ')}
      oldTitle: $oldTitle,
      oldAuthor: $oldAuthor,
      audioFile: $audioFile,
      deleteAudio: $deleteAudio
    )
  }
`

export function BhajanForm() {
  const { currentBhajan, setCurrentBhajan, searchTerm } = useBhajanStore()
  const [titleError, setTitleError] = useState<string>()
  const [deleteAudio, setDeleteAudio] = useState(false)
  const { data, loading: queryLoading, refetch } = useQuery(GET_BHAJAN, {
    variables: currentBhajan,
    skip: !currentBhajan || !currentBhajan.title,
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    setDeleteAudio(false)
  }, [currentBhajan])

  const [createBhajan, { loading: saving }] = useMutation(CREATE_BHAJAN, {
    refetchQueries: [
      {
        query: SEARCH_BHAJANS,
        variables: { searchTerm }
      },
      {
        query: GET_BHAJAN,
        variables: currentBhajan
      }
    ],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      const formData = Object.fromEntries(new FormData(formRef.current!))
      const title = formData.title as string
      const author = (formData.author as string).trim() || 'Unknown'
      setCurrentBhajan({ title, author })
      setDeleteAudio(false)
      setTitleError(undefined)
      
      // Reset file input
      const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
    }
  })

  const bhajan = data?.getBhajan

  const sortedFields = [
    ...FIELDS_ORDER,
    ...BHAJAN_FIELDS.filter(field => !FIELDS_ORDER.includes(field))
  ]

  const formRef = useRef<HTMLFormElement>(null)

  const handleSave = () => {
    const formData = new FormData(formRef.current!)
    const title = formData.get('title') as string
    const author = (formData.get('author') as string).trim() || 'Unknown'
    const audioFile = formData.get('audioFile') as File | null

    if (!title.trim()) {
      setTitleError('Title cannot be empty')
      return
    }

    setTitleError(undefined)
    createBhajan({ 
      variables: { 
        ...Object.fromEntries(
          BHAJAN_FIELDS.map(field => [
            field,
            field === 'author' ? author : (formData.get(field) ?? '')
          ])
        ),
        ...(currentBhajan ? {
          oldTitle: currentBhajan.title,
          oldAuthor: currentBhajan.author
        } : {}),
        audioFile: audioFile || null,
        deleteAudio
      } 
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.trim()) {
      setTitleError(undefined)
    }
  }

  const handleRevert = () => {
    refetch()
    setDeleteAudio(false)
  }

  return (
    <div className="grow border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-left overflow-y-auto">
      {currentBhajan && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              onClick={handleRevert}
              disabled={saving}
            >
              Revert
            </button>
          </div>
          {bhajan?.audioPath && !deleteAudio && (
            <div className="flex items-center gap-2">
              <audio
                src={`${import.meta.env.VITE_WEB_URL}/${bhajan.audioPath}`}
                controls
                className={`h-10 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
              />
              <button
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                onClick={() => setDeleteAudio(true)}
                title="Delete audio"
                disabled={saving}
              >
                ✖
              </button>
            </div>
          )}
        </div>
      )}
      {currentBhajan ? (
        <form key={currentBhajan.title + currentBhajan.author} className="space-y-4" ref={formRef}>
          {sortedFields.map(field => (
            <div key={field} className={`flex flex-col ${field === 'audioPath' ? 'hidden' : ''}`}>
              <label className={`font-bold capitalize ${saving ? 'text-gray-400' : ''}`}>{field}</label>
              {queryLoading ? (
                <div className="border rounded p-2 min-h-[100px] bg-gray-50">Loading...</div>
              ) : (
                <>
                  <textarea 
                    name={field}
                    className={`border rounded p-2 ${BIG_FIELDS.includes(field) ? 'font-mono' : ''} 
                      ${field === 'title' && titleError ? 'border-red-500' : ''}
                      ${saving ? 'bg-gray-50' : ''}`}
                    defaultValue={bhajan?.[field] ?? ''}
                    rows={BIG_FIELDS.includes(field) ? 5 : 1}
                    onChange={field === 'title' ? handleTitleChange : undefined}
                    disabled={saving}
                  />
                  {field === 'title' && titleError && (
                    <div className="text-red-500 text-sm mt-1">{titleError}</div>
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex flex-col">
            <label className={`font-bold ${saving ? 'text-gray-400' : ''}`}>Audio File</label>
            <input
              type="file"
              name="audioFile"
              accept="audio/*"
              className={`border rounded p-2 ${saving ? 'bg-gray-50' : ''}`}
              disabled={saving}
            />
          </div>
        </form>
      ) : (
        <p>Select a bhajan to view details</p>
      )}
    </div>
  )
} 