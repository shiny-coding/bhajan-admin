interface DeleteModalProps {
  title: string
  author: string
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteModal({ title, author, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full m-4">
        <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
        <p className="mb-6">Do you want to delete "{title}" by "{author}"?</p>
        <div className="flex justify-center space-x-4">
          <button 
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
} 