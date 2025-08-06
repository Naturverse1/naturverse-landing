import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { exportCsv } from '@/utils/exportCsv'
import SearchBar from '@/components/SearchBar'
import SubscriberTable from '@/components/SubscriberTable'
import { isAdmin } from '@/utils/isAdmin'

interface Subscriber {
  email: string
  interest?: string | null
  created_at: string
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminSubscribers() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filtered, setFiltered] = useState<Subscriber[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email || ''
      setUserEmail(email)
      if (!isAdmin(email)) router.push('/')
    })
  }, [router])

  useEffect(() => {
    fetchSubscribers()
  }, [page])

  useEffect(() => {
    const filteredData = subscribers.filter((s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.interest?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(filteredData)
  }, [search, subscribers])

  async function fetchSubscribers() {
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false })
    setSubscribers((data as Subscriber[]) || [])
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Admin: Subscribers</h1>
      <SearchBar search={search} setSearch={setSearch} />
      <SubscriberTable
        subscribers={filtered}
        page={page}
        setPage={setPage}
        perPage={perPage}
      />
      <button
        onClick={() => exportCsv(filtered as any[])}
        className="px-4 py-2 mt-4 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Export CSV
      </button>
    </div>
  )
}

