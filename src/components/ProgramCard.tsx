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

// Helper to format meeting format display value
function formatMeetingFormat(format?: string): string {
  if (!format) return '—'
  if (format === 'in-person') return 'In-person'
  if (format === 'online') return 'Online'
  return 'Both'
}

// Helper to format meeting type display value
function formatMeetingType(type?: string): string {
  if (!type) return '—'
  if (type === 'peer-group') return 'Peer group'
  if (type === 'forum') return 'Forum w/ speakers'
  return 'Small group discussion'
}

// Helper to capitalize first letter
function capitalize(str?: string): string {
  if (!str) return '—'
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function ProgramCard({ program, variant = 'default' }: ProgramCardProps) {
  const description = extractTextFromRichText(program.description)

  return (
    <article className={`program-card ${variant === 'compact' ? 'program-card--compact' : ''}`}>
      <div className="program-card__header">
        <h3 className="program-card__title">{program.name}</h3>
        <span className="badge badge-primary">
          {program.religiousAffiliation === 'catholic' ? 'Catholic' : 'Protestant'}
        </span>
      </div>

      {variant === 'default' && (
        <p className="program-card__description">
          {description || <span className="program-card__placeholder">&nbsp;</span>}
        </p>
      )}

      <div className="program-card__location">
        <svg className="program-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{program.city}, {program.state}</span>
      </div>

      <div className="program-card__details">
        <div className="program-card__detail-item">
          <span className="program-card__detail-label">Format:</span>
          <span className="program-card__detail-value">
            {formatMeetingFormat(program.meetingFormat)}
          </span>
        </div>
        <div className="program-card__detail-item">
          <span className="program-card__detail-label">Frequency:</span>
          <span className="program-card__detail-value">
            {capitalize(program.meetingFrequency)}
          </span>
        </div>
        <div className="program-card__detail-item">
          <span className="program-card__detail-label">Type:</span>
          <span className="program-card__detail-value">
            {formatMeetingType(program.meetingType)}
          </span>
        </div>
        <div className="program-card__detail-item">
          <span className="program-card__detail-label">Attendance:</span>
          <span className="program-card__detail-value">
            {program.averageAttendance || '—'}
          </span>
        </div>
      </div>

      {variant === 'default' && (
        <ul className="program-card__features">
          <li className={!program.hasConferences || program.hasConferences === 'none' ? 'program-card__feature--empty' : ''}>
            <svg className="program-card__feature-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {program.hasConferences && program.hasConferences !== 'none'
              ? `Conferences: ${capitalize(program.hasConferences)}`
              : <span>&nbsp;</span>}
          </li>
          <li className={!program.hasOutsideSpeakers ? 'program-card__feature--empty' : ''}>
            <svg className="program-card__feature-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {program.hasOutsideSpeakers ? 'Features outside speakers' : <span>&nbsp;</span>}
          </li>
          <li className={!program.hasEducationTraining ? 'program-card__feature--empty' : ''}>
            <svg className="program-card__feature-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {program.hasEducationTraining ? 'Offers education and training' : <span>&nbsp;</span>}
          </li>
        </ul>
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
