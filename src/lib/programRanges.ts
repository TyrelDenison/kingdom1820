/**
 * Pure utility functions for calculating program range values from numeric inputs.
 * Used in the Programs collection beforeChange hook.
 */

export function calculateAnnualPriceRange(price: number): string | null {
  if (price === 0) return null
  if (price <= 240) return '0-240'
  if (price <= 600) return '241-600'
  if (price <= 2400) return '601-2400'
  if (price <= 8400) return '2401-8400'
  return '8401+'
}

export function calculateMonthlyPriceRange(price: number): string | null {
  if (price === 0) return null
  if (price <= 20) return '0-20'
  if (price <= 50) return '21-50'
  if (price <= 200) return '51-200'
  if (price <= 700) return '201-700'
  return '701+'
}

export function calculateMeetingLengthRange(hours: number): string | null {
  if (hours <= 0) return null
  if (hours <= 2) return '1-2'
  if (hours <= 4) return '2-4'
  return '4-8'
}

export function calculateAttendanceRange(count: number): string | null {
  if (count <= 0) return null
  if (count <= 10) return '1-10'
  if (count <= 20) return '10-20'
  if (count <= 50) return '20-50'
  if (count <= 100) return '50-100'
  return '100+'
}
