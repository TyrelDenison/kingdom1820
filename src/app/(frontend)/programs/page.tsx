import { getPayload } from 'payload'
import React, { Suspense } from 'react'

import config from '@/payload.config'
import { ProgramsClient } from './ProgramsClient'

export default async function ProgramsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch all published programs (no limit)
  const { docs: programs } = await payload.find({
    collection: 'programs',
    pagination: false,
    sort: 'name',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProgramsClient programs={programs} />
    </Suspense>
  )
}
