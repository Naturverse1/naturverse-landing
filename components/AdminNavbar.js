import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'

export default function AdminNavbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link href="/admin-panel">Dashboard</Link>
      <Link href="/admin-feedback">Feedback</Link>
      <Link href="/admin-notifications">Notifications</Link>
      <Link href="/admin-quiz-results">Quiz Results</Link>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  )
}
