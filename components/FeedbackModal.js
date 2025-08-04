import { useState } from 'react'
import { submitFeedback } from '../userFeatures.js'

export default function FeedbackModal({ onClose }) {
  const [type, setType] = useState('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitFeedback({ type, message, email })
    setSubmitted(true)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{ background: '#fff', padding: '1rem', maxWidth: 400, width: '90%' }}>
        {submitted ? (
          <>
            <p>Thank you! Your feedback helps us grow.</p>
            <button onClick={onClose}>Close</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>Feedback</h2>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Type:
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="bug">Bug</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="other">Other</option>
                </select>
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Message:
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label>
                Email (optional):
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit">Submit</button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
