import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminRegions() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usedRegions, setUsedRegions] = useState([])
  const [regions, setRegions] = useState([])
  const [newRegion, setNewRegion] = useState({ name: '', color: '', icon_url: '' })

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      await fetchData()
      setLoading(false)
    }
    load()
  }, [router])

  async function fetchData() {
    const [mods, quizzes, stamps, regionTable] = await Promise.all([
      supabase.from('learning_modules').select('region'),
      supabase.from('quizzes').select('region'),
      supabase.from('stamps').select('region'),
      supabase.from('regions').select('*').order('created_at'),
    ])
    const names = new Set()
    ;[mods.data, quizzes.data, stamps.data].forEach((list) => {
      ;(list || []).forEach((r) => r.region && names.add(r.region))
    })
    setUsedRegions([...names])
    setRegions(regionTable.data || [])
  }

  const handleRegionChange = (id, field, value) => {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const saveRegion = async (id) => {
    const region = regions.find((r) => r.id === id)
    const { data, error } = await supabase
      .from('regions')
      .update({ color: region.color, icon_url: region.icon_url })
      .eq('id', id)
      .select()
      .single()
    if (!error) {
      setRegions((prev) => prev.map((r) => (r.id === id ? data : r)))
    }
  }

  const addRegion = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase
      .from('regions')
      .insert(newRegion)
      .select()
      .single()
    if (!error && data) {
      setRegions((prev) => [...prev, data])
      setNewRegion({ name: '', color: '', icon_url: '' })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Regions</h1>
        <section>
          <h2>Used Regions</h2>
          <ul>
            {usedRegions.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2>Manage Regions</h2>
          <form onSubmit={addRegion} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              value={newRegion.name}
              onChange={(e) => setNewRegion({ ...newRegion, name: e.target.value })}
              placeholder="Name"
              required
            />
            <input
              value={newRegion.color}
              onChange={(e) => setNewRegion({ ...newRegion, color: e.target.value })}
              placeholder="Color"
            />
            <input
              value={newRegion.icon_url}
              onChange={(e) => setNewRegion({ ...newRegion, icon_url: e.target.value })}
              placeholder="Icon URL"
            />
            <button type="submit">Add</button>
          </form>
          <div style={{ marginTop: '1rem' }}>
            {regions.map((r) => (
              <div key={r.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{r.name}</strong>
                <input
                  value={r.color || ''}
                  onChange={(e) => handleRegionChange(r.id, 'color', e.target.value)}
                  placeholder="Color"
                  style={{ marginLeft: '0.5rem' }}
                />
                <input
                  value={r.icon_url || ''}
                  onChange={(e) => handleRegionChange(r.id, 'icon_url', e.target.value)}
                  placeholder="Icon URL"
                  style={{ marginLeft: '0.5rem' }}
                />
                <button onClick={() => saveRegion(r.id)} style={{ marginLeft: '0.5rem' }}>
                  Save
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

