import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function AdminNavbar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        // ignore
      }
    }
    router.push('/')
  }

  const links = [
    { href: '/admin-dashboard', label: '🏠 Dashboard' },
    { href: '/admin-feedback', label: '💬 Feedback' },
    { href: '/admin-notifications', label: '🔔 Notifications' },
    { href: '/admin-quiz-results', label: '📊 Quiz Results' },
  ]

  return (
    <>
      <button className="admin-hamburger" onClick={() => setOpen(!open)}>
        ☰
      </button>
      <nav className={`admin-sidebar ${open ? 'open' : ''}`}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
            {l.label}
          </Link>
        ))}
        <button onClick={handleLogout}>Logout</button>
      </nav>
      <style jsx>{`
        .admin-hamburger {
          display: none;
          background: none;
          border: none;
          font-size: 1.5rem;
          margin: 0.5rem;
        }
        .admin-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          border-right: 1px solid #ccc;
          min-width: 200px;
          height: 100vh;
        }
        @media (max-width: 600px) {
          .admin-hamburger {
            display: block;
          }
          .admin-sidebar {
            position: fixed;
            left: -220px;
            top: 0;
            background: white;
            width: 200px;
            transition: left 0.3s;
            z-index: 1000;
          }
          .admin-sidebar.open {
            left: 0;
          }
        }
      `}</style>
    </>
  )
}
