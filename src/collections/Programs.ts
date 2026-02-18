import { CollectionConfig } from 'payload'
import { importProgramsFromCSV } from '@/lib/programImport'

/**
 * Calculate annual price range based on price value
 */
function calculateAnnualPriceRange(price: number): string | null {
  if (price === 0) return null
  if (price <= 240) return '0-240'
  if (price <= 600) return '241-600'
  if (price <= 2400) return '601-2400'
  if (price <= 8400) return '2401-8400'
  return '8401+'
}

/**
 * Calculate monthly price range based on price value
 */
function calculateMonthlyPriceRange(price: number): string | null {
  if (price === 0) return null
  if (price <= 20) return '0-20'
  if (price <= 50) return '21-50'
  if (price <= 200) return '51-200'
  if (price <= 700) return '201-700'
  return '701+'
}

/**
 * Calculate meeting length range based on hours
 */
function calculateMeetingLengthRange(hours: number): string | null {
  if (hours <= 0) return null
  if (hours <= 2) return '1-2'
  if (hours <= 4) return '2-4'
  return '4-8'
}

/**
 * Calculate average attendance range based on count
 */
function calculateAttendanceRange(count: number): string | null {
  if (count <= 0) return null
  if (count <= 10) return '1-10'
  if (count <= 20) return '10-20'
  if (count <= 50) return '20-50'
  if (count <= 100) return '50-100'
  return '100+'
}

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'religiousAffiliation', 'city', 'state'],
    components: {
      beforeListTable: ['src/components/admin/UploadCSVButton'],
    },
  },
  versions: {
    drafts: true,
  },
  endpoints: [
    {
      path: '/upload-csv',
      method: 'post',
      handler: async (req) => {
        try {
          // Get CSV content from request body
          const formData = await req.formData?.()
          const csvContent = formData?.get('csv')

          if (!csvContent || typeof csvContent !== 'string') {
            return Response.json(
              { error: 'No CSV content provided' },
              { status: 400 }
            )
          }

          // Import programs from CSV
          const result = await importProgramsFromCSV(req.payload, csvContent)

          return Response.json(result)
        } catch (error) {
          console.error('Error uploading CSV:', error)
          return Response.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
          )
        }
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate price ranges from price values
        if (typeof data.annualPrice === 'number') {
          data.annualPriceRange = calculateAnnualPriceRange(data.annualPrice)
        }
        if (typeof data.monthlyPrice === 'number') {
          data.monthlyPriceRange = calculateMonthlyPriceRange(data.monthlyPrice)
        }
        // Auto-calculate meeting length range from hours
        if (typeof data.meetingLength === 'number') {
          data.meetingLengthRange = calculateMeetingLengthRange(data.meetingLength)
        }
        // Auto-calculate attendance range from count
        if (typeof data.averageAttendance === 'number') {
          data.averageAttendanceRange = calculateAttendanceRange(data.averageAttendance)
        }
        return data
      },
    ],
  },
  fields: [
    // Basic Info
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
    },

    // Related Programs
    {
      name: 'relatedPrograms',
      type: 'relationship',
      relationTo: 'programs',
      hasMany: true,
      admin: {
        description: 'Connect programs that are part of the same network or organization',
      },
    },

    // Religious Affiliation
    {
      name: 'religiousAffiliation',
      type: 'select',
      required: true,
      options: [
        { label: 'Protestant', value: 'protestant' },
        { label: 'Catholic', value: 'catholic' },
      ],
      index: true, // Index for faceted search
    },

    // Location
    {
      name: 'address',
      type: 'text',
      required: false,
      admin: {
        description: 'Street address',
      },
    },
    {
      name: 'city',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
      admin: {
        description: 'Two-letter state code (e.g., CA, NY)',
      },
      validate: (val: string) => {
        if (val && !/^[A-Z]{2}$/.test(val)) {
          return 'Please enter a two-letter state code'
        }
        return true
      },
      index: true,
    },
    {
      name: 'zipCode',
      type: 'text',
      validate: (val: string | null | undefined) => {
        if (val && !/^\d{5}(-\d{4})?$/.test(val)) {
          return 'Please enter a valid ZIP code'
        }
        return true
      },
      index: true, // Index for radius search
    },
    {
      name: 'coordinates',
      type: 'group',
      admin: {
        description: 'Geocoded from address - can be auto-populated',
      },
      fields: [
        {
          name: 'lat',
          type: 'number',
          admin: {
            step: 0.000001,
          },
        },
        {
          name: 'lng',
          type: 'number',
          admin: {
            step: 0.000001,
          },
        },
      ],
    },

    // Meeting Details - All indexed for faceted search
    {
      name: 'meetingFormat',
      type: 'select',
      required: true,
      options: [
        { label: 'In-person only', value: 'in-person' },
        { label: 'Online only', value: 'online' },
        { label: 'Both', value: 'both' },
      ],
      index: true,
    },
    {
      name: 'meetingFrequency',
      type: 'select',
      required: true,
      options: [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Bi-Monthly', value: 'bi-monthly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
      ],
      index: true,
    },
    {
      name: 'meetingLength',
      type: 'number',
      admin: {
        description: 'Meeting length in hours (e.g., 1.5, 3, 6)',
        step: 0.5,
      },
      validate: (val: number | null | undefined) => {
        if (val !== null && val !== undefined && val <= 0) {
          return 'Meeting length must be greater than 0'
        }
        return true
      },
    },
    {
      name: 'meetingLengthRange',
      type: 'select',
      options: [
        { label: '1–2 hours', value: '1-2' },
        { label: '2–4 hours', value: '2-4' },
        { label: '4–8 hours', value: '4-8' },
      ],
      index: true,
      admin: {
        description: 'Auto-calculated from meetingLength',
        readOnly: true,
      },
    },
    {
      name: 'meetingType',
      type: 'select',
      required: true,
      options: [
        { label: 'Peer group', value: 'peer-group' },
        { label: 'Forum w/ speakers, Q&A', value: 'forum' },
        { label: 'Small group discussion', value: 'small-group' },
      ],
      index: true,
    },
    {
      name: 'averageAttendance',
      type: 'number',
      admin: {
        description: 'Average number of attendees (e.g., 8, 15, 35)',
      },
      validate: (val: number | null | undefined) => {
        if (val !== null && val !== undefined && val <= 0) {
          return 'Average attendance must be greater than 0'
        }
        return true
      },
    },
    {
      name: 'averageAttendanceRange',
      type: 'select',
      options: [
        { label: '1–10', value: '1-10' },
        { label: '10–20', value: '10-20' },
        { label: '20–50', value: '20-50' },
        { label: '50–100', value: '50-100' },
        { label: '100+', value: '100+' },
      ],
      index: true,
      admin: {
        description: 'Auto-calculated from averageAttendance',
        readOnly: true,
      },
    },

    // Additional Features
    {
      name: 'hasConferences',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Annual', value: 'annual' },
        { label: 'Multiple', value: 'multiple' },
      ],
      defaultValue: 'none',
      index: true,
    },
    {
      name: 'hasOutsideSpeakers',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },
    {
      name: 'hasEducationTraining',
      type: 'checkbox',
      defaultValue: false,
      index: true,
    },

    // Pricing
    {
      name: 'annualPrice',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Annual membership fee in USD (use 0 if not offered or free)',
      },
      validate: (val: number) => {
        if (val < 0) {
          return 'Price cannot be negative'
        }
        return true
      },
    },
    {
      name: 'monthlyPrice',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Monthly membership fee in USD (use 0 if not offered or free)',
      },
      validate: (val: number) => {
        if (val < 0) {
          return 'Price cannot be negative'
        }
        return true
      },
    },
    {
      name: 'annualPriceRange',
      type: 'select',
      options: [
        { label: '$0-$240', value: '0-240' },
        { label: '$241-$600', value: '241-600' },
        { label: '$601-$2,400', value: '601-2400' },
        { label: '$2,401-$8,400', value: '2401-8400' },
        { label: '$8,401+', value: '8401+' },
      ],
      index: true,
      admin: {
        description: 'Auto-calculated from annualPrice',
        readOnly: true,
      },
    },
    {
      name: 'monthlyPriceRange',
      type: 'select',
      options: [
        { label: '$0-$20', value: '0-20' },
        { label: '$21-$50', value: '21-50' },
        { label: '$51-$200', value: '51-200' },
        { label: '$201-$700', value: '201-700' },
        { label: '$701+', value: '701+' },
      ],
      index: true,
      admin: {
        description: 'Auto-calculated from monthlyPrice',
        readOnly: true,
      },
    },

    // Contact & Links
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      type: 'text',
      admin: {
        description: 'URL where this program data was scraped from',
        readOnly: true,
      },
    },
  ],
}
