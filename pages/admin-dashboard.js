import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminNavbar from '../components/AdminNavbar.js'
import { supabase } from '../supabaseClient.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, quizzes: 0, feedback: 0, notifications: 0 })
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const { data: session } = await supabase.auth.getSession()
      setUsername(
        session.session?.user?.user_metadata?.username ||
          session.session?.user?.email ||
          'Admin'
      )
      const [u, q, f, n] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('feedback').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true })
      ])
      setStats({
        users: u.count || 0,
        quizzes: q.count || 0,
        feedback: f.count || 0,
        notifications: n.count || 0
      })
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  const cardStyle = {
    border: '1px solid #ccc',
    padding: '1rem',
    borderRadius: '8px',
    flex: '1',
    minWidth: '150px',
    textAlign: 'center'
  }

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Welcome, {username}</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={cardStyle}>
            <div>Total Users</div>
            <div style={{ fontSize: '2rem' }}>{stats.users}</div>
          </div>
          <div style={cardStyle}>
            <div>Total Quizzes</div>
            <div style={{ fontSize: '2rem' }}>{stats.quizzes}</div>
          </div>
          <div style={cardStyle}>
            <div>Total Feedback Messages</div>
            <div style={{ fontSize: '2rem' }}>{stats.feedback}</div>
          </div>
          <div style={cardStyle}>
            <div>Total Notifications Sent</div>
            <div style={{ fontSize: '2rem' }}>{stats.notifications}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
