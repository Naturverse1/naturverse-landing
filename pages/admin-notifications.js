import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminNotifications() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('all')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const [notifRes, userRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase.from('users').select('id, email')
      ])
      setNotifications(notifRes.data || [])
      setUsers(userRes.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payloads = []
    if (target === 'all') {
      payloads.push(
        ...users.map((u) => ({
          user_id: u.id,
          title,
          message,
          type: 'admin',
          is_read: false,
        }))
      )
    } else {
      payloads.push({
        user_id: target,
        title,
        message,
        type: 'admin',
        is_read: false,
      })
    }
    if (payloads.length > 0) {
      await supabase.from('notifications').insert(payloads)
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      setNotifications(data || [])
    }
    setTitle('')
    setMessage('')
    setTarget('all')
    setSubmitting(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Notifications</h1>
        <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
          <div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
            />
          </div>
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message"
              required
              rows={3}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <select value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Send'}
          </button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((n) => (
            <li
              key={n.id}
              style={{
                backgroundColor: n.is_read ? 'white' : '#eef',
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #ccc',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{n.title}</div>
              <div>{n.message}</div>
              <span
                style={{
                  display: 'inline-block',
                  margin: '0.5rem 0',
                  padding: '0.25rem 0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              >
                {n.type}
              </span>
              <div>{new Date(n.created_at).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
