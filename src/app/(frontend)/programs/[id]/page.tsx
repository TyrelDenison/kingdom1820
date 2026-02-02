import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'
import Link from 'next/link'

import config from '@/payload.config'
import './program-detail.css'

interface ProgramDetailPageProps {
  params: Promise<{ id: string }>
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

export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { id } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  try {
    const program = await payload.findByID({
      collection: 'programs',
      id,
    })

    if (!program || program._status !== 'published') {
      notFound()
    }

    const description = extractTextFromRichText(program.description)

    return (
      <div className="program-detail-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <Link href="/programs">Programs</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{program.name}</span>
          </nav>

          {/* Program Header */}
          <header className="program-header">
            <div className="program-header__top">
              <h1 className="program-title">{program.name}</h1>
              {program.religiousAffiliation && (
                <span className="badge badge-primary">
                  {program.religiousAffiliation === 'protestant' ? 'Protestant' : 'Catholic'}
                </span>
              )}
            </div>

            <div className="program-location">
              <svg className="program-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>
                {program.address && `${program.address}, `}
                {program.city}, {program.state} {program.zipCode}
              </span>
            </div>
          </header>

          <div className="program-layout">
            {/* Main Content */}
            <div className="program-main">
              {description && (
                <section className="program-section">
                  <h2 className="section-title">About This Program</h2>
                  <p className="program-description">{description}</p>
                </section>
              )}

              {/* Meeting Details */}
              <section className="program-section">
                <h2 className="section-title">Meeting Details</h2>
                <div className="details-grid">
                  {program.meetingFormat && (
                    <div className="detail-item">
                      <dt className="detail-label">Format</dt>
                      <dd className="detail-value">
                        {program.meetingFormat === 'in-person' ? 'In-person only' :
                         program.meetingFormat === 'online' ? 'Online only' : 'Both in-person and online'}
                      </dd>
                    </div>
                  )}
                  {program.meetingFrequency && (
                    <div className="detail-item">
                      <dt className="detail-label">Frequency</dt>
                      <dd className="detail-value">
                        {program.meetingFrequency.charAt(0).toUpperCase() + program.meetingFrequency.slice(1)}
                      </dd>
                    </div>
                  )}
                  {program.meetingLength && (
                    <div className="detail-item">
                      <dt className="detail-label">Duration</dt>
                      <dd className="detail-value">
                        {program.meetingLength} hours
                      </dd>
                    </div>
                  )}
                  {program.meetingType && (
                    <div className="detail-item">
                      <dt className="detail-label">Type</dt>
                      <dd className="detail-value">
                        {program.meetingType === 'peer-group' ? 'Peer group' :
                         program.meetingType === 'forum' ? 'Forum w/ speakers, Q&A' :
                         'Small group discussion'}
                      </dd>
                    </div>
                  )}
                  {program.averageAttendance && (
                    <div className="detail-item">
                      <dt className="detail-label">Average Attendance</dt>
                      <dd className="detail-value">~{program.averageAttendance} people</dd>
                    </div>
                  )}
                </div>
              </section>

              {/* Additional Features */}
              {(program.hasConferences !== 'none' || program.hasOutsideSpeakers || program.hasEducationTraining) && (
                <section className="program-section">
                  <h2 className="section-title">Additional Features</h2>
                  <ul className="features-list">
                    {program.hasConferences && program.hasConferences !== 'none' && (
                      <li>
                        <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Conferences: {program.hasConferences.charAt(0).toUpperCase() + program.hasConferences.slice(1)}
                      </li>
                    )}
                    {program.hasOutsideSpeakers && (
                      <li>
                        <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Features outside speakers
                      </li>
                    )}
                    {program.hasEducationTraining && (
                      <li>
                        <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Offers education and training
                      </li>
                    )}
                  </ul>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="program-sidebar">
              {/* Contact Card */}
              <div className="contact-card">
                <h3 className="contact-card__title">Contact Information</h3>

                {program.contactEmail && (
                  <div className="contact-item">
                    <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${program.contactEmail}`} className="contact-link">
                      {program.contactEmail}
                    </a>
                  </div>
                )}

                {program.contactPhone && (
                  <div className="contact-item">
                    <svg className="contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${program.contactPhone}`} className="contact-link">
                      {program.contactPhone}
                    </a>
                  </div>
                )}

                {program.website && (
                  <a
                    href={program.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-full"
                  >
                    Visit Website
                  </a>
                )}

                <Link href="/programs" className="btn btn-secondary btn-full">
                  Back to Programs
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
