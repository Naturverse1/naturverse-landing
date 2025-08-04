import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminQuizResults() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const { data } = await supabase
        .from('user_quiz_attempts')
        .select('score, completed_at, users ( username ), quizzes ( title )')
        .order('completed_at', { ascending: false })
      setResults(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <AdminNavbar />
      <h1>Quiz Results</h1>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Quiz</th>
            <th>Score</th>
            <th>Completed At</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, idx) => (
            <tr key={idx}>
              <td>{r.users?.username}</td>
              <td>{r.quizzes?.title}</td>
              <td>{r.score}</td>
              <td>{new Date(r.completed_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
