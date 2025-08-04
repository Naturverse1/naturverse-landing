import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'

export default function MyStampsPage() {
  const [loading, setLoading] = useState(true)
  const [grouped, setGrouped] = useState({})

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      const { data } = await supabase
        .from('stamps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      const groups = {}
      ;(data || []).forEach((s) => {
        if (!groups[s.region]) groups[s.region] = []
        groups[s.region].push(s)
      })
      setGrouped(groups)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div>Loading...</div>
  if (Object.keys(grouped).length === 0) return <div>You have no stamps yet</div>

  return (
    <div style={{ padding: '1rem' }}>
      {Object.entries(grouped).map(([region, stamps]) => (
        <section key={region} style={{ marginBottom: '2rem' }}>
          <h2>{region}</h2>
          <ul>
            {stamps.map((s) => (
              <li key={s.id}>
                {s.stamp_name} - {new Date(s.created_at).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

