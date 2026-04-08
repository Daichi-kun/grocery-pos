import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { useSettingsStore } from './store/useSettingsStore'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Sidebar from './components/Layout/Sidebar'

import LoginPage    from './pages/Login/LoginPage'
import POSPage      from './pages/POS/POSPage'
import InventoryPage from './pages/Inventory/InventoryPage'
import PurchasesPage from './pages/Purchases/PurchasesPage'
import ReturnsPage  from './pages/Returns/ReturnsPage'
import ReportsPage  from './pages/Reports/ReportsPage'
import SettingsPage from './pages/Settings/SettingsPage'
import UsersPage    from './pages/Users/UsersPage'

function AppLayout() {
  const user = useAuthStore(s => s.user)
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  if (isLogin || !user) return null

  return <Sidebar />
}

function AppRoutes() {
  const user = useAuthStore(s => s.user)
  const loadSettings = useSettingsStore(s => s.loadSettings)

  useEffect(() => {
    if (user) loadSettings()
  }, [user])

  return (
    <div className="flex h-screen overflow-hidden">
      <AppLayout />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pos" element={<ProtectedRoute><POSPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><PurchasesPage /></ProtectedRoute>} />
          <Route path="/returns" element={<ProtectedRoute><ReturnsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/pos' : '/login'} replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
