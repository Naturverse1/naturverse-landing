import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminPanel() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const ok = await protectAdmin(router)
      if (ok) setLoading(false)
    }
    check()
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Admin Panel</h1>
      </main>
    </div>
  )
}
