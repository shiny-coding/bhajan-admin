import { useState } from 'react'
import { gql, useQuery, useMutation } from '@apollo/client'
import { DeleteModal } from './DeleteModal'
import { SearchResult } from '../gql/graphql'
// import { Bhajan, SearchResult } from '../models/Bhajan'
import { useBhajanStore } from '../stores/bhajanStore'


const DELETE_BHAJAN = gql`
  mutation DeleteBhajan($title: String!, $author: String!) {
    deleteBhajan(title: $title, author: $author)
  }
`

export function BhajanList() {
  const [search, setSearch] = useState('')
  const { loading, error, data, refetch } = useQuery<{ searchBhajans: SearchResult[] }>(gql`
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
  `, {
    variables: { searchTerm: search }
  })

  const [deleteBhajan] = useMutation(DELETE_BHAJAN)
  const [deleteModal, setDeleteModal] = useState<{ title: string; author: string } | null>(null)
  const { currentBhajan, setCurrentBhajan } = useBhajanStore()

  const handleDelete = async (title: string, author: string) => {
    setDeleteModal({ title, author })
  }

  const handleConfirmDelete = async () => {
    if (deleteModal) {
      try {
        await deleteBhajan({ 
          variables: { title: deleteModal.title, author: deleteModal.author }
        })
        refetch()
      } catch (err) {
        alert('Error deleting bhajan: ' + (err as Error).message)
      }
    }
    setDeleteModal(null)
  }

  return (
    <div className="flex flex-col basis-[500px] max-w-[500px]">
      <div className="relative">
        <input
          type="text"
          placeholder="Search bhajans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-black-600 bg-transparent border-none p-0 focus:outline-none focus:border-none"
          >
            ✖
          </button>
        )}
      </div>
      
      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4">Error: {error.message}</p>}
      
      <div className="space-y-4 pr-2 mt-4 overflow-y-auto scrollbar-thin">
        {data?.searchBhajans.map((searchResult, index) => (
          <div 
            key={index} 
            className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow text-left"
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
                  onClick={() => handleDelete(searchResult.highlight.title, searchResult.highlight.author)}
                >✖</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {deleteModal && (
        <DeleteModal 
          title={deleteModal.title}
          author={deleteModal.author}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
    </div>
  )
} 