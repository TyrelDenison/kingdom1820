'use client'

import React, { useState } from 'react'

interface LastRunData {
  timestamp: string
  total: number
  created: number
  updated: number
  failed: number
  errors?: Array<{ name?: string; error: string }>
}

export const LastRunDisplay: React.FC<{
  value?: LastRunData | null
}> = ({ value: lastRun }) => {
  const [showErrors, setShowErrors] = useState(false)

  if (!lastRun) {
    return <div style={{ color: '#6b7280' }}>Never run</div>
  }

  const date = new Date(lastRun.timestamp)
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div style={{ fontSize: '14px' }}>
      <div style={{ marginBottom: '8px', color: '#6b7280' }}>
        Last run: {formattedDate}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>Total: <strong>{lastRun.total}</strong></div>
        <div>Created: <strong style={{ color: '#10b981' }}>{lastRun.created}</strong></div>
        <div>Updated: <strong style={{ color: '#3b82f6' }}>{lastRun.updated}</strong></div>
        <div>Failed: <strong style={{ color: '#ef4444' }}>{lastRun.failed}</strong></div>
      </div>

      {lastRun.errors && lastRun.errors.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setShowErrors(!showErrors)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {showErrors ? 'Hide' : 'Show'} {lastRun.errors.length} error(s)
          </button>
          {showErrors && (
            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '12px' }}>
              {lastRun.errors.map((err, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>
                  {err.name && <strong>{err.name}: </strong>}
                  {err.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
