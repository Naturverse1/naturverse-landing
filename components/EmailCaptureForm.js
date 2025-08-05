import { useState } from 'react'

export default function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [options, setOptions] = useState({
    newsletter: false,
    updates: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleOptionChange = (e) => {
    const { name, checked } = e.target
    setOptions((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const selectedOptions = Object.keys(options).filter((key) => options[key])
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, options: selectedOptions }),
      })
      if (!res.ok) throw new Error('Network response was not ok')
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="thank-you">
        Thank you for signing up!
        <style jsx>{`
          .thank-you {
            text-align: center;
            margin: 1rem;
            font-size: 1.2rem;
          }
        `}</style>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="email-form">
      <h2>Join The Naturverse</h2>
      <label>
        Email Address
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="newsletter"
          checked={options.newsletter}
          onChange={handleOptionChange}
        />
        Newsletter
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="updates"
          checked={options.updates}
          onChange={handleOptionChange}
        />
        Product Updates
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign Up</button>
      <style jsx>{`
        .email-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 400px;
          margin: 1rem auto;
        }
        label {
          display: flex;
          flex-direction: column;
          font-weight: 500;
        }
        .checkbox {
          flex-direction: row;
          align-items: center;
        }
        input[type='email'] {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .error {
          color: red;
          font-size: 0.9rem;
        }
        button {
          padding: 0.5rem 1rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
      `}</style>
    </form>
  )
}
