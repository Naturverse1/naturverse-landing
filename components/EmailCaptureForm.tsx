import { useState, useEffect, FormEvent } from 'react'

export default function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState({ type: '', message: '' })

  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => setStatus({ type: '', message: '' }), 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      if (!res.ok) throw new Error('Network response was not ok')
      setStatus({ type: 'success', message: 'Subscription successful!' })
      setEmail('')
      setName('')
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Failed to subscribe. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="email-capture-form">
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
      {status.message && <p className={status.type}>{status.message}</p>}
    </form>
  )
}

