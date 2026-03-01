'use client'

import React, { useState, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ProgramCard, Program } from '@/components/ProgramCard'
import './programs.css'

interface ProgramsClientProps {
  programs: any[]
}

export interface FilterState {
  searchTerm: string
  selectedState: string
  selectedFormat: string
  selectedFrequency: string
  selectedAffiliation: string
  selectedMeetingLength: string
  selectedMeetingType: string
  selectedAttendance: string
  selectedConferences: string
  selectedOutsideSpeakers: string
  selectedEducationTraining: string
  selectedAnnualPriceRange: string
  selectedMonthlyPriceRange: string
}

export function filterPrograms(programs: any[], filters: FilterState): any[] {
  return programs.filter((program) => {
    // Search term filter (name, city, state)
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase()
      const matchesSearch =
        program.name?.toLowerCase().includes(search) ||
        program.city?.toLowerCase().includes(search) ||
        program.state?.toLowerCase().includes(search)

      if (!matchesSearch) return false
    }

    if (filters.selectedState && program.state !== filters.selectedState) return false

    if (filters.selectedFormat && program.meetingFormat !== filters.selectedFormat) return false

    if (filters.selectedFrequency && program.meetingFrequency !== filters.selectedFrequency) return false

    if (filters.selectedAffiliation && program.religiousAffiliation !== filters.selectedAffiliation) return false

    if (filters.selectedMeetingLength && program.meetingLengthRange !== filters.selectedMeetingLength) return false

    if (filters.selectedMeetingType && program.meetingType !== filters.selectedMeetingType) return false

    if (filters.selectedAttendance && program.averageAttendanceRange !== filters.selectedAttendance) return false

    if (filters.selectedConferences && program.hasConferences !== filters.selectedConferences) return false

    if (filters.selectedOutsideSpeakers) {
      const hasOutsideSpeakers = program.hasOutsideSpeakers === true
      const filterValue = filters.selectedOutsideSpeakers === 'true'
      if (hasOutsideSpeakers !== filterValue) return false
    }

    if (filters.selectedEducationTraining) {
      const hasEducationTraining = program.hasEducationTraining === true
      const filterValue = filters.selectedEducationTraining === 'true'
      if (hasEducationTraining !== filterValue) return false
    }

    if (filters.selectedAnnualPriceRange && program.annualPriceRange !== filters.selectedAnnualPriceRange) return false

    if (filters.selectedMonthlyPriceRange && program.monthlyPriceRange !== filters.selectedMonthlyPriceRange) return false

    return true
  })
}

// URL param key mapping
const URL_KEYS = {
  searchTerm: 'search',
  selectedState: 'state',
  selectedFormat: 'format',
  selectedFrequency: 'freq',
  selectedAffiliation: 'affil',
  selectedMeetingLength: 'length',
  selectedMeetingType: 'type',
  selectedAttendance: 'attend',
  selectedConferences: 'conf',
  selectedOutsideSpeakers: 'speakers',
  selectedEducationTraining: 'edu',
  selectedAnnualPriceRange: 'annPrice',
  selectedMonthlyPriceRange: 'monPrice',
} as const

