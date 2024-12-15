import { gql, useMutation, useLazyQuery } from '@apollo/client'
import { BhajanList } from './BhajanList'
import { BhajanForm } from './BhajanForm'
import { LoginModal } from './LoginModal'
import { useAuthStore } from '../stores/authStore'
import { useState } from 'react'
import { hashToken } from '../utils/hash'

const CHECK_TOKEN = gql`
  query CheckWriteToken($writeTokenHash: String!) {
    checkWriteToken(writeTokenHash: $writeTokenHash)
  }
`

export function AppContent() {
  const { writeTokenHash, setWriteTokenHash } = useAuthStore()
  const [error, setError] = useState<string>()
  const [checkToken] = useLazyQuery(CHECK_TOKEN)

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

  return writeTokenHash ? (
    <div className="main-container h-screen flex gap-4 p-4">
      <BhajanList />
      <BhajanForm />
    </div>
  ) : (
    <LoginModal
      onConfirm={handleTokenCheck}
      error={error}
    />
  )
} 