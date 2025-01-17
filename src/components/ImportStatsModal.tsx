interface ImportStatsModalProps {
  stats: {
    numberAdded: number
    numberReplaced: number
    numberSkipped: number
  }
  onClose: () => void
}

export function ImportStatsModal({ stats, onClose }: ImportStatsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full m-4">
        <h3 className="text-lg font-bold mb-4">Import Results</h3>
        <div className="space-y-2">
          <div>Added: {stats.numberAdded} bhajans</div>
          <div>Replaced: {stats.numberReplaced} bhajans</div>
          <div>Skipped: {stats.numberSkipped} bhajans</div>
        </div>
        <div className="flex justify-center mt-6">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 