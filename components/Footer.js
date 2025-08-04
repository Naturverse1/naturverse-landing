import React from 'react'

export default function Footer() {
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
    </footer>
  )
}

