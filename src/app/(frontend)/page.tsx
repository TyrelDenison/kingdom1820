import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'

import config from '@/payload.config'
import { ProgramCard, Program } from '@/components/ProgramCard'
import './page.css'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // Fetch featured programs (limit to 6 for the home page)
  const { docs: programs } = await payload.find({
    collection: 'programs',
    limit: 6,
    sort: '-createdAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero__content">
            <h1 className="hero__title">
              Connect with Faith-Based Professional Networks
            </h1>
            <p className="hero__subtitle">
              Discover business and professional programs grounded in Christian values.
              Build meaningful relationships with like-minded professionals committed to
              excellence and integrity.
            </p>
            <div className="hero__actions">
              <Link href="/programs" className="btn btn-primary btn-large">
                Explore Programs
              </Link>
              <Link href="/about" className="btn btn-secondary btn-large">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats__grid">
            <div className="stats__item">
              <div className="stats__number">{programs.length}+</div>
              <div className="stats__label">Programs Listed</div>
            </div>
            <div className="stats__item">
              <div className="stats__number">Nationwide</div>
              <div className="stats__label">Coverage</div>
            </div>
            <div className="stats__item">
              <div className="stats__number">All Formats</div>
              <div className="stats__label">In-Person & Online</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Programs</h2>
            <p className="section-description">
              Recently added faith-based professional networks and programs
            </p>
          </div>

          {programs.length > 0 ? (
            <>
              <div className="programs-grid">
                {programs.map((program: any) => (
                  <ProgramCard
                    key={program.id}
                    program={program as Program}
                  />
                ))}
              </div>

              <div className="section-footer">
                <Link href="/programs" className="btn btn-primary">
                  View All Programs
                </Link>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>No programs available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2 className="cta-card__title">
              Ready to Find Your Professional Community?
            </h2>
            <p className="cta-card__description">
              Start your search for faith-based professional programs that align with your
              values and career goals. Connect with networks across the country.
            </p>
            <Link href="/programs" className="btn btn-primary btn-large">
              Start Searching
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
