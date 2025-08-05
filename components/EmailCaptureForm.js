import { useState } from 'react'

export default function EmailCaptureForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(email)
    setSubmitted(true)
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
        input {
          padding: 0.5rem;
          border: 1px solid #ccc;
          border-radius: 4px;
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
