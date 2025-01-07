import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useBhajanStore } from '../stores/bhajanStore'
import { Bhajan } from '../gql/graphql'
import { keys } from 'ts-transformer-keys'
import { useRef, useState, useEffect } from 'react'
import { SEARCH_BHAJANS } from './BhajanList'
import { getFormDataWithDisabled } from '../utils/utils'

const BHAJAN_FIELDS = keys<Bhajan>().filter(key => !key.startsWith('_'))
const CREATE_BHAJAN_FIELDS = BHAJAN_FIELDS.filter(field => field !== 'lastModified')

const BIG_FIELDS = ['text', 'translation'];

const FIELDS_ORDER = ['title', 'author', 'text', 'translation', 'chords', 'lessons', 'options']

export const GET_BHAJAN = gql`
  query GetBhajan($author: String!, $title: String!) {
    getBhajan(author: $author, title: $title) {
      ${BHAJAN_FIELDS.join('\n      ')},
      audioPath,
      reviewPath
    }
  }
`

const CREATE_BHAJAN = gql`
  mutation CreateBhajan(
    ${CREATE_BHAJAN_FIELDS.map(field => `$${field}: String!`).join(',\n      ')}
    $oldTitle: String,
    $oldAuthor: String,
    $audioFile: Upload,
    $reviewFile: Upload,
    $deleteAudio: Boolean,
    $deleteReview: Boolean
  ) {
    createBhajan(
      ${CREATE_BHAJAN_FIELDS.map(field => `${field}: $${field}`).join(',\n        ')}
      oldTitle: $oldTitle,
      oldAuthor: $oldAuthor,
      audioFile: $audioFile,
      reviewFile: $reviewFile,
      deleteAudio: $deleteAudio,
      deleteReview: $deleteReview
    )
  }
`

export function BhajanForm() {
  const { currentBhajan, setCurrentBhajan, searchTerm } = useBhajanStore()
  const [titleError, setTitleError] = useState<string>()
  const [deleteAudio, setDeleteAudio] = useState(false)
  const [deleteReview, setDeleteReview] = useState(false)
  const { data, loading: queryLoading, refetch, error: queryError } = useQuery(GET_BHAJAN, {
    variables: currentBhajan,
    skip: !currentBhajan || !currentBhajan.title,
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    setDeleteAudio(false)
    setDeleteReview(false)
  }, [currentBhajan])

  const client = useApolloClient()

  const [createBhajan, { loading: saving }] = useMutation(CREATE_BHAJAN, {
    refetchQueries: [
      {
        query: SEARCH_BHAJANS,
        variables: { searchTerm }
      },
      ...(currentBhajan && currentBhajan.title ? [{
        query: GET_BHAJAN,
        variables: currentBhajan,
      }] : [])
    ],
    awaitRefetchQueries: true,
    onCompleted: async (data) => {
      const formData = getFormDataWithDisabled(formRef.current!)
      const title = formData.get('title') as string
      const author = (formData.get('author') as string).trim() || 'Unknown'
      
      // Evict this specific bhajan from cache
      client.cache.evict({
        fieldName: 'getBhajan',
        args: { title, author }
      })
      
      setCurrentBhajan({ title, author })
      setDeleteAudio(false)
      setDeleteReview(false)
      setTitleError(undefined)
      clearFileInput('audioFile')
      clearFileInput('reviewFile')
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
    const reviewFile = formData.get('reviewFile') as File | null

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
        reviewFile: reviewFile || null,
        deleteAudio,
        deleteReview
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
    setDeleteReview(false)
  }

  const clearFileInput = (name: string) => {
    const input = formRef.current?.querySelector(`input[name="${name}"]`) as HTMLInputElement
    if (input) {
      input.value = ''
    }
  }

  const handleDeleteAudio = () => {
    setDeleteAudio(true)
    clearFileInput('audioFile')
  }

  const handleDeleteReview = () => {
    setDeleteReview(true)
    clearFileInput('reviewFile')
  }

  return (
    <div className="grow border-2 border-gray-300 rounded-lg p-4 pr-1 bg-white shadow-sm hover:shadow-md transition-shadow text-left h-full flex flex-col overflow-hidden">
      {currentBhajan && (
        <>
          {queryError ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-red-500 mb-2">{queryError.message}</div>
              {queryError.graphQLErrors?.map((error, index) => (
                <div key={index} className="text-sm text-gray-600 font-mono whitespace-pre-wrap max-w-2xl">
                  <div>Code: {(error.extensions?.code as string) || 'Unknown'}</div>
                  <div className="mt-2">Stack trace:</div>
                  <div className="bg-gray-100 p-2 rounded mt-1">
                    {(error.extensions?.stacktrace as string[])?.join('\n') || 'No stack trace available'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
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
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 pr-2 scrollbar-thin">
                {currentBhajan ? (
                  <form key={currentBhajan.title + currentBhajan.author} className="space-y-4" ref={formRef}>
                    {sortedFields.map(field => (
                      <div key={field} className={`flex flex-col ${field === 'audioPath' || field === 'reviewPath' || field === 'lastModified' ? 'hidden' : ''}`}>
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
                              disabled={false && saving}
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
                      {bhajan?.audioPath && !deleteAudio && (
                        <div className="flex items-center gap-2 py-2">
                          <audio
                            key={Date.now()}
                            src={`${import.meta.env.VITE_WEB_URL}/${bhajan.audioPath}`}
                            controls
                            className={`h-10 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                            onClick={handleDeleteAudio}
                            title="Delete audio"
                            disabled={saving}
                          >
                            ✖
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        name="audioFile"
                        accept="audio/*"
                        className={`border rounded p-2 ${saving ? 'bg-gray-50' : ''}`}
                        disabled={saving}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className={`font-bold ${saving ? 'text-gray-400' : ''}`}>Review File</label>
                      {bhajan?.reviewPath && !deleteReview && (
                        <div className="flex items-center gap-2 py-2">
                          <audio
                            key={Date.now()}
                            src={`${import.meta.env.VITE_WEB_URL}/${bhajan.reviewPath}`}
                            controls
                            className={`h-10 ${saving ? 'opacity-50 pointer-events-none' : ''}`}
                          />
                          <button
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                            onClick={handleDeleteReview}
                            title="Delete review"
                            disabled={saving}
                          >
                            ✖
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        name="reviewFile"
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
            </>
          )}
        </>
      )}
    </div>
  )
} 