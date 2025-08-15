import React from 'react' // eslint-disable-line no-unused-vars
import './App.css'

function App() {
  return (
    <React.Fragment>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
          textAlign: 'center',
          fontFamily: "'Poppins', sans-serif",
          padding: '20px',
        }}
      >
        <img
          src="/logo.png"
          alt="Naturverse Logo"
          style={{ width: '150px', marginBottom: '20px' }}
        />
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
          Welcome to the Naturverse
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          A Magical World of Learning
        </p>
        <a
          href="/login"
          style={{
            background: '#4CAF50',
            color: '#fff',
            padding: '15px 25px',
            margin: '10px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Sign In
        </a>
        <a
          href="/app"
          style={{
            background: '#2196F3',
            color: '#fff',
            padding: '15px 25px',
            margin: '10px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Explore
        </a>
      </div>
    </React.Fragment>
  )
}

export default App
