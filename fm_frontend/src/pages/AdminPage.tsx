import { useState, useEffect, FormEvent } from 'react'
import type { UserRecord, FamilyWithMembers, UserRole } from '../types/auth'
import {
  listUsers, createUser, assignFamily, changeRole,
  deactivateUser, activateUser,
  listFamilies, createFamily, renameFamily, deleteFamily,
} from '../api/admin'
import { useAuth } from '../context/AuthContext'

type Tab = 'users' | 'families'

// ─── Shared modal ─────────────────────────────────────────────────────────────
function ConfirmModal({
  title, message, confirmLabel = 'Confirm', danger = false,
  onConfirm, onCancel, loading,
}: {
  title: string
  message: React.ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="background-surface rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-semibold foreground-content mb-2">{title}</h3>
        <div className="text-sm foreground-subtle mb-6">{message}</div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-2 text-sm foreground-content border border-line rounded hover:background-surface-raised disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`px-4 py-2 text-sm text-white rounded disabled:opacity-50 ${danger ? 'bg-red-600 hover:bg-red-700' : 'background-primary hover:background-primary-hover'}`}>
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Users tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [families, setFamilies] = useState<FamilyWithMembers[]>([])
  const [includeInactive, setIncludeInactive] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<UserRole>('standard')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [pendingDeactivate, setPendingDeactivate] = useState<UserRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    listFamilies().then(setFamilies).catch(() => {})
  }, [])

  useEffect(() => {
    setLoadError('')
    listUsers(includeInactive)
      .then(setUsers)
      .catch(err => setLoadError(err.message))
  }, [includeInactive])

  async function handleCreateUser(e: FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)
    try {
      const user = await createUser(newUsername, newPassword, newRole)
      setUsers(prev => [...prev, user].sort((a, b) => a.username.localeCompare(b.username)))
      setNewUsername('')
      setNewPassword('')
      setNewRole('standard')
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreateLoading(false)
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

  async function handleConfirmDeactivate() {
    if (!pendingDeactivate) return
    setActionLoading(true)
    try {
      await deactivateUser(pendingDeactivate.id)
      if (includeInactive) {
        setUsers(prev => prev.map(u => u.id === pendingDeactivate.id ? { ...u, is_active: false } : u))
      } else {
        setUsers(prev => prev.filter(u => u.id !== pendingDeactivate.id))
      }
      setPendingDeactivate(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleActivate(userId: number) {
    try {
      const updated = await activateUser(userId)
      setUsers(prev => prev.map(u => u.id === userId ? updated : u))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const familyName = (id: number | null) =>
    id ? (families.find(f => f.id === id)?.name ?? '—') : '—'

  return (
    <div className="flex flex-col gap-6">
      {loadError && <p className="text-red-600 text-sm">{loadError}</p>}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium foreground-content">Users</h2>
        <label className="flex items-center gap-2 text-sm foreground-subtle cursor-pointer select-none">
          <input
            type="checkbox" checked={includeInactive}
            onChange={e => setIncludeInactive(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show inactive users
        </label>
      </div>

      <div className="background-surface rounded-lg border border-line overflow-hidden">
        <table className="w-full text-sm">
          <thead className="background-canvas border-b border-line">
            <tr>
              <th className="text-left px-4 py-2 foreground-subtle font-medium">Username</th>
              <th className="text-left px-4 py-2 foreground-subtle font-medium">Role</th>
              <th className="text-left px-4 py-2 foreground-subtle font-medium">Family</th>
              <th className="text-left px-4 py-2 foreground-subtle font-medium">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {users.map(u => (
              <tr key={u.id} className={`${u.id === currentUser?.id ? 'background-primary-soft' : ''} ${!u.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2 foreground-content">
                  {u.username}
                  {u.id === currentUser?.id && <span className="ml-2 text-xs foreground-primary">(you)</span>}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={e => handleChangeRole(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id || !u.is_active}
                    className="border border-line rounded px-2 py-1 text-xs disabled:opacity-50"
                  >
                    <option value="admin">Admin</option>
                    <option value="standard">Standard</option>
                  </select>
                </td>
                <td className="px-4 py-2 foreground-subtle">{familyName(u.family_id)}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.is_active ? 'bg-green-100 text-green-700' : 'background-surface-raised foreground-subtle'}`}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  {u.is_active ? (
                    <button
                      onClick={() => setPendingDeactivate(u)}
                      disabled={u.id === currentUser?.id}
                      className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(u.id)}
                      className="px-2 py-1 text-xs text-green-700 border border-green-300 rounded hover:bg-green-50"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-4 text-center foreground-dim">No users</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create user */}
      <form onSubmit={handleCreateUser} className="flex gap-2 items-end flex-wrap">
        <div>
          <label className="block text-xs foreground-subtle mb-1">Username</label>
          <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
            required minLength={3}
            className="border border-line rounded px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="username" />
        </div>
        <div>
          <label className="block text-xs foreground-subtle mb-1">Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
            required minLength={6}
            className="border border-line rounded px-2 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="password" />
        </div>
        <div>
          <label className="block text-xs foreground-subtle mb-1">Role</label>
          <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)}
            className="border border-line rounded px-2 py-1.5 text-sm">
            <option value="standard">Standard</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" disabled={createLoading}
          className="px-3 py-1.5 background-primary text-white rounded text-sm font-medium hover:background-primary-hover disabled:opacity-50">
          {createLoading ? 'Creating...' : 'Create user'}
        </button>
        {createError && <p className="text-xs text-red-600 w-full">{createError}</p>}
      </form>

      {pendingDeactivate && (
        <ConfirmModal
          title="Deactivate user"
          message={<>Are you sure you want to deactivate <span className="font-medium foreground-content">{pendingDeactivate.username}</span>? They will no longer be able to log in.</>}
          confirmLabel="Deactivate" danger
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setPendingDeactivate(null)}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

// ─── Families tab ─────────────────────────────────────────────────────────────
function FamiliesTab() {
  const [families, setFamilies] = useState<FamilyWithMembers[]>([])
  const [allUsers, setAllUsers] = useState<UserRecord[]>([])
  const [loadError, setLoadError] = useState('')

  const [newFamilyName, setNewFamilyName] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameError, setRenameError] = useState('')

  const [pendingDeleteFamily, setPendingDeleteFamily] = useState<FamilyWithMembers | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [userSearch, setUserSearch] = useState('')
  const [pendingAssign, setPendingAssign] = useState<{ user: UserRecord; familyId: number } | null>(null)
  const [assignLoading, setAssignLoading] = useState(false)

  const [expandedFamily, setExpandedFamily] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([listFamilies(), listUsers(true)])
      .then(([f, u]) => { setFamilies(f); setAllUsers(u) })
      .catch(err => setLoadError(err.message))
  }, [])

  async function handleCreateFamily(e: FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateLoading(true)
    try {
      const family = await createFamily(newFamilyName)
      setFamilies(prev => [...prev, { ...family, users: [] }].sort((a, b) => a.name.localeCompare(b.name)))
      setNewFamilyName('')
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleRename(familyId: number) {
    setRenameError('')
    try {
      const updated = await renameFamily(familyId, renameValue)
      setFamilies(prev =>
        prev.map(f => f.id === familyId ? { ...updated, users: f.users } : f)
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setRenamingId(null)
    } catch (err: any) {
      setRenameError(err.message)
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteFamily) return
    setDeleteLoading(true)
    try {
      await deleteFamily(pendingDeleteFamily.id)
      setFamilies(prev => prev.filter(f => f.id !== pendingDeleteFamily.id))
      setAllUsers(prev => prev.map(u => u.family_id === pendingDeleteFamily.id ? { ...u, family_id: null } : u))
      setPendingDeleteFamily(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleRemoveFromFamily(userId: number, familyId: number) {
    try {
      await assignFamily(userId, null)
      setFamilies(prev => prev.map(f =>
        f.id === familyId ? { ...f, users: f.users.filter(u => u.id !== userId) } : f
      ))
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, family_id: null } : u))
    } catch (err: any) {
      alert(err.message)
    }
  }

  function doAssign(user: UserRecord, familyId: number) {
    assignFamily(user.id, familyId).then(updated => {
      const member = { id: updated.id, username: updated.username, role: updated.role, is_active: updated.is_active }
      setFamilies(prev => prev.map(f => {
        if (f.id === user.family_id) return { ...f, users: f.users.filter(u => u.id !== user.id) }
        if (f.id === familyId) return { ...f, users: [...f.users, member] }
        return f
      }))
      setAllUsers(prev => prev.map(u => u.id === user.id ? { ...u, family_id: familyId } : u))
      setUserSearch('')
    }).catch(err => alert(err.message))
  }

  function handleAssignClick(user: UserRecord, familyId: number) {
    if (user.family_id !== null) {
      setPendingAssign({ user, familyId })
    } else {
      doAssign(user, familyId)
    }
  }

  async function handleConfirmAssign() {
    if (!pendingAssign) return
    setAssignLoading(true)
    try {
      doAssign(pendingAssign.user, pendingAssign.familyId)
      setPendingAssign(null)
    } finally {
      setAssignLoading(false)
    }
  }

  const familyName = (id: number | null) =>
    id ? (families.find(f => f.id === id)?.name ?? '—') : '—'

  const filteredUsers = allUsers.filter(u =>
    u.is_active && u.username.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {loadError && <p className="text-red-600 text-sm">{loadError}</p>}

      <h2 className="text-lg font-medium foreground-content">Families</h2>

      {/* Family list */}
      <div className="flex flex-col gap-3">
        {families.map(f => (
          <div key={f.id} className="background-surface border border-line rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
              {renamingId === f.id ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    autoFocus type="text" value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(f.id); if (e.key === 'Escape') setRenamingId(null) }}
                    className="border border-line rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-48"
                  />
                  <button onClick={() => handleRename(f.id)} className="text-xs foreground-primary hover:underline">Save</button>
                  <button onClick={() => setRenamingId(null)} className="text-xs foreground-subtle hover:underline">Cancel</button>
                  {renameError && <span className="text-xs text-red-600">{renameError}</span>}
                </div>
              ) : (
                <span className="font-medium foreground-content flex-1">{f.name}</span>
              )}
              <span className="text-xs foreground-dim">{f.users.length} member{f.users.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => setExpandedFamily(expandedFamily === f.id ? null : f.id)}
                className="text-xs foreground-subtle hover:foreground-content"
              >
                {expandedFamily === f.id ? 'Hide' : 'Show'} members
              </button>
              {renamingId !== f.id && (
                <button
                  onClick={() => { setRenamingId(f.id); setRenameValue(f.name); setRenameError('') }}
                  className="text-xs foreground-primary hover:underline"
                >
                  Rename
                </button>
              )}
              <button onClick={() => setPendingDeleteFamily(f)} className="text-xs text-red-500 hover:underline">
                Delete
              </button>
            </div>

            {expandedFamily === f.id && (
              <div className="border-t border-divider">
                {f.users.length === 0 ? (
                  <p className="px-4 py-3 text-sm foreground-dim">No members</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-divider">
                      {f.users.map(u => (
                        <tr key={u.id} className="hover:background-surface-raised">
                          <td className="px-4 py-2 foreground-content">{u.username}</td>
                          <td className="px-4 py-2 foreground-subtle text-xs capitalize">{u.role}</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleRemoveFromFamily(u.id, f.id)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
        {families.length === 0 && <p className="text-sm foreground-dim">No families yet</p>}
      </div>

      {/* Create family */}
      <form onSubmit={handleCreateFamily} className="flex gap-2 items-end">
        <div>
          <label className="block text-xs foreground-subtle mb-1">Family name</label>
          <input type="text" value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)}
            required
            className="border border-line rounded px-2 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="family name" />
        </div>
        <button type="submit" disabled={createLoading}
          className="px-3 py-1.5 background-primary text-white rounded text-sm font-medium hover:background-primary-hover disabled:opacity-50">
          {createLoading ? 'Creating...' : 'Create family'}
        </button>
        {createError && <p className="text-xs text-red-600">{createError}</p>}
      </form>

      {/* Assign user to family */}
      <div>
        <h3 className="text-base font-medium foreground-content mb-3">Assign user to family</h3>
        <input
          type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)}
          placeholder="Search users..."
          className="border border-line rounded px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
        />
        {userSearch && (
          <div className="background-surface border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="background-canvas border-b border-line">
                <tr>
                  <th className="text-left px-4 py-2 foreground-subtle font-medium">Username</th>
                  <th className="text-left px-4 py-2 foreground-subtle font-medium">Current family</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 foreground-content">{u.username}</td>
                    <td className="px-4 py-2 foreground-subtle">{familyName(u.family_id)}</td>
                    <td className="px-4 py-2">
                      <select
                        value=""
                        onChange={e => { if (e.target.value) handleAssignClick(u, Number(e.target.value)) }}
                        className="border border-line rounded px-2 py-1 text-xs"
                      >
                        <option value="" disabled>Assign to...</option>
                        {families.filter(f => f.id !== u.family_id).map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-3 text-center foreground-dim">No active users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pendingDeleteFamily && (
        <ConfirmModal
          title="Delete family"
          message={<>Are you sure you want to delete <span className="font-medium foreground-content">{pendingDeleteFamily.name}</span>? Its {pendingDeleteFamily.users.length} member{pendingDeleteFamily.users.length !== 1 ? 's' : ''} will become family-less.</>}
          confirmLabel="Delete" danger
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDeleteFamily(null)}
          loading={deleteLoading}
        />
      )}

      {pendingAssign && (
        <ConfirmModal
          title="Move user"
          message={<><span className="font-medium foreground-content">{pendingAssign.user.username}</span> is currently in <span className="font-medium foreground-content">{familyName(pendingAssign.user.family_id)}</span>. Move them to <span className="font-medium foreground-content">{families.find(f => f.id === pendingAssign.familyId)?.name}</span>?</>}
          confirmLabel="Move"
          onConfirm={handleConfirmAssign}
          onCancel={() => setPendingAssign(null)}
          loading={assignLoading}
        />
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold foreground-content">Admin</h1>

      <div className="flex border-b border-line">
        {(['users', 'families'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-primary foreground-primary'
                : 'border-transparent foreground-subtle hover:foreground-content'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'families' && <FamiliesTab />}
    </div>
  )
}
