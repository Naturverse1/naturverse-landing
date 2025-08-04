import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../supabaseClient.js'
import { protectAdmin } from '../../lib/protectAdmin.js'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ users: 0, avatars: 0, quizzes: 0, stamps: 0 })
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const [u, a, q, s, f] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('avatars').select('id', { count: 'exact', head: true }),
        supabase.from('quizzes').select('id', { count: 'exact', head: true }),
        supabase.from('stamps').select('id', { count: 'exact', head: true }),
        supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
      ])
      setStats({
        users: u.count || 0,
        avatars: a.count || 0,
        quizzes: q.count || 0,
        stamps: s.count || 0,
      })
      setFeedback(f.data || [])
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
    textAlign: 'center',
  }

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div style={cardStyle}>
          <div>Total Users</div>
          <div style={{ fontSize: '2rem' }}>{stats.users}</div>
        </div>
        <div style={cardStyle}>
          <div>Total Avatars</div>
          <div style={{ fontSize: '2rem' }}>{stats.avatars}</div>
        </div>
        <div style={cardStyle}>
          <div>Quizzes Created</div>
          <div style={{ fontSize: '2rem' }}>{stats.quizzes}</div>
        </div>
        <div style={cardStyle}>
          <div>Stamps Earned</div>
          <div style={{ fontSize: '2rem' }}>{stats.stamps}</div>
        </div>
      </div>
      <h2>Recent Feedback</h2>
      <ul>
        {feedback.map((f) => (
          <li key={f.id}>{f.message}</li>
        ))}
      </ul>
    </main>
  )
}

