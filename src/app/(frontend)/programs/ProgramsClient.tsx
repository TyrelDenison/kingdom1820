'use client'

import React, { useState, useMemo } from 'react'
import { ProgramCard, Program } from '@/components/ProgramCard'
import './programs.css'

interface ProgramsClientProps {
  programs: any[]
}

export function ProgramsClient({ programs }: ProgramsClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
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

      return true
    })
  }, [programs, searchTerm, selectedState, selectedFormat, selectedFrequency, selectedAffiliation, selectedMeetingLength, selectedMeetingType, selectedAttendance, selectedConferences, selectedOutsideSpeakers, selectedEducationTraining])

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
          </aside>

          {/* Programs List */}
          <div className="programs-content">
            <div className="programs-results-header">
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
    </div>
  )
}
