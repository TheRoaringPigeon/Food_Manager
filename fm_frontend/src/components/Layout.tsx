import { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Layout() {
  const { user, logout, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const navItems = [
    { to: '/ingredients', label: 'Ingredients' },
    { to: '/recipes', label: 'Recipes' },
    { to: '/recommendations', label: 'What should I cook?' },
    { to: '/shopping-list', label: 'Shopping List' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen background-canvas">
      <header className="background-surface border-b border-line shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center h-14 gap-3">

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setDrawerOpen(v => !v)}
            className="md:hidden p-1.5 rounded foreground-subtle hover:foreground-content hover:background-surface-raised transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {drawerOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>

          <span className="font-semibold foreground-content text-lg">Food Manager</span>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1 ml-4">
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

          {/* Right side — always visible */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/shopping-list"
              className="relative foreground-subtle hover:foreground-primary transition-colors"
              title="Shopping List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 background-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="text-sm foreground-subtle hover:foreground-primary transition-colors hidden md:inline">
              {user?.username}
            </Link>
            <button
              onClick={handleLogout}
              className="hidden md:inline px-3 py-1.5 text-sm foreground-subtle border border-line rounded hover:background-surface-raised transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed top-0 left-0 z-50 h-full w-64 background-surface border-r border-line shadow-xl flex flex-col md:hidden">
            <div className="flex items-center h-14 px-4 border-b border-line">
              <span className="font-semibold foreground-content text-lg">Food Manager</span>
            </div>
            <nav className="flex flex-col gap-1 p-3 flex-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `px-3 py-3 rounded text-sm font-medium transition-colors ${
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
            <div className="p-3 border-t border-line flex flex-col gap-2">
              <Link
                to="/profile"
                className="px-3 py-3 rounded text-sm foreground-subtle hover:foreground-content hover:background-surface-raised transition-colors"
              >
                {user?.username}
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2.5 text-sm foreground-subtle border border-line rounded hover:background-surface-raised transition-colors text-left"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
