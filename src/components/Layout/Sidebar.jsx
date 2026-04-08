import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import clsx from 'clsx'

const allNavItems = [
  { to: '/pos',        icon: '🛒', label: 'Касса',      roles: ['admin', 'cashier'] },
  { to: '/returns',    icon: '↩️', label: 'Возвраты',   roles: ['admin', 'cashier'] },
  { to: '/inventory',  icon: '📦', label: 'Товары',     roles: ['admin'] },
  { to: '/purchases',  icon: '🚚', label: 'Закупки',    roles: ['admin'] },
  { to: '/reports',    icon: '📊', label: 'Отчёты',     roles: ['admin'] },
  { to: '/settings',   icon: '⚙️', label: 'Настройки',  roles: ['admin'] },
  { to: '/users',      icon: '👥', label: 'Сотрудники', roles: ['admin'] },
]

export default function Sidebar() {
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const storeName = useSettingsStore(s => s.storeName)

  const navItems = allNavItems.filter(i => i.roles.includes(user?.role))

  return (
    <aside className="w-56 bg-gray-900 text-white flex flex-col h-screen shrink-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-700">
        <div className="text-lg font-bold text-white truncate">{storeName}</div>
        <div className="text-xs text-gray-400 mt-0.5">POS система</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="text-sm font-medium text-white truncate">{user?.full_name}</div>
        <div className="text-xs text-gray-400 capitalize">{user?.role === 'admin' ? 'Администратор' : 'Кассир'}</div>
        <button
          onClick={logout}
          className="mt-3 w-full text-xs text-gray-400 hover:text-white py-1.5 hover:bg-gray-800 rounded transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  )
}
