import { CollectionConfig } from 'payload'

export const Programs: CollectionConfig = {
  slug: 'programs',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'religiousAffiliation', 'city', 'state'],
  },
  versions: {
    drafts: true,
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
      required: true,
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
      validate: (val) => {
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
      required: true,
      validate: (val) => {
        if (!/^\d{5}(-\d{4})?$/.test(val)) {
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
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
      ],
      index: true,
    },
    {
      name: 'meetingLength',
      type: 'select',
      required: true,
      options: [
        { label: '1–2 hours', value: '1-2' },
        { label: '2–4 hours', value: '2-4' },
        { label: '4–8 hours', value: '4-8' },
      ],
      index: true,
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
      type: 'select',
      required: true,
      options: [
        { label: '1–10', value: '1-10' },
        { label: '10–20', value: '10-20' },
        { label: '20–50', value: '20-50' },
        { label: '50–100', value: '50-100' },
        { label: '100+', value: '100+' },
      ],
      index: true,
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
  ],
}
