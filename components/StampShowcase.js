import { useEffect, useState } from 'react'

export default function StampShowcase({ stamp, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (stamp) setVisible(true)
  }, [stamp])

  if (!stamp || !visible) return null

  const handleClose = () => {
    setVisible(false)
    if (onClose) onClose()
  }

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          animation: 'pop 0.3s ease',
        }}
      >
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <h2>New Stamp Earned!</h2>
        <p>{stamp.name}</p>
        <p>{stamp.region}</p>
        <p>{new Date(stamp.created_at).toLocaleDateString()}</p>
      </div>
      <style jsx>{`
        @keyframes pop {
          from {
            transform: scale(0.5);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

