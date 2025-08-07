import './App.css'

function App() {
  const handleClick = () => alert('Coming Soon!')

  return (
    <div className="app">
      <h1>🌍 Welcome to The Naturverse™</h1>
      <h2>A Magical World of Learning</h2>
      <img src="/logo.png" alt="Naturverse logo" className="logo" />
      <p>🚀 Explore our kingdoms, create your Navatar, and start your journey.</p>
      <button className="cta" onClick={handleClick}>
        Enter The Naturverse
      </button>
    </div>
  )
}

export default App
