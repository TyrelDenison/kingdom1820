/**
 * Test script to verify Firecrawl API integration
 * Run with: tsx test-firecrawl.ts <url>
 */

import { getFirecrawlService } from './src/lib/firecrawl'
import 'dotenv/config'

async function testFirecrawl() {
  const url = process.argv[2]

  if (!url) {
    console.error('Usage: tsx test-firecrawl.ts <url>')
    console.error('Example: tsx test-firecrawl.ts https://example.com/program')
    process.exit(1)
  }

  console.log('Testing Firecrawl API...')
  console.log(`URL: ${url}\n`)

  try {
    const firecrawl = getFirecrawlService()
    console.log('✓ Firecrawl service initialized\n')

    console.log('Extracting program data...')
    const programData = await firecrawl.extractProgram(url)

    console.log('\n✓ Success! Extracted data:\n')
    console.log(JSON.stringify(programData, null, 2))

    if (programData) {
      // Summary
      console.log('\n--- Summary ---')
      console.log(`Name: ${programData.name || 'Not found'}`)
      console.log(`Location: ${programData.city || '?'}, ${programData.state || '?'}`)
      console.log(`Meeting Format: ${programData.meetingFormat || 'Not found'}`)
      console.log(`Religious Affiliation: ${programData.religiousAffiliation || 'Not found'}`)
    } else {
      console.log('\n⚠ No data extracted (programData is undefined)')
    }
  } catch (error) {
    console.error('\n✗ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

testFirecrawl()
