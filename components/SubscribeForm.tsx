import { useState, useEffect, FormEvent } from 'react'
// Simple subscription form component

export default function SubscribeForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(''), 5000)
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

      if (!res.ok) throw new Error('Network response was not ok')
      setStatus('Thanks for subscribing!')
      setName('')
      setEmail('')
    } catch (err) {
      console.error(err)
      setStatus('Subscription failed. Please try again.')
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
      {status && <p>{status}</p>}
    </form>
  )
}

