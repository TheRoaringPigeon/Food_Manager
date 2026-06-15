import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface Props {
  adminOnly?: boolean
}

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" replace />
  if (user.must_change_password && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />
  }
  if (adminOnly && user.role !== 'admin') return <Navigate to="/ingredients" replace />
  return <Outlet />
}
