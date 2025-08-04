import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../supabaseClient.js'
import AdminNavbar from '../components/AdminNavbar.js'
import { protectAdmin } from '../lib/protectAdmin.js'

export default function AdminQuizEditor() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [quizzes, setQuizzes] = useState([])
  const [selected, setSelected] = useState(null)
  const [title, setTitle] = useState('')
  const [json, setJson] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const ok = await protectAdmin(router)
      if (!ok) return
      const { data } = await supabase
        .from('quizzes')
        .select('id, title, questions_data')
        .order('created_at', { ascending: true })
      setQuizzes(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  const handleSelect = (quiz) => {
    setSelected(quiz)
    setTitle(quiz.title)
    setJson(JSON.stringify(quiz.questions_data, null, 2))
  }

  const handleNew = () => {
    setSelected(null)
    setTitle('')
    setJson('')
  }

  const handleSave = async () => {
    let parsed
    try {
      parsed = json ? JSON.parse(json) : []
    } catch (e) {
      alert('Invalid JSON')
      return
    }
    setSaving(true)
    if (selected) {
      const { error } = await supabase
        .from('quizzes')
        .update({ title, questions_data: parsed })
        .eq('id', selected.id)
      if (!error) {
        setQuizzes((qs) =>
          qs.map((q) => (q.id === selected.id ? { ...q, title, questions_data: parsed } : q))
        )
      }
    } else {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ title, questions_data: parsed })
        .select()
        .single()
      if (!error) {
        setQuizzes((qs) => [...qs, data])
        setSelected(data)
      }
    }
    setSaving(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ display: 'flex' }}>
      <AdminNavbar />
      <main style={{ flex: 1, padding: '1rem' }}>
        <h1>Quiz Editor</h1>
        <div style={{ display: 'flex' }}>
          <aside style={{ width: '200px', marginRight: '1rem' }}>
            <button onClick={handleNew} style={{ marginBottom: '1rem' }}>
              + New Quiz
            </button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {quizzes.map((q) => (
                <li key={q.id}>
                  <button onClick={() => handleSelect(q)}>{q.title}</button>
                </li>
              ))}
            </ul>
          </aside>
          <section style={{ flex: 1 }}>
            <div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={{ width: '100%', marginBottom: '1rem' }}
              />
            </div>
            <div>
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                rows={20}
                style={{ width: '100%' }}
                placeholder="Questions JSON"
              />
            </div>
            <button
              onClick={handleSave}
              style={{ marginTop: '1rem' }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}
