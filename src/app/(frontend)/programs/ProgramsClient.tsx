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

      return true
    })
  }, [programs, searchTerm, selectedState, selectedFormat, selectedFrequency, selectedAffiliation])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedState('')
    setSelectedFormat('')
    setSelectedFrequency('')
    setSelectedAffiliation('')
  }

  const activeFiltersCount = [
    selectedState,
    selectedFormat,
    selectedFrequency,
    selectedAffiliation,
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
