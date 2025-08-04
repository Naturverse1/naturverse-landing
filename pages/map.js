const regions = ['Thailandia', 'Chinadia', 'Bharatia', 'Australis', 'Americana']

export default function MapPage() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Kingdom Map</h1>
      <img src="/logo.png" alt="Naturverse map" style={{ maxWidth: '100%', height: 'auto' }} />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {regions.map((r) => (
          <a key={r} href={`/modules?region=${encodeURIComponent(r)}`}>
            <button>{r}</button>
          </a>
        ))}
      </div>
    </div>
  )
}

