import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../supabaseClient.js'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import SearchBar from '../../components/SearchBar'
import AdminSubscriberTable, { Subscriber } from '../../components/AdminSubscriberTable'
import { exportToCsv } from '../../utils/exportCsv'
import { isAdmin } from '../../utils/isAdmin'

export default function SubscribersPage() {
  const [subs, setSubs] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const PAGE_SIZE = 10

  useEffect(() => {
    async function protect() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !isAdmin(user.email)) {
        router.replace('/')
        return
      }
    }
    protect()
  }, [router])

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabaseAdmin
        .from('subscribers')
        .select('id,email,interests,created_at,source', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      if (search) {
        query = query.or(`email.ilike.%${search}%,interests.ilike.%${search}%`)
      }
      const { data, count } = await query
      setSubs(data || [])
      setTotal(count || 0)
      setLoading(false)
    }
    load()
  }, [page, search])

  const handleExport = () => {
    const headers = ['Email', 'Interest', 'Created Date', 'Source']
    const rows = subs.map((s) => [
      s.email,
      Array.isArray(s.interests) ? s.interests.join(', ') : s.interests || '',
      new Date(s.created_at).toISOString(),
      s.source || '',
    ])
    exportToCsv('subscribers-export.csv', headers, rows)
  }

  const handleDelete = async (id: string) => {
    await supabaseAdmin.from('subscribers').delete().eq('id', id)
    setSubs((curr) => curr.filter((s) => s.id !== id))
    setTotal((t) => t - 1)
  }

  if (loading) return <div>Loading...</div>

  return (
    <main className="p-4">
      <h1 className="text-2xl mb-4">Subscribers</h1>
      <div className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <SearchBar onSearch={(val) => { setSearch(val); setPage(1) }} placeholder="Search by email or interest" />
        <button onClick={handleExport} className="px-4 py-2 bg-blue-500 text-white rounded">
          Export CSV
        </button>
      </div>
      <AdminSubscriberTable
        subscribers={subs}
        page={page}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onDelete={handleDelete}
      />
    </main>
  )
}
