'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useDocumentInfo } from '@payloadcms/ui'

export const RunAgentPromptButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState<string>('')
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cancel any in-flight execute request when the component unmounts (page navigation/refresh)
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // Fetch current document status
  useEffect(() => {
    const fetchStatus = async () => {
      if (id) {
        const response = await fetch(`/api/agent-prompts/${id}`)
        const data = await response.json() as { status: string }
        setStatus(data.status)
      }
    }
    fetchStatus()
  }, [id])

  const handleRun = async () => {
    if (status !== 'active') {
      alert('Only active prompts can be executed')
      return
    }

    abortControllerRef.current = new AbortController()
    setIsRunning(true)
    try {
      const response = await fetch(`/api/agent-prompts/${id}/execute`, {
        method: 'POST',
        signal: abortControllerRef.current.signal,
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

      router.refresh()
    } catch (error) {
      // Silently ignore aborts — user navigated away intentionally
      if (error instanceof Error && error.name === 'AbortError') return
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  // Don't render button when creating a new document (id is null)
  if (!id) {
    return null
  }

  return (
    <Button
      buttonStyle="primary"
      onClick={handleRun}
      disabled={isRunning || status !== 'active'}
    >
      {isRunning ? 'Running...' : 'Run Agent Prompt'}
    </Button>
  )
}

export default RunAgentPromptButton
