import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'

export default function ModulesPage() {
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState([])
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('learning_modules').select('*')
      setModules(data || [])
      const unique = [
        ...new Set((data || []).map((m) => m.region).filter(Boolean)),
      ]
      setRegions(unique)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div>Loading...</div>

  const filtered = selectedRegion
    ? modules.filter((m) => m.region === selectedRegion)
    : modules
  const grouped = filtered.reduce((acc, m) => {
    if (!acc[m.region]) acc[m.region] = []
    acc[m.region].push(m)
    return acc
  }, {})

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="regionFilter">Filter by region: </label>
        <select
          id="regionFilter"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
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
