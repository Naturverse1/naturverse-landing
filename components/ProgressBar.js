import React from 'react'

export default function ProgressBar({ totalModules = 0, completedModules = 0 }) {
  const percentage = totalModules ? Math.min(100, (completedModules / totalModules) * 100) : 0
  const fruitCount = Math.min(completedModules, 10)
  return (
    <div style={{ margin: '1rem 0' }}>
      <div style={{ marginBottom: '0.25rem' }}>
        {completedModules} of {totalModules} completed
      </div>
      <div
        style={{
          background: '#eee',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '20px',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            background: '#8BC34A',
            height: '100%',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ marginTop: '0.25rem', fontSize: '1.25rem' }}>
        {Array.from({ length: fruitCount }).map((_, i) => (
          <span key={i}>🍓</span>
        ))}
      </div>
    </div>
  )
}

