import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { to: '/ingredients', label: 'Ingredients' },
    { to: '/recipes', label: 'Recipes' },
    { to: '/recommendations', label: 'What should I cook?' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen background-canvas">
      <header className="background-surface border-b border-line shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center gap-8 h-14">
          <span className="font-semibold foreground-content text-lg">Food Manager</span>
          <nav className="flex gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'background-primary-soft foreground-primary-dim'
                      : 'foreground-subtle hover:foreground-content hover:background-surface-raised'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/profile" className="text-sm foreground-subtle hover:foreground-primary transition-colors">
              {user?.username}
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm foreground-subtle border border-line rounded hover:background-surface-raised transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
