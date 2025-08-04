import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminNotifications() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      setNotifications(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Notifications</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {notifications.map((n) => (
            <li
              key={n.id}
              style={{
                backgroundColor: n.read ? 'white' : '#eef',
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
