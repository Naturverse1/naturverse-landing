export default function Custom404() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>404</h1>
      <img
        src="/logo.png"
        alt="Turian looking lost"
        style={{ width: 200, height: 200, opacity: 0.7 }}
      />
      <p>Oops! This page got squashed like a fruit.</p>
      <a href="/">
        <button style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>Back to Home</button>
      </a>
    </div>
  )
}

