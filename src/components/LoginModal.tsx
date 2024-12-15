interface LoginModalProps {
  onConfirm: (token: string) => void
  error?: string
}

export function LoginModal({ onConfirm, error }: LoginModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const token = new FormData(form).get('token') as string
    onConfirm(token)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full m-4">
        <h3 className="text-lg font-bold mb-4">Enter Write Token</h3>
        <input
          type="password"
          name="token"
          className="w-full p-2 border rounded mb-2"
          placeholder="Write token"
          autoFocus
        />
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        <div className="flex justify-center">
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  )
} 