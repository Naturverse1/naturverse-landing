export default function LearningWithTurian() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem',
        background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ color: '#ff5722' }}>Learning with Turian</h1>
      <img
        src="/logo.png"
        alt="Turian mascot"
        style={{ width: 200, height: 200, animation: 'bounce 2s infinite' }}
      />
      <p style={{ margin: '1rem 0', fontSize: '1.2rem' }}>
        Explore fun quizzes, earn kingdom stamps, and meet magical fruit and animal friends!
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <a href="/map">
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Start Learning
          </button>
        </a>
        <a href="/avatar">
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
            }}
          >
            Create Your Navatar
          </button>
        </a>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

