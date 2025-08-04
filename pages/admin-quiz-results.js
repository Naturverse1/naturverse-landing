import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminQuizResults() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState([])
  const [sortField, setSortField] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)

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

  const sorted = [...results]
  if (sortField === 'user') {
    sorted.sort((a, b) => {
      const aVal = a.users?.username || ''
      const bVal = b.users?.username || ''
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  } else if (sortField === 'quiz') {
    sorted.sort((a, b) => {
      const aVal = a.quizzes?.title || ''
      const bVal = b.quizzes?.title || ''
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    })
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Quiz Results</h1>
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('user')} style={{ cursor: 'pointer' }}>
                User {sortField === 'user' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('quiz')} style={{ cursor: 'pointer' }}>
                Quiz {sortField === 'quiz' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Score</th>
              <th>Completed At</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, idx) => (
              <tr key={idx}>
                <td>{r.users?.username}</td>
                <td>{r.quizzes?.title}</td>
                <td>{r.score}</td>
                <td>{new Date(r.completed_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}
