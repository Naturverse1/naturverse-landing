import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'
import { createLearningModule } from '../userFeatures.js'

export default function AdminModuleUploader() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [regions, setRegions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    region: '',
    content_type: '',
    age_group: '',
    quiz_id: '',
    files: [],
  })

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const [reg, quiz] = await Promise.all([
        supabase.from('regions').select('id, name'),
        supabase.from('quizzes').select('id, title'),
      ])
      setRegions(reg.data || [])
      setQuizzes(quiz.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const uploads = []
    for (const file of form.files) {
      const filePath = `${Date.now()}_${file.name}`
      const { error: upError } = await supabase.storage.from('modules').upload(filePath, file)
      if (!upError) {
        const { data } = supabase.storage.from('modules').getPublicUrl(filePath)
        uploads.push(data.publicUrl)
      }
    }
    const module = {
      title: form.title,
      description: form.description,
      region: form.region,
      content_type: form.content_type,
      age_group: form.age_group,
      media_urls: uploads,
      quiz_id: form.quiz_id || null,
    }
    const { error } = await createLearningModule(module)
    if (!error) {
      alert('Module uploaded')
      setForm({
        title: '',
        description: '',
        region: '',
        content_type: '',
        age_group: '',
        quiz_id: '',
        files: [],
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Upload Learning Module</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            required
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            required
          />
          <select
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            required
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            value={form.content_type}
            onChange={(e) => setForm({ ...form, content_type: e.target.value })}
            required
          >
            <option value="">Content Type</option>
            <option value="storybook">Storybook</option>
            <option value="video">Video</option>
            <option value="game">Game</option>
            <option value="other">Other</option>
          </select>
          <input
            value={form.age_group}
            onChange={(e) => setForm({ ...form, age_group: e.target.value })}
            placeholder="Age group"
          />
          <select
            value={form.quiz_id}
            onChange={(e) => setForm({ ...form, quiz_id: e.target.value })}
          >
            <option value="">Related Quiz (optional)</option>
            {quizzes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
          </select>
          <input
            type="file"
            multiple
            onChange={(e) => setForm({ ...form, files: e.target.files })}
          />
          <button type="submit">Upload</button>
        </form>
      </main>
    </div>
  )
}

