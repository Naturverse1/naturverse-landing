import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../supabaseClient.js'
import { protectAdmin } from '../../lib/protectAdmin.js'
import { createLearningModule } from '../../userFeatures.js'

export default function CreateModule() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [regions, setRegions] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    region: '',
    age_group: '',
    quiz_id: '',
    media_urls: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const [regRes, quizRes] = await Promise.all([
        supabase.from('regions').select('id, name'),
        supabase.from('quizzes').select('id, title'),
      ])
      setRegions(regRes.data || [])
      setQuizzes(quizRes.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    let urls
    try {
      urls = form.media_urls ? JSON.parse(form.media_urls) : []
    } catch (e) {
      alert('Invalid media URLs JSON')
      setSubmitting(false)
      return
    }
    const module = {
      title: form.title,
      description: form.description,
      content_type: form.type,
      region: form.region,
      age_group: form.age_group,
      quiz_id: form.quiz_id || null,
      media_urls: urls,
    }
    const { error } = await createLearningModule(module)
    if (!error) {
      router.push('/admin/dashboard')
    }
    setSubmitting(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Create Learning Module</h1>
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
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          required
        >
          <option value="">Type</option>
          <option value="storybook">Storybook</option>
          <option value="video">Video</option>
          <option value="game">Game</option>
          <option value="other">Other</option>
        </select>
        <select
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          required
        >
          <option value="">Region</option>
          {regions.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
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
          <option value="">Optional Quiz</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
        <textarea
          value={form.media_urls}
          onChange={(e) => setForm({ ...form, media_urls: e.target.value })}
          placeholder='Media URLs JSON (e.g. ["url1"])'
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Create Module'}
        </button>
      </form>
    </main>
  )
}

