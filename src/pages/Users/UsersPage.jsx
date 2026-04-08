import { useState, useEffect, useCallback } from 'react'
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users.api'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'

function UserForm({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'cashier' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ username: user.username, password: '', full_name: user.full_name, role: user.role })
    } else {
      setForm({ username: '', password: '', full_name: '', role: 'cashier' })
    }
  }, [user, open])

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user && !form.password) { toast.error('Введите пароль'); return }

    setLoading(true)
    try {
      if (user) {
        await updateUser(user.id, { full_name: form.full_name, role: form.role, password: form.password || undefined })
        toast.success('Сотрудник обновлён')
      } else {
        await createUser(form)
        toast.success('Сотрудник добавлен')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Редактировать сотрудника' : 'Новый сотрудник'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
          <input className="input" value={form.full_name} onChange={set('full_name')} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
          <input className="input" value={form.username} onChange={set('username')} required disabled={!!user} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Пароль {user && <span className="text-gray-400 font-normal">(оставьте пустым, если не менять)</span>}
          </label>
          <input className="input" type="password" value={form.password} onChange={set('password')}
            required={!user} placeholder={user ? 'Новый пароль (необязательно)' : ''} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="cashier">Кассир</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>Отмена</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Сохранение...' : user ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setUsers(await getUsers()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(user) {
    if (!confirm(`Удалить сотрудника "${user.full_name}"?`)) return
    try {
      await deleteUser(user.id)
      toast.success('Сотрудник удалён')
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Сотрудники</h1>
        <button className="btn-primary" onClick={() => { setEditUser(null); setFormOpen(true) }}>+ Добавить</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Сотрудник</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Логин</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Роль</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{u.username}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'blue' : 'default'}>
                      {u.role === 'admin' ? 'Администратор' : 'Кассир'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? 'green' : 'default'}>
                      {u.is_active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button className="btn-secondary btn-sm" onClick={() => { setEditUser(u); setFormOpen(true) }}>Изм.</button>
                      <button className="btn btn-sm text-red-600 hover:bg-red-50" onClick={() => handleDelete(u)}>Удал.</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserForm open={formOpen} onClose={() => setFormOpen(false)} user={editUser} onSaved={load} />
    </div>
  )
}
