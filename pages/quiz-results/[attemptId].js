import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient.js'

export default function QuizResultsPage() {
  const router = useRouter()
  const { attemptId } = router.query
  const [attempt, setAttempt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    if (!attemptId) return
    async function load() {
      const { data } = await supabase
        .from('user_quiz_attempts')
        .select('*, quizzes ( title )')
        .eq('id', attemptId)
        .single()
      setAttempt(data)
      setLoading(false)
    }
    load()
  }, [attemptId])

  if (loading) return <div>Loading...</div>
  if (!attempt) return <div>Attempt not found</div>

  const responses = attempt.responses || []
  const percentage = responses.length
    ? Math.round((attempt.score / responses.length) * 100)
    : 0

  const handleRetry = async () => {
    setRetrying(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_quiz_attempts').insert({
        user_id: user.id,
        quiz_id: attempt.quiz_id,
        responses: [],
        score: 0,
      })
    }
    router.push(`/quiz/${attempt.quiz_id}`)
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>{attempt.quizzes?.title || 'Quiz Results'}</h1>
      <p>Score: {attempt.score}</p>
      <p>{percentage >= 70 ? 'Great job!' : 'Try again!'}</p>
      <ul>
        {responses.map((r, idx) => (
          <li key={idx} style={{ marginBottom: '1rem' }}>
            <div>Question: {r.question}</div>
            <div>Your answer: {r.answer}</div>
            <div>Correct answer: {r.correct_answer}</div>
            <div>{r.correct ? 'Correct' : 'Incorrect'}</div>
          </li>
        ))}
      </ul>
      <button onClick={handleRetry} disabled={retrying}>
        {retrying ? 'Starting...' : 'Try Again'}
      </button>
    </div>
  )
}