// Help content for each filter
const filterHelpContent: Record<string, { title: string; content: React.ReactNode }> = {
  format: {
    title: 'Meeting Format',
    content: (
      <p>
        While online meetings can be a great experience and convenient, you may
        prefer a group that is mostly online, but has in-person meetings or social
        gatherings at least a few times per year.
      </p>
    ),
  },
  frequency: {
    title: 'Meeting Frequency',
    content: (
      <p>
        Expect weekly meetings to be 60-90 minutes and less frequent meetings to
        be 2 to 6 hours. What can you commit to?
      </p>
    ),
  },
  meetingType: {
    title: 'Type of Meeting',
    content: (
      <>
        <h4>Peer</h4>
        <p>
          Peer groups are typically highly structured, led by a certified coach, and
          attended by 8-12 of the same members on a regular basis, usually monthly.
          Sessions generally last between 3-6 hours and may include speakers,
          curriculum, food, in-depth discussion in a confidential environment. Some
          peer group memberships also include a one-on-one session each month
          with the coach/facilitator in addition to the group meeting.
        </p>

        <h4>Forum</h4>
        <p>
          Forums are typically moderately formal, attended by a variety of business
          owners, executives, and others. Attendees will vary from one gathering to
          the next and may number up to 100 people. Forums meet on a regular basis
          with sessions that last for 1-2 hours and typically include food, speakers,
          small group conversation which may be guided by a curriculum, discussion
          topic or questions to answer. These small groups may include 3-5 people
          and typically DO NOT have a confidentiality requirement.
        </p>

        <h4>Volunteer</h4>
        <p>
          These groups are typically informal and can be led by a local volunteer who
          may use a curriculum or study guide provided by the program sponsor.
          Meetings are 60-90 minutes and are attended by 3-12 people. Typically,
          these groups DO NOT have confidentiality requirements.
        </p>

        <h4>One-on-One Meeting with a Coach or Advisor</h4>
        <p>
          Typically, this feature is only available in peer group programs run by a
          certified coach or advisor. Certified coaches or facilitators are trained
          professionals who have received some level of formal training by the
          sponsoring organization, may also hold other similar certifications and may
          be a full-time consultant in business or theology.
        </p>

        <h4>Study Time Outside of Meetings</h4>
        <p>
          Peer groups are typically more structured and include more in-depth training
          elements than other groups. Members of peer groups are more likely to have
          to commit a few hours per month to study class materials or develop
          projects and presentations prior to group meetings or one-on-one coaching
          sessions. Other types of groups are usually far less formal, have little to no
          outside work requirements and provide a more casual experience.
        </p>
      </>
    ),
  },
  educationTraining: {
    title: 'Education and Training',
    content: (
      <p>
        Peer groups typically provide in-depth education and training on key topics in
        best business practices and biblical principles delivered by professional
        coaches or subject matter expert speakers. Less formal groups provide
        training on various business and faith topics typically from content provided
        by the sponsoring organization. This level of education and training is
        intended for the broader audience served by these programs, is usually
        informative and thought provoking although the content is generally less
        complex and in-depth.
      </p>
    ),
  },
}

// Filter help button component
function FilterHelpButton({ filterKey, openHelp, setOpenHelp }: {
  filterKey: string
  openHelp: string | null
  setOpenHelp: (key: string | null) => void
}) {
  const content = filterHelpContent[filterKey]

  if (!content) return null

  return (
    <button
      type="button"
      className="filter-help-button-inline"
      onClick={() => setOpenHelp(filterKey)}
      aria-label={`Help for ${content.title}`}
    >
      <span className="filter-help-icon-inline">?</span>
    </button>
  )
}

