import { useState, useEffect, FormEvent } from 'react'
import type { UserRecord, Family, UserRole } from '../types/auth'
import { listUsers, createUser, assignFamily, changeRole, listFamilies, createFamily, deleteUser } from '../api/admin'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [families, setFamilies] = useState<Family[]>([])
  const [loadError, setLoadError] = useState('')

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('standard')
  const [createUserError, setCreateUserError] = useState('')
  const [createUserLoading, setCreateUserLoading] = useState(false)

  const [newFamilyName, setNewFamilyName] = useState('')
  const [createFamilyError, setCreateFamilyError] = useState('')
  const [createFamilyLoading, setCreateFamilyLoading] = useState(false)

  const [pendingDelete, setPendingDelete] = useState<UserRecord | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    Promise.all([listUsers(), listFamilies()])
      .then(([u, f]) => { setUsers(u); setFamilies(f) })
      .catch(err => setLoadError(err.message))
  }, [])

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    setCreateUserError('')
    setCreateUserLoading(true)
    try {
      const user = await createUser(newUsername, newPassword, newRole)
      setUsers(prev => [...prev, user].sort((a, b) => a.username.localeCompare(b.username)))
      setNewUsername('')
      setNewPassword('')
      setNewRole('standard')
    } catch (err: any) {
      setCreateUserError(err.message)
    } finally {
      setCreateUserLoading(false)
    }
  }

  async function handleCreateFamily(e: FormEvent) {
    e.preventDefault()
    setCreateFamilyError('')
    setCreateFamilyLoading(true)
    try {
      const family = await createFamily(newFamilyName)
      setFamilies(prev => [...prev, family].sort((a, b) => a.name.localeCompare(b.name)))
      setNewFamilyName('')
    } catch (err: any) {
      setCreateFamilyError(err.message)
    } finally {
      setCreateFamilyLoading(false)
    }
  }

  async function handleAssignFamily(userId: number, familyId: string) {
    const fid = familyId === '' ? null : Number(familyId)
    try {
      const updated = await assignFamily(userId, fid)
      setUsers(prev => prev.map(u => u.id === userId ? updated : u))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleChangeRole(userId: number, role: string) {
    try {
      const updated = await changeRole(userId, role as UserRole)
      setUsers(prev => prev.map(u => u.id === userId ? updated : u))
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return
    setDeleteLoading(true)
    try {
      await deleteUser(pendingDelete.id)
      setUsers(prev => prev.filter(u => u.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  const familyName = (id: number | null) =>
    id ? (families.find(f => f.id === id)?.name ?? '—') : '—'

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-gray-800">Admin</h1>

      {loadError && <p className="text-red-600 text-sm">{loadError}</p>}

      {/* Users table */}
      <section>
        <h2 className="text-lg font-medium text-gray-700 mb-3">Users</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Username</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Role</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Family</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Actions</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className={u.id === currentUser?.id ? 'bg-indigo-50' : ''}>
                  <td className="px-4 py-2 text-gray-800">
                    {u.username}
                    {u.id === currentUser?.id && <span className="ml-2 text-xs text-indigo-500">(you)</span>}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      onChange={e => handleChangeRole(u.id, e.target.value)}
                      disabled={u.id === currentUser?.id}
                      className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-50"
                    >
                      <option value="admin">Admin</option>
                      <option value="standard">Standard</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{familyName(u.family_id)}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.family_id ?? ''}
                      onChange={e => handleAssignFamily(u.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">No family</option>
                      {families.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setPendingDelete(u)}
                      disabled={u.id === currentUser?.id}
                      className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-400">No users</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create user form */}
        <form onSubmit={handleCreateUser} className="mt-4 flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Username</label>
            <input
              type="text"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
              required
              minLength={3}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="username"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="password"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Role</label>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value as UserRole)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            >
              <option value="standard">Standard</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={createUserLoading}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createUserLoading ? 'Creating...' : 'Create user'}
          </button>
          {createUserError && <p className="text-xs text-red-600 w-full">{createUserError}</p>}
        </form>
      </section>

      {/* Families table */}
      <section>
        <h2 className="text-lg font-medium text-gray-700 mb-3">Families</h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Name</th>
                <th className="text-left px-4 py-2 text-gray-600 font-medium">Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {families.map(f => (
                <tr key={f.id}>
                  <td className="px-4 py-2 text-gray-800">{f.name}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {users.filter(u => u.family_id === f.id).map(u => u.username).join(', ') || '—'}
                  </td>
                </tr>
              ))}
              {families.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-4 text-center text-gray-400">No families</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Create family form */}
        <form onSubmit={handleCreateFamily} className="mt-4 flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Family name</label>
            <input
              type="text"
              value={newFamilyName}
              onChange={e => setNewFamilyName(e.target.value)}
              required
              className="border border-gray-300 rounded px-2 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="family name"
            />
          </div>
          <button
            type="submit"
            disabled={createFamilyLoading}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {createFamilyLoading ? 'Creating...' : 'Create family'}
          </button>
          {createFamilyError && <p className="text-xs text-red-600">{createFamilyError}</p>}
        </form>
      </section>

      {/* Delete confirmation modal */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Delete user</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-gray-900">{pendingDelete.username}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
