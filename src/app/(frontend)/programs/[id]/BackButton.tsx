'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  return (
    <button onClick={() => router.back()} className="btn btn-secondary btn-full">
      Back to Programs
    </button>
  )
}
