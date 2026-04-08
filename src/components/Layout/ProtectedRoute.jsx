import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const adminOnlyRoutes = ['/inventory', '/purchases', '/reports', '/settings', '/users']

export default function ProtectedRoute({ children }) {
  const user = useAuthStore(s => s.user)

  if (!user) return <Navigate to="/login" replace />

  const path = window.location.pathname
  if (user.role === 'cashier' && adminOnlyRoutes.some(r => path.startsWith(r))) {
    return <Navigate to="/pos" replace />
  }

  return children
}
