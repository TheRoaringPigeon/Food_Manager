import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/admin'
import PasswordRequirements from '../components/PasswordRequirements'

function parseError(err: any): string {
  try {
    const match = err.message?.match(/^\d+: (.+)$/)
    if (match) {
      const body = JSON.parse(match[1])
      return body.detail || err.message
    }
  } catch {}
  return err.message || 'Something went wrong'
}

export default function ForceChangePasswordPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      await changePassword(user!.id, currentPassword, newPassword)
      updateUser({ must_change_password: false })
      navigate('/ingredients', { replace: true })
    } catch (err: any) {
      setError(parseError(err))
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen background-canvas flex items-center justify-center">
      <div className="background-surface rounded-lg shadow-sm border border-line p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold foreground-content mb-1">Password Change Required</h1>
        <p className="text-sm foreground-subtle mb-6">
          Your password must be updated before you can continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium foreground-content mb-1">Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 border border-line rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium foreground-content mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-line rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium foreground-content mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-line rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <PasswordRequirements password={newPassword} />

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 background-primary text-white rounded text-sm font-medium hover:background-primary-hover disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="mt-4 w-full text-sm foreground-subtle hover:foreground-content text-center"
        >
          Sign out instead
        </button>
      </div>
    </div>
  )
}
