import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminFeedback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState([])
  const pageSize = 20
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const { data } = await supabase
        .from('feedback')
        .select('id, user_id, email, subject, message, created_at, users(username)')
        .order('created_at', { ascending: false })
        .range(0, pageSize - 1)
      setFeedback(data || [])
      setHasMore((data || []).length === pageSize)
      setLoading(false)
    }
    load()
  }, [router])

  const loadMore = async () => {
    const from = (page + 1) * pageSize
    const to = from + pageSize - 1
    const { data } = await supabase
      .from('feedback')
      .select('id, user_id, email, subject, message, created_at, users(username)')
      .order('created_at', { ascending: false })
      .range(from, to)
    if (data && data.length > 0) {
      setFeedback((prev) => [...prev, ...data])
      setPage((p) => p + 1)
      setHasMore(data.length === pageSize)
    } else {
      setHasMore(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Feedback</h1>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>User / Email</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <td>{f.users?.username || f.email || 'Unknown'}</td>
                  <td>{f.subject}</td>
                  <td>{f.message}</td>
                  <td>{new Date(f.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <button onClick={loadMore} style={{ marginTop: '1rem' }}>
            Load More
          </button>
        )}
      </main>
    </div>
  )
}
