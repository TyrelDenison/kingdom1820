'use client'

import React, { useState } from 'react'
import { useFormFields } from '@payloadcms/ui'

interface LastRunData {
  timestamp: string
  total: number
  created: number
  updated: number
  failed: number
  errors?: Array<{ name?: string; error: string }>
  skippedPrograms?: Array<any & { skipReason: string }>
}

export const LastRunDisplay: React.FC = () => {
  const [showErrors, setShowErrors] = useState(false)
  const [showSkipped, setShowSkipped] = useState(false)

  // Use Payload's hook to access form field data
  const lastRunField = useFormFields(([fields]) => fields.lastRun)
  const lastRun = lastRunField?.value as LastRunData | null

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

      {lastRun.skippedPrograms && lastRun.skippedPrograms.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={() => setShowSkipped(!showSkipped)}
            style={{
              background: 'none',
              border: 'none',
              color: '#f59e0b',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {showSkipped ? 'Hide' : 'Show'} {lastRun.skippedPrograms.length} skipped program(s)
          </button>
          {showSkipped && (
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              {lastRun.skippedPrograms.map((program, idx) => (
                <div key={idx} style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{program.name || 'Unnamed Program'}</div>
                  <div style={{ color: '#f59e0b', marginBottom: '4px' }}>Reason: {program.skipReason}</div>
                  <details>
                    <summary style={{ cursor: 'pointer', color: '#6b7280' }}>View program data</summary>
                    <pre style={{ marginTop: '8px', fontSize: '11px', overflow: 'auto', backgroundColor: '#f9fafb', padding: '8px', borderRadius: '4px' }}>
                      {JSON.stringify(program, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LastRunDisplay
