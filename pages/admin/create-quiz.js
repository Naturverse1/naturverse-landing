import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../supabaseClient.js'
import { protectAdmin } from '../../lib/protectAdmin.js'

export default function CreateQuiz() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [regions, setRegions] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [region, setRegion] = useState('')
  const [questions, setQuestions] = useState('')

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const [catRes, regRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
        supabase.from('regions').select('id, name'),
      ])
      setCategories(catRes.data || [])
      setRegions(regRes.data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    let parsed
    try {
      parsed = questions ? JSON.parse(questions) : []
    } catch (e) {
      alert('Invalid questions JSON')
      return
    }
    const { error } = await supabase.from('quizzes').insert({
      title,
      description,
      category,
      region,
      questions_data: parsed,
    })
    if (!error) {
      router.push('/admin/dashboard')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Create Quiz</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} required>
          <option value="">Region</option>
          {regions.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <textarea
          value={questions}
          onChange={(e) => setQuestions(e.target.value)}
          placeholder="Questions JSON"
          rows={10}
          required
        />
        <button type="submit">Create Quiz</button>
      </form>
    </main>
  )
}

