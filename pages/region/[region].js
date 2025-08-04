import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'
import ProgressBar from '../../components/ProgressBar.js'

export default function RegionPage() {
  const router = useRouter()
  const { region } = router.query
  const [modules, setModules] = useState([])
  const [stamps, setStamps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!region) return
    async function load() {
      const { data: modData } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('region', region)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let stampData = []
      if (user) {
        const { data } = await supabase
          .from('stamps')
          .select('*')
          .eq('user_id', user.id)
          .eq('region', region)
        stampData = data || []
      }
      setModules(modData || [])
      setStamps(stampData)
      setLoading(false)
    }
    load()
  }, [region])

  if (loading) return <div>Loading...</div>

  const completed = stamps.length
  const total = modules.length

  return (
    <div style={{ padding: '1rem' }}>
      <a href="/map">Back to Map</a>
      <h1>{region}</h1>
      <ProgressBar totalModules={total} completedModules={completed} />
      <section style={{ marginTop: '1rem' }}>
        <h2>Modules</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {modules.map((m) => (
            <div
              key={m.id}
              style={{ border: '1px solid #ccc', padding: '0.5rem', width: '200px' }}
            >
              {m.media_urls && m.media_urls[0] && (
                <img
                  src={m.media_urls[0]}
                  alt={m.title}
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
              <h3>{m.title}</h3>
            </div>
          ))}
        </div>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>Stamps Earned</h2>
        {stamps.length === 0 && <div>No stamps yet</div>}
        <ul>
          {stamps.map((s) => (
            <li key={s.id}>{s.stamp_name}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

