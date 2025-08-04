import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'

export default function ModulesPage() {
  const [loading, setLoading] = useState(true)
  const [grouped, setGrouped] = useState({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const region = params.get('region')

    async function load() {
      let query = supabase.from('learning_modules').select('*')
      if (region) query = query.eq('region', region)
      const { data } = await query
      const groups = {}
      ;(data || []).forEach((m) => {
        if (!groups[m.region]) groups[m.region] = []
        groups[m.region].push(m)
      })
      setGrouped(groups)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ padding: '1rem' }}>
      {Object.entries(grouped).map(([region, mods]) => (
        <section key={region} style={{ marginBottom: '2rem' }}>
          <h2>{region}</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {mods.map((m) => (
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
                <p>{m.description}</p>
                <a href={`/modules/${m.id}`}>View Module</a>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

