import { useState, useEffect, FormEvent } from 'react'

export default function SubscribeForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (status !== 'idle') {
      const timer = setTimeout(() => setStatus('idle'), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (!res.ok) {
        throw new Error('Network response was not ok')
      }

      setStatus('success')
      setName('')
      setEmail('')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="subscribe-form">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Subscribe</button>
      {status === 'success' && <p className="success">Thank you for subscribing!</p>}
      {status === 'error' && <p className="error">Failed to subscribe. Please try again.</p>}
    </form>
  )
}

