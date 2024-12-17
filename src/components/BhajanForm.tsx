import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useBhajanStore } from '../stores/bhajanStore'
import { Bhajan } from '../gql/graphql'
import { keys } from 'ts-transformer-keys'
import { useRef, useState } from 'react'
import { SEARCH_BHAJANS } from './BhajanList'

const BHAJAN_FIELDS = keys<Bhajan>().filter(key => !key.startsWith('_'))

const BIG_FIELDS = ['text', 'translation'];

const FIELDS_ORDER = ['title', 'author', 'text', 'translation', 'audioPath', 'chords', 'review', 'lessons', 'options']

const GET_BHAJAN = gql`
  query GetBhajan($author: String!, $title: String!) {
    getBhajan(author: $author, title: $title) {
      ${BHAJAN_FIELDS.join('\n      ')}
    }
  }
`

const CREATE_BHAJAN = gql`
  mutation CreateBhajan(
    ${BHAJAN_FIELDS.map(field => `$${field}: String!`).join(',\n    ')}
    $oldTitle: String,
    $oldAuthor: String
  ) {
    createBhajan(
      ${BHAJAN_FIELDS.map(field => `${field}: $${field}`).join(',\n      ')}
      oldTitle: $oldTitle,
      oldAuthor: $oldAuthor
    )
  }
`

export function BhajanForm() {
  const { currentBhajan, setCurrentBhajan, searchTerm } = useBhajanStore()
  const [titleError, setTitleError] = useState<string>()
  const { data, loading, refetch } = useQuery(GET_BHAJAN, {
    variables: currentBhajan,
    skip: !currentBhajan || !currentBhajan.title,
    notifyOnNetworkStatusChange: true // this is needed to force a re-render when the data changes
  })

  const [createBhajan] = useMutation(CREATE_BHAJAN, {
    refetchQueries: [
      {
        query: SEARCH_BHAJANS,
        variables: { searchTerm }
      }
    ],
    onCompleted: (data) => {
      const formData = Object.fromEntries(new FormData(formRef.current!))
      const title = formData.title as string
      const author = (formData.author as string).trim() || 'Unknown'
      setCurrentBhajan({ title, author })
      setTitleError(undefined)
    }
  })

  const bhajan = data?.getBhajan

  const sortedFields = [
    ...FIELDS_ORDER,
    ...BHAJAN_FIELDS.filter(field => !FIELDS_ORDER.includes(field))
  ]

  const formRef = useRef<HTMLFormElement>(null)

  const handleSave = () => {
    const formData = Object.fromEntries(new FormData(formRef.current!))
    const title = formData.title as string
    const author = (formData.author as string).trim() || 'Unknown'

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
            field === 'author' ? author : (formData?.[field] ?? '')
          ])
        ),
        ...(currentBhajan ? {
          oldTitle: currentBhajan.title,
          oldAuthor: currentBhajan.author
        } : {})
      } 
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.trim()) {
      setTitleError(undefined)
    }
  }

  return (
    <div className="grow border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-left overflow-y-auto">
      {currentBhajan && (
        <div className="flex gap-2 mb-4">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={handleSave}
          >
            Save
          </button>
          <button 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            onClick={() => refetch()}
          >
            Revert
          </button>
        </div>
      )}
      {currentBhajan ? (
        <form key={currentBhajan.title + currentBhajan.author} className="space-y-4" ref={formRef}>
          {sortedFields.map(field => (
            <div key={field} className="flex flex-col">
              <label className="font-bold capitalize">{field}</label>
              {loading ? (
                <div className="border rounded p-2 min-h-[100px] bg-gray-50">Loading...</div>
              ) : (
                <>
                  <textarea 
                    name={field}
                    className={`border rounded p-2 ${BIG_FIELDS.includes(field) ? 'font-mono' : ''} 
                      ${field === 'title' && titleError ? 'border-red-500' : ''}`}
                    defaultValue={bhajan?.[field] ?? ''}
                    rows={BIG_FIELDS.includes(field) ? 5 : 1}
                    onChange={field === 'title' ? handleTitleChange : undefined}
                  />
                  {field === 'title' && titleError && (
                    <div className="text-red-500 text-sm mt-1">{titleError}</div>
                  )}
                </>
              )}
            </div>
          ))}
        </form>
      ) : (
        <p>Select a bhajan to view details</p>
      )}
    </div>
  )
} 