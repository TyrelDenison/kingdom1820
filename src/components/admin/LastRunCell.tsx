import React from 'react'

interface LastRunData {
  timestamp: string
  total: number
  created: number
  updated: number
  failed: number
}

export const LastRunCell: React.FC<{ cellData: any }> = ({ cellData }) => {
  if (!cellData) {
    return <span style={{ color: '#6b7280' }}>Never run</span>
  }

  const lastRun = cellData as LastRunData

  const date = new Date(lastRun.timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let timeAgo = ''
  if (diffMins < 60) {
    timeAgo = `${diffMins}m ago`
  } else if (diffHours < 24) {
    timeAgo = `${diffHours}h ago`
  } else {
    timeAgo = `${diffDays}d ago`
  }

  return (
    <div style={{ fontSize: '13px' }}>
      <div style={{ color: '#6b7280', marginBottom: '2px' }}>{timeAgo}</div>
      <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
        <span title="Created">+{lastRun.created}</span>
        <span title="Updated">~{lastRun.updated}</span>
        {lastRun.failed > 0 && (
          <span style={{ color: '#ef4444' }} title="Failed">
            ✗{lastRun.failed}
          </span>
        )}
      </div>
    </div>
  )
}
