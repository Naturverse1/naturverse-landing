import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'

export default function ModuleDetail() {
  const router = useRouter()
  const { id } = router.query
  const [module, setModule] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('id', id)
        .single()
      setModule(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!module) return <div>Module not found</div>

  const renderMedia = () => {
    const url = module.media_urls && module.media_urls[0]
    if (!url) return null
    if (module.content_type === 'video') {
      return <video src={url} controls style={{ maxWidth: '100%' }} />
    }
    if (module.content_type === 'audio') {
      return <audio src={url} controls />
    }
    return <img src={url} alt={module.title} style={{ maxWidth: '100%' }} />
  }

  const goBack = () => router.push('/modules')
  const goQuiz = () => {
    if (module.quiz_id) {
      const params = new URLSearchParams({
        title: module.title,
        region: module.region,
      })
      router.push(`/quiz/${module.quiz_id}?${params.toString()}`)
    }
  }

  return (
    <div style={{ padding: '1rem' }}>
      <button onClick={goBack}>Back to Modules</button>
      <h1>{module.title}</h1>
      <p>{module.full_description || module.description}</p>
      {renderMedia()}
      {module.quiz_id && <button onClick={goQuiz}>Take Quiz</button>}
    </div>
  )
}

