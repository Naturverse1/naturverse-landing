import React, { useState } from 'react'
import FeedbackModal from './FeedbackModal.js'
import { APP_VERSION } from '../version.js'

export default function Footer() {
  const [open, setOpen] = useState(false)
  return (
    <footer
      style={{
        marginTop: '2rem',
        padding: '1rem',
        textAlign: 'center',
        background: '#f8f8f8',
      }}
    >
      <div
        style={{
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <a href="/about">About Naturverse</a>
        <a href="/contact">Contact</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <a style={{ cursor: 'pointer' }} onClick={() => setOpen(true)}>
          Feedback
        </a>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <img src="/logo.png" alt="Turian logo" style={{ height: '24px' }} />
        <span style={{ fontSize: '0.875rem' }}>
          Powered by Turian Media Company
        </span>
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
        Naturverse MVP v{APP_VERSION}
      </div>
      {open && <FeedbackModal onClose={() => setOpen(false)} />}
    </footer>
  )
}

