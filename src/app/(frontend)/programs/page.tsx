import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ProgramsClient } from './ProgramsClient'

export default async function ProgramsPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch all published programs
  const { docs: programs } = await payload.find({
    collection: 'programs',
    limit: 100,
    sort: 'name',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return <ProgramsClient programs={programs} />
}
