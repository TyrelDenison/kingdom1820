import React from 'react'
import Link from 'next/link'
import './ProgramCard.css'

export interface Program {
  id: string
  name: string
  description?: any
  religiousAffiliation?: 'protestant' | 'catholic'
  address: string
  city: string
  state: string
  zipCode: string
  meetingFormat?: 'in-person' | 'online' | 'both'
  meetingFrequency?: 'weekly' | 'monthly' | 'quarterly'
  meetingLength?: '1-2' | '2-4' | '4-8'
  meetingType?: 'peer-group' | 'forum' | 'small-group'
  averageAttendance?: '1-10' | '10-20' | '20-50' | '50-100' | '100+'
  hasConferences?: 'none' | 'annual' | 'multiple'
  hasOutsideSpeakers?: boolean
  hasEducationTraining?: boolean
  contactEmail?: string
  contactPhone?: string
  website?: string
}

interface ProgramCardProps {
  program: Program
  variant?: 'default' | 'compact'
}

// Helper function to extract text from Lexical richText
function extractTextFromRichText(richText: any): string {
  if (!richText || !richText.root || !richText.root.children) {
    return ''
  }

  const extractFromNode = (node: any): string => {
    if (node.text) {
      return node.text
    }
    if (node.children) {
      return node.children.map(extractFromNode).join(' ')
    }
    return ''
  }

  return richText.root.children.map(extractFromNode).join(' ').trim()
}

export function ProgramCard({ program, variant = 'default' }: ProgramCardProps) {
  const description = extractTextFromRichText(program.description)
  const truncatedDescription = description.length > 200
    ? description.substring(0, 200) + '...'
    : description

  return (
    <article className={`program-card ${variant === 'compact' ? 'program-card--compact' : ''}`}>
      <div className="program-card__header">
        <h3 className="program-card__title">{program.name}</h3>
        {program.religiousAffiliation && (
          <span className="badge badge-primary">
            {program.religiousAffiliation === 'protestant' ? 'Protestant' : 'Catholic'}
          </span>
        )}
      </div>

      {description && variant === 'default' && (
        <p className="program-card__description">{truncatedDescription}</p>
      )}

      <div className="program-card__location">
        <svg className="program-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{program.city}, {program.state}</span>
      </div>

      <div className="program-card__details">
        {program.meetingFormat && (
          <div className="program-card__detail-item">
            <span className="program-card__detail-label">Format:</span>
            <span className="program-card__detail-value">
              {program.meetingFormat === 'in-person' ? 'In-person' :
               program.meetingFormat === 'online' ? 'Online' : 'Both'}
            </span>
          </div>
        )}
        {program.meetingFrequency && (
          <div className="program-card__detail-item">
            <span className="program-card__detail-label">Frequency:</span>
            <span className="program-card__detail-value">
              {program.meetingFrequency.charAt(0).toUpperCase() + program.meetingFrequency.slice(1)}
            </span>
          </div>
        )}
        {program.meetingType && (
          <div className="program-card__detail-item">
            <span className="program-card__detail-label">Type:</span>
            <span className="program-card__detail-value">
              {program.meetingType === 'peer-group' ? 'Peer group' :
               program.meetingType === 'forum' ? 'Forum w/ speakers' :
               'Small group discussion'}
            </span>
          </div>
        )}
        {program.averageAttendance && (
          <div className="program-card__detail-item">
            <span className="program-card__detail-label">Attendance:</span>
            <span className="program-card__detail-value">{program.averageAttendance}</span>
          </div>
        )}
      </div>

      {variant === 'default' && (
        <div className="program-card__features">
          {program.hasConferences && program.hasConferences !== 'none' && (
            <span className="badge">
              Conferences: {program.hasConferences.charAt(0).toUpperCase() + program.hasConferences.slice(1)}
            </span>
          )}
          {program.hasOutsideSpeakers && (
            <span className="badge">Outside Speakers</span>
          )}
          {program.hasEducationTraining && (
            <span className="badge">Education & Training</span>
          )}
        </div>
      )}

      <div className="program-card__actions">
        <Link href={`/programs/${program.id}`} className="btn btn-primary">
          View Details
        </Link>
        {program.website && (
          <a
            href={program.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Visit Website
          </a>
        )}
      </div>
    </article>
  )
}
