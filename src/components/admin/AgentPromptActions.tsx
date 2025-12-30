'use client'

import { Button } from '@payloadcms/ui'
import { useState } from 'react'

export const AgentPromptActions: React.FC<{
  rowData: any
}> = ({ rowData }) => {
  const [isRunning, setIsRunning] = useState(false)
  const isActive = rowData.status === 'active'

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const response = await fetch(`/api/agent-prompts/${rowData.id}/execute`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json() as { message?: string }
        throw new Error(error.message || 'Execution failed')
      }

      const result = await response.json() as {
        total: number
        created: number
        updated: number
        failed: number
      }

      alert(
        `Agent run complete!\n` +
        `Total: ${result.total}\n` +
        `Created: ${result.created}\n` +
        `Updated: ${result.updated}\n` +
        `Failed: ${result.failed}`
      )

      window.location.reload()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button
        buttonStyle="secondary"
        size="small"
        disabled={!isActive || isRunning}
        onClick={handleRun}
      >
        {isRunning ? 'Running...' : 'Run'}
      </Button>
    </div>
  )
}

export default AgentPromptActions
