'use client'

import React, { useState, useMemo } from 'react'
import { ProgramCard, Program } from '@/components/ProgramCard'
import './programs.css'

interface ProgramsClientProps {
  programs: any[]
}

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedState, setSelectedState] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [selectedFrequency, setSelectedFrequency] = useState('')
  const [selectedAffiliation, setSelectedAffiliation] = useState('')
  const [selectedMeetingLength, setSelectedMeetingLength] = useState('')
  const [selectedMeetingType, setSelectedMeetingType] = useState('')
  const [selectedAttendance, setSelectedAttendance] = useState('')
  const [selectedConferences, setSelectedConferences] = useState('')
  const [selectedOutsideSpeakers, setSelectedOutsideSpeakers] = useState('')
  const [selectedEducationTraining, setSelectedEducationTraining] = useState('')
  const [selectedAnnualPriceRange, setSelectedAnnualPriceRange] = useState('')
  const [selectedMonthlyPriceRange, setSelectedMonthlyPriceRange] = useState('')

  // Extract unique values for filters
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

  // Filter programs based on search and filters
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      // Search term filter (name, city, description)
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch =
          program.name?.toLowerCase().includes(search) ||
          program.city?.toLowerCase().includes(search) ||
          program.state?.toLowerCase().includes(search)

        if (!matchesSearch) return false
      }

      // State filter
      if (selectedState && program.state !== selectedState) {
        return false
      }

      // Format filter
      if (selectedFormat && program.meetingFormat !== selectedFormat) {
        return false
      }

      // Frequency filter
      if (selectedFrequency && program.meetingFrequency !== selectedFrequency) {
        return false
      }

      // Religious affiliation filter
      if (selectedAffiliation && program.religiousAffiliation !== selectedAffiliation) {
        return false
      }

      // Meeting length filter
      if (selectedMeetingLength && program.meetingLength !== selectedMeetingLength) {
        return false
      }

      // Meeting type filter
      if (selectedMeetingType && program.meetingType !== selectedMeetingType) {
        return false
      }

      // Average attendance filter
      if (selectedAttendance && program.averageAttendance !== selectedAttendance) {
        return false
      }

      // Conferences filter
      if (selectedConferences && program.hasConferences !== selectedConferences) {
        return false
      }

      // Outside speakers filter
      if (selectedOutsideSpeakers) {
        const hasOutsideSpeakers = program.hasOutsideSpeakers === true
        const filterValue = selectedOutsideSpeakers === 'true'
        if (hasOutsideSpeakers !== filterValue) {
          return false
        }
      }

      // Education training filter
      if (selectedEducationTraining) {
        const hasEducationTraining = program.hasEducationTraining === true
        const filterValue = selectedEducationTraining === 'true'
        if (hasEducationTraining !== filterValue) {
          return false
        }
      }

      // Annual price range filter
      if (selectedAnnualPriceRange && program.annualPriceRange !== selectedAnnualPriceRange) {
        return false
      }

      // Monthly price range filter
      if (selectedMonthlyPriceRange && program.monthlyPriceRange !== selectedMonthlyPriceRange) {
        return false
      }

      return true
    })
  }, [programs, searchTerm, selectedState, selectedFormat, selectedFrequency, selectedAffiliation, selectedMeetingLength, selectedMeetingType, selectedAttendance, selectedConferences, selectedOutsideSpeakers, selectedEducationTraining, selectedAnnualPriceRange, selectedMonthlyPriceRange])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedState('')
    setSelectedFormat('')
    setSelectedFrequency('')
    setSelectedAffiliation('')
    setSelectedMeetingLength('')
    setSelectedMeetingType('')
    setSelectedAttendance('')
    setSelectedConferences('')
    setSelectedOutsideSpeakers('')
    setSelectedEducationTraining('')
    setSelectedAnnualPriceRange('')
    setSelectedMonthlyPriceRange('')
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
              <div className="filters-title-row">
                <h2 className="filters-title">Filters</h2>
                <button
                  type="button"
                  className="filters-help-button"
                  onClick={() => setIsModalOpen(true)}
                  aria-label="Understand our Filters"
                >
                  <span className="filters-help-icon">?</span>
                  <span className="filters-help-tooltip">Understand our Filters</span>
                </button>
              </div>
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                onChange={(e) => setSelectedState(e.target.value)}
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
              </label>
              <select
                id="format"
                className="filter-select"
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
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
              </label>
              <select
                id="frequency"
                className="filter-select"
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
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
                onChange={(e) => setSelectedAffiliation(e.target.value)}
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
                onChange={(e) => setSelectedMeetingLength(e.target.value)}
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
              </label>
              <select
                id="meetingType"
                className="filter-select"
                value={selectedMeetingType}
                onChange={(e) => setSelectedMeetingType(e.target.value)}
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
                onChange={(e) => setSelectedAttendance(e.target.value)}
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
                onChange={(e) => setSelectedConferences(e.target.value)}
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
                onChange={(e) => setSelectedOutsideSpeakers(e.target.value)}
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
              </label>
              <select
                id="educationTraining"
                className="filter-select"
                value={selectedEducationTraining}
                onChange={(e) => setSelectedEducationTraining(e.target.value)}
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
                onChange={(e) => setSelectedAnnualPriceRange(e.target.value)}
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
                onChange={(e) => setSelectedMonthlyPriceRange(e.target.value)}
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

      {/* Filters Explainer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="modal-title">Understand our Filters</h2>

            <div className="modal-body">
              <section className="modal-section">
                <h3>Format</h3>
                <p>
                  While online meetings can be a great experience and convenient, you may
                  prefer a group that is mostly online, but has in-person meetings or social
                  gatherings at least a few times per year.
                </p>
              </section>

              <section className="modal-section">
                <h3>Frequency</h3>
                <p>
                  Expect weekly meetings to be 60-90 minutes and less frequent meetings to
                  be 2 to 6 hours. What can you commit to?
                </p>
              </section>

              <section className="modal-section">
                <h3>Type of Meeting</h3>

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
              </section>

              <section className="modal-section">
                <h3>One-on-One Meeting with a Coach or Advisor</h3>
                <p>
                  Typically, this feature is only available in peer group programs run by a
                  certified coach or advisor. Certified coaches or facilitators are trained
                  professionals who have received some level of formal training by the
                  sponsoring organization, may also hold other similar certifications and may
                  be a full-time consultant in business or theology.
                </p>
              </section>

              <section className="modal-section">
                <h3>Study Time Outside of Meetings Each Month</h3>
                <p>
                  Peer groups are typically more structured and include more in-depth training
                  elements than other groups. Members of peer groups are more likely to have
                  to commit a few hours per month to study class materials or develop
                  projects and presentations prior to group meetings or one-on-one coaching
                  sessions. Other types of groups are usually far less formal, have little to no
                  outside work requirements and provide a more casual experience.
                </p>
              </section>

              <section className="modal-section">
                <h3>Education and Training</h3>
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
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
