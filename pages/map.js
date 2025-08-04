import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import ProgressBar from '../components/ProgressBar.js'

const regions = ['Thailandia', 'Chinadia', 'Bharatia', 'Australis', 'Americana']

export default function MapPage() {
  const [progress, setProgress] = useState({ total: 0, completed: 0 })

  useEffect(() => {
    async function load() {
      const { data: modules } = await supabase.from('learning_modules').select('id')
      const {
        data: { user },
      } = await supabase.auth.getUser()
      let stamps = []
      if (user) {
        const { data } = await supabase
          .from('stamps')
          .select('id')
          .eq('user_id', user.id)
        stamps = data || []
      }
      setProgress({ total: modules?.length || 0, completed: stamps.length })
    }
    load()
  }, [])

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Kingdom Map</h1>
      <ProgressBar
        totalModules={progress.total}
        completedModules={progress.completed}
      />
      <img
        src="/logo.png"
        alt="Naturverse map"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <div
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        {regions.map((r) => (
          <a key={r} href={`/modules?region=${encodeURIComponent(r)}`}>
            <button>{r}</button>
          </a>
        ))}
      </div>
    </div>
  )
}

