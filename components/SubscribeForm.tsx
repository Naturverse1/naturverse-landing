import { useState, useEffect, FormEvent, ChangeEvent } from 'react'

export default function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const interestOptions = ['news', 'events', 'offers']

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
        setError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleInterestChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setInterests((prev) =>
      checked ? [...prev, value] : prev.filter((i) => i !== value)
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, interests }),
      })

      if (!res.ok) throw new Error('Network response was not ok')

      setMessage('Thank you for subscribing!')
      setError(false)
      setEmail('')
      setInterests([])
    } catch (err) {
      console.error(err)
      setError(true)
      setMessage('Oops, something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="subscribe-form">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="interests">
        {interestOptions.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              value={option}
              checked={interests.includes(option)}
              onChange={handleInterestChange}
            />
            {option}
          </label>
        ))}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Subscribe'}
      </button>
      {message && (
        <p style={{ color: error ? 'red' : 'green' }}>{message}</p>
      )}
    </form>
  )
}
