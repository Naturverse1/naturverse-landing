import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { markNotificationAsRead } from '../userFeatures.js'

export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
      setNotifications(data || [])
    }
    load()
  }, [])

  const handleMarkRead = async (id) => {
    await markNotificationAsRead(id)
    setNotifications((n) => n.filter((item) => item.id !== id))
  }

  return (
    <div style={{ position: 'relative', marginRight: '1rem' }}>
      <button onClick={() => setOpen(!open)}>
        🔔{notifications.length > 0 ? ` (${notifications.length})` : ''}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            background: '#fff',
            border: '1px solid #ccc',
            width: 300,
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {notifications.length === 0 && (
            <div style={{ padding: '0.5rem' }}>No new notifications</div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ borderBottom: '1px solid #eee', padding: '0.5rem' }}
            >
              <div style={{ fontWeight: 'bold' }}>{n.title}</div>
              <div style={{ fontSize: '0.875rem' }}>
                {n.message.length > 50
                  ? `${n.message.slice(0, 50)}...`
                  : n.message}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                {new Date(n.created_at).toLocaleString()}
              </div>
              <button
                onClick={() => handleMarkRead(n.id)}
                style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}
              >
                Mark as read
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
