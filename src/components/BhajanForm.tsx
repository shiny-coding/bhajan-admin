import { gql, useQuery } from '@apollo/client'
import { useBhajanStore } from '../stores/bhajanStore'
import { Bhajan } from '../gql/graphql'
import { keys } from 'ts-transformer-keys'

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

export function BhajanForm() {
  const { currentBhajan } = useBhajanStore()
  const { data, loading } = useQuery(GET_BHAJAN, {
    variables: currentBhajan ?? { author: '', title: '' },
    skip: !currentBhajan
  })

  const bhajan = data?.getBhajan

  const sortedFields = [
    ...FIELDS_ORDER,
    ...BHAJAN_FIELDS.filter(field => !FIELDS_ORDER.includes(field))
  ]

  return (
    <div className="grow border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-left overflow-y-auto">
      {currentBhajan ? (
        <div className="space-y-4">
          {sortedFields.map(field => (
            <div key={field} className="flex flex-col">
              <label className="font-bold capitalize">{field}</label>
              {loading ? (
                <div className="border rounded p-2 min-h-[100px] bg-gray-50">Loading...</div>
              ) : (
                <textarea 
                  className="border rounded p-2"
                  value={bhajan?.[field] ?? ''}
                  rows={BIG_FIELDS.includes(field) ? 5 : 1}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Select a bhajan to view details</p>
      )}
    </div>
  )
} 