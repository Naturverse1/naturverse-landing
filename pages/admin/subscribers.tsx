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
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const router = useRouter()

  const PAGE_SIZE = 10

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

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
      setLoading(true)
      let query = supabaseAdmin
        .from('subscribers')
        .select('id,email,interests,created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (debouncedSearch) {
        query = query.or(
          `email.ilike.%${debouncedSearch}%,interests.ilike.%${debouncedSearch}%`
        )
      }
      const { data, count } = await query
      setSubs(data || [])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
  }, [router, page, debouncedSearch])

  if (loading) return <div>Loading...</div>

  const exportCsv = () => {
    const headers = ['Email', 'Interests', 'Created At']
    const rows = subs.map((s) => [
      s.email,
      Array.isArray(s.interests) ? s.interests.join(', ') : s.interests || '',
      new Date(s.created_at).toISOString(),
    ])
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'subscribers-export.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Subscribers</h1>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Search by email or interest"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="px-2 py-1 border rounded"
        />
        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Export CSV
        </button>
      </div>
      {subs.length === 0 ? (
        <div>No subscribers found.</div>
      ) : (
        <>
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
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))} (Total: {total})
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * PAGE_SIZE >= total}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  )
}

