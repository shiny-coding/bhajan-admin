import { useState, useEffect, useRef } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { DeleteModal } from './DeleteModal'
import { SearchResult } from '../gql/graphql'
import { useBhajanStore } from '../stores/bhajanStore'

export const SEARCH_BHAJANS = gql`
  query SearchBhajans($searchTerm: String!) {
    searchBhajans(searchTerm: $searchTerm) {
      highlight {
        title
        author
      }
      bhajan {
        title
        author
      }
    }
  }
`

const DELETE_BHAJAN = gql`
  mutation DeleteBhajan($title: String!, $author: String!) {
    deleteBhajan(title: $title, author: $author)
  }
`

interface BhajanListProps {
  onDelete: (title: string, author: string) => void
}

export function BhajanList({ onDelete }: BhajanListProps) {
  const { searchTerm, setSearchTerm, currentBhajan, setCurrentBhajan } = useBhajanStore()
  const { loading, error, data, refetch } = useQuery<{ searchBhajans: SearchResult[] }>(SEARCH_BHAJANS, {
    variables: { searchTerm },
  })

  console.log('Rerending List with current bhajan', currentBhajan)

  return (
    <div className="flex flex-col basis-[500px] max-w-[500px] h-full overflow-hidden">
      <div className="relative">
        <input
          type="text"
          placeholder="Search bhajans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-black-600 bg-transparent border-none p-0 focus:outline-none focus:border-none"
          >
            ✖
          </button>
        )}
      </div>
      
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4">Error: {error.message}</p>}
      
      <div className="space-y-4 pr-2 mt-4 overflow-y-auto flex-1 min-h-0">
        {data?.searchBhajans.map((searchResult, index) => (
          <div 
            key={index}
            data-title={searchResult.bhajan.title}
            data-author={searchResult.bhajan.author}
            className={`bhajan-item border-2 cursor-pointer border-gray-300 rounded-lg p-4 
                        shadow-sm hover:shadow-md transition-shadow text-left
                        ${currentBhajan?.title === searchResult.bhajan.title && 
                          currentBhajan?.author === searchResult.bhajan.author 
                            ? 'bg-green-200' : 'bg-white'}`}
            onClick={() => setCurrentBhajan({ 
              title: searchResult.bhajan.title, 
              author: searchResult.bhajan.author 
            })}
          >
            <div className="highlight flex justify-between items-center">
              <div>
                <div className="font-bold" dangerouslySetInnerHTML={{ __html: searchResult.highlight.title }}></div>
                <div dangerouslySetInnerHTML={{ __html: searchResult.highlight.author }}></div>
              </div>
              <div className="space-x-2">
                <button 
                  className="hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(searchResult.bhajan.title, searchResult.bhajan.author)
                  }}
                >✖</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 