import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateUser } from '../api/admin'
import { useTheme, THEMES } from '../context/ThemeContext'

export default function ProfilePage() {
  const { user, updateUser: updateAuthUser } = useAuth()
  const { theme, setTheme, themes } = useTheme()

  const [username, setUsername] = useState(user?.username ?? '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const payload: { username?: string; password?: string } = {}
    if (username !== user?.username) payload.username = username
    if (password) payload.password = password

    if (!payload.username && !payload.password) {
      setError('No changes to save')
      return
    }

    setLoading(true)
    try {
      const updated = await updateUser(user!.id, payload)
      updateAuthUser({ username: updated.username })
      setPassword('')
      setConfirmPassword('')
      setSuccess('Profile updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md flex flex-col gap-6">
      <h1 className="text-2xl font-semibold foreground-content">My Profile</h1>

      <form onSubmit={handleSubmit} className="background-surface border border-line rounded-lg p-6 flex flex-col gap-5">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}
        {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">{success}</p>}

        <div>
          <label className="block text-sm font-medium foreground-content mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            minLength={3}
            maxLength={100}
            required
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium foreground-content mb-1">New password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            placeholder="Leave blank to keep current"
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium foreground-content mb-1">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            minLength={6}
            placeholder="Leave blank to keep current"
            className="w-full border border-line rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 background-primary text-white rounded text-sm font-medium hover:background-primary-hover disabled:opacity-50 self-start"
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="background-surface border border-line rounded-lg p-6">
        <h2 className="text-sm font-semibold foreground-content mb-3">Theme</h2>
        <div className="flex flex-wrap gap-3">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme === t.id
                  ? 'border-primary background-primary-soft foreground-primary-dim'
                  : 'border-line foreground-subtle hover:border-primary hover:foreground-primary'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: t.primaryColor }}
              />
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