// Filter help modal component
function FilterHelpModal({ filterKey, onClose }: {
  filterKey: string
  onClose: () => void
}) {
  const content = filterHelpContent[filterKey]

  if (!content) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--small" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="modal-title">{content.title}</h2>
        <div className="modal-body">
          {content.content}
        </div>
      </div>
    </div>
  )
}

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openHelp, setOpenHelp] = useState<string | null>(null)

  // Read filter values from URL params
  const searchTerm = searchParams.get(URL_KEYS.searchTerm) ?? ''
  const selectedState = searchParams.get(URL_KEYS.selectedState) ?? ''
  const selectedFormat = searchParams.get(URL_KEYS.selectedFormat) ?? ''
  const selectedFrequency = searchParams.get(URL_KEYS.selectedFrequency) ?? ''
  const selectedAffiliation = searchParams.get(URL_KEYS.selectedAffiliation) ?? ''
  const selectedMeetingLength = searchParams.get(URL_KEYS.selectedMeetingLength) ?? ''
  const selectedMeetingType = searchParams.get(URL_KEYS.selectedMeetingType) ?? ''
  const selectedAttendance = searchParams.get(URL_KEYS.selectedAttendance) ?? ''
  const selectedConferences = searchParams.get(URL_KEYS.selectedConferences) ?? ''
  const selectedOutsideSpeakers = searchParams.get(URL_KEYS.selectedOutsideSpeakers) ?? ''
  const selectedEducationTraining = searchParams.get(URL_KEYS.selectedEducationTraining) ?? ''
  const selectedAnnualPriceRange = searchParams.get(URL_KEYS.selectedAnnualPriceRange) ?? ''
  const selectedMonthlyPriceRange = searchParams.get(URL_KEYS.selectedMonthlyPriceRange) ?? ''

  const updateFilters = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  // Extract unique values for state dropdown
  const states = useMemo(() => {
    const stateSet = new Set(programs.map(p => p.state).filter(Boolean))
    return Array.from(stateSet).sort()
  }, [programs])

  const formats = [
    { label: 'In-person', value: 'in-person' },
    { label: 'Online', value: 'online' },
    { label: 'Both', value: 'both' },
  ]
  const frequencies = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-Monthly', value: 'bi-monthly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
  ]
  const affiliations = [
    { label: 'Protestant', value: 'protestant' },
    { label: 'Catholic', value: 'catholic' },
  ]

  const meetingLengths = [
    { label: '1-2 hours', value: '1-2' },
    { label: '2-4 hours', value: '2-4' },
    { label: '4-8 hours', value: '4-8' },
  ]

  const meetingTypes = [
    { label: 'Peer Group', value: 'peer-group' },
    { label: 'Forum', value: 'forum' },
    { label: 'Small Group', value: 'small-group' },
  ]

  const attendanceSizes = [
    { label: '1-10 people', value: '1-10' },
    { label: '10-20 people', value: '10-20' },
    { label: '20-50 people', value: '20-50' },
    { label: '50-100 people', value: '50-100' },
    { label: '100+ people', value: '100+' },
  ]

  const conferenceOptions = [
    { label: 'None', value: 'none' },
    { label: 'Annual', value: 'annual' },
    { label: 'Multiple', value: 'multiple' },
  ]

  const booleanOptions = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ]

  const annualPriceRanges = [
    { label: '$0-$240', value: '0-240' },
    { label: '$241-$600', value: '241-600' },
    { label: '$601-$2,400', value: '601-2400' },
    { label: '$2,401-$8,400', value: '2401-8400' },
    { label: '$8,401+', value: '8401+' },
  ]

  const monthlyPriceRanges = [
    { label: '$0-$20', value: '0-20' },
    { label: '$21-$50', value: '21-50' },
    { label: '$51-$200', value: '51-200' },
    { label: '$201-$700', value: '201-700' },
    { label: '$701+', value: '701+' },
  ]

  const filters: FilterState = {
    searchTerm,
    selectedState,
    selectedFormat,
    selectedFrequency,
    selectedAffiliation,
    selectedMeetingLength,
    selectedMeetingType,
    selectedAttendance,
    selectedConferences,
    selectedOutsideSpeakers,
    selectedEducationTraining,
    selectedAnnualPriceRange,
    selectedMonthlyPriceRange,
  }

  const filteredPrograms = useMemo(
    () => filterPrograms(programs, filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programs, searchTerm, selectedState, selectedFormat, selectedFrequency, selectedAffiliation, selectedMeetingLength, selectedMeetingType, selectedAttendance, selectedConferences, selectedOutsideSpeakers, selectedEducationTraining, selectedAnnualPriceRange, selectedMonthlyPriceRange],
  )

  const handleClearFilters = () => {
    router.replace(pathname, { scroll: false })
  }

  const activeFiltersCount = [
    selectedState,
    selectedFormat,
    selectedFrequency,
    selectedAffiliation,
    selectedMeetingLength,
    selectedMeetingType,
    selectedAttendance,
    selectedConferences,
    selectedOutsideSpeakers,
    selectedEducationTraining,
    selectedAnnualPriceRange,
    selectedMonthlyPriceRange,
  ].filter(Boolean).length

  return (
    <div className="programs-page">
      <div className="programs-header">
        <div className="container">
          <h1>Find Faith-Based Programs</h1>
          <p className="programs-header__subtitle">
            Explore professional networks and programs aligned with your values
          </p>
        </div>
      </div>

      <div className="container">
        <div className="programs-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar">
            <div className="filters-header">
              <h2 className="filters-title">Filters</h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="filters-clear"
                  type="button"
                >
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Search */}
            <div className="filter-group">
              <label htmlFor="search" className="filter-label">
                Search
              </label>
              <input
                id="search"
                type="text"
                className="filter-input"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => updateFilters({ [URL_KEYS.searchTerm]: e.target.value })}
              />
            </div>

            {/* State Filter */}
            <div className="filter-group">
              <label htmlFor="state" className="filter-label">
                State
              </label>
              <select
                id="state"
                className="filter-select"
                value={selectedState}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedState]: e.target.value })}
              >
                <option value="">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Format Filter */}
            <div className="filter-group">
              <label htmlFor="format" className="filter-label">
                Meeting Format
                <FilterHelpButton filterKey="format" openHelp={openHelp} setOpenHelp={setOpenHelp} />
              </label>
              <select
                id="format"
                className="filter-select"
                value={selectedFormat}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedFormat]: e.target.value })}
              >
                <option value="">All Formats</option>
                {formats.map((format) => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Frequency Filter */}
            <div className="filter-group">
              <label htmlFor="frequency" className="filter-label">
                Meeting Frequency
                <FilterHelpButton filterKey="frequency" openHelp={openHelp} setOpenHelp={setOpenHelp} />
              </label>
              <select
                id="frequency"
                className="filter-select"
                value={selectedFrequency}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedFrequency]: e.target.value })}
              >
                <option value="">All Frequencies</option>
                {frequencies.map((frequency) => (
                  <option key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Religious Affiliation Filter */}
            <div className="filter-group">
              <label htmlFor="affiliation" className="filter-label">
                Religious Affiliation
              </label>
              <select
                id="affiliation"
                className="filter-select"
                value={selectedAffiliation}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedAffiliation]: e.target.value })}
              >
                <option value="">All Affiliations</option>
                {affiliations.map((affiliation) => (
                  <option key={affiliation.value} value={affiliation.value}>
                    {affiliation.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Length Filter */}
            <div className="filter-group">
              <label htmlFor="meetingLength" className="filter-label">
                Meeting Length
              </label>
              <select
                id="meetingLength"
                className="filter-select"
                value={selectedMeetingLength}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedMeetingLength]: e.target.value })}
              >
                <option value="">All Lengths</option>
                {meetingLengths.map((length) => (
                  <option key={length.value} value={length.value}>
                    {length.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Meeting Type Filter */}
            <div className="filter-group">
              <label htmlFor="meetingType" className="filter-label">
                Meeting Type
                <FilterHelpButton filterKey="meetingType" openHelp={openHelp} setOpenHelp={setOpenHelp} />
              </label>
              <select
                id="meetingType"
                className="filter-select"
                value={selectedMeetingType}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedMeetingType]: e.target.value })}
              >
                <option value="">All Types</option>
                {meetingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Average Attendance Filter */}
            <div className="filter-group">
              <label htmlFor="attendance" className="filter-label">
                Average Attendance
              </label>
              <select
                id="attendance"
                className="filter-select"
                value={selectedAttendance}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedAttendance]: e.target.value })}
              >
                <option value="">All Sizes</option>
                {attendanceSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Conferences Filter */}
            <div className="filter-group">
              <label htmlFor="conferences" className="filter-label">
                Conferences
              </label>
              <select
                id="conferences"
                className="filter-select"
                value={selectedConferences}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedConferences]: e.target.value })}
              >
                <option value="">Any</option>
                {conferenceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Outside Speakers Filter */}
            <div className="filter-group">
              <label htmlFor="outsideSpeakers" className="filter-label">
                Outside Speakers
              </label>
              <select
                id="outsideSpeakers"
                className="filter-select"
                value={selectedOutsideSpeakers}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedOutsideSpeakers]: e.target.value })}
              >
                <option value="">Any</option>
                {booleanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Training Filter */}
            <div className="filter-group">
              <label htmlFor="educationTraining" className="filter-label">
                Education & Training
                <FilterHelpButton filterKey="educationTraining" openHelp={openHelp} setOpenHelp={setOpenHelp} />
              </label>
              <select
                id="educationTraining"
                className="filter-select"
                value={selectedEducationTraining}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedEducationTraining]: e.target.value })}
              >
                <option value="">Any</option>
                {booleanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Price Range Filter */}
            <div className="filter-group">
              <label htmlFor="annualPriceRange" className="filter-label">
                Annual Price Range
              </label>
              <select
                id="annualPriceRange"
                className="filter-select"
                value={selectedAnnualPriceRange}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedAnnualPriceRange]: e.target.value })}
              >
                <option value="">Any</option>
                {annualPriceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Price Range Filter */}
            <div className="filter-group">
              <label htmlFor="monthlyPriceRange" className="filter-label">
                Monthly Price Range
              </label>
              <select
                id="monthlyPriceRange"
                className="filter-select"
                value={selectedMonthlyPriceRange}
                onChange={(e) => updateFilters({ [URL_KEYS.selectedMonthlyPriceRange]: e.target.value })}
              >
                <option value="">Any</option>
                {monthlyPriceRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* Programs List */}
          <div className="programs-content">
            <div className="programs-results-header">
              <p className="programs-instructions">
                Please use the selections to the left to narrow down your search using key criteria that
                distinguish these groups from one another. If you aren&apos;t sure how to complete a section,
                just click on the ? icon for a little guidance.
              </p>
              <p className="programs-count">
                {filteredPrograms.length} {filteredPrograms.length === 1 ? 'program' : 'programs'} found
              </p>
            </div>

            {filteredPrograms.length > 0 ? (
              <div className="programs-grid">
                {filteredPrograms.map((program) => (
                  <ProgramCard
                    key={program.id}
                    program={program as Program}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h3>No programs found</h3>
                <p>Try adjusting your filters or search term</p>
                {activeFiltersCount > 0 && (
                  <button onClick={handleClearFilters} className="btn btn-primary">
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Help Modal */}
      {openHelp && (
        <FilterHelpModal filterKey={openHelp} onClose={() => setOpenHelp(null)} />
      )}
    </div>
  )
}
