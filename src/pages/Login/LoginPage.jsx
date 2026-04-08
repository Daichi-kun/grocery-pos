import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const usernameRef = useRef(null)
  const setUser = useAuthStore(s => s.setUser)
  const navigate = useNavigate()

  useEffect(() => {
    usernameRef.current?.focus()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) return

    setLoading(true)
    try {
      const user = await window.electronAPI.auth.login({ username, password })
      if (user) {
        setUser(user)
        navigate('/pos', { replace: true })
      } else {
        toast.error('Неверный логин или пароль')
        setPassword('')
      }
    } catch (err) {
      toast.error('Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900">GroceryPOS</h1>
          <p className="text-gray-500 text-sm mt-1">Кассовая система</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
            <input
              ref={usernameRef}
              type="text"
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-primary btn-lg w-full mt-2"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          admin / admin123 &nbsp;·&nbsp; cashier / cashier123
        </p>
      </div>
    </div>
  )
}
