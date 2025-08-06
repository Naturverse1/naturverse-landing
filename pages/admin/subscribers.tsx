import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { exportCsv } from '@/utils/exportCsv'
import SearchBar from '@/components/SearchBar'
import AdminSubscriberTable from '@/components/AdminSubscriberTable'
import { isAdmin } from '@/utils/isAdmin'

interface Subscriber {
  id: string
  email: string
  interests: string | null
  created_at: string
  source: string | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminSubscribers() {
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email || ''
      if (!isAdmin(email)) router.push('/')
    })
  }, [router])

  useEffect(() => {
    fetchSubscribers()
  }, [page, search])

  async function fetchSubscribers() {
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    let query = supabase
      .from('subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      const term = `%${search}%`
      query = query.or(`email.ilike.${term},interests.ilike.${term}`)
    }

    const { data, count } = await query
    setSubscribers((data as Subscriber[]) || [])
    setTotal(count || 0)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin: Subscribers</h1>
      <SearchBar
        search={search}
        setSearch={(v) => {
          setPage(1)
          setSearch(v)
        }}
      />
      <AdminSubscriberTable
        subscribers={subscribers}
        page={page}
        total={total}
        pageSize={perPage}
        onPageChange={setPage}
      />
      <button
        onClick={() => exportCsv(subscribers as any[])}
        className="px-4 py-2 mt-4 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Export CSV
      </button>
    </div>
  )
}

