import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../supabaseClient.js'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

interface Subscriber {
  id: string
  email: string
  interests: string | null
  created_at: string
}

export default function Subscribers() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const allowed = (process.env.ALLOWED_ADMINS || '')
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
      if (!user?.email || !allowed.includes(user.email)) {
        router.push('/')
        return
      }
      const { data } = await supabaseAdmin
        .from('subscribers')
        .select('id,email,interests,created_at')
        .order('created_at', { ascending: false })
      setSubs(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Subscribers</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2 text-left">Email</th>
            <th className="border px-4 py-2 text-left">Interests</th>
            <th className="border px-4 py-2 text-left">Created At</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.email}</td>
              <td className="border px-4 py-2">{Array.isArray(s.interests) ? s.interests.join(', ') : s.interests || ''}</td>
              <td className="border px-4 py-2">{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

