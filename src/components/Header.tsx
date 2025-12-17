import React from 'react'
import Link from 'next/link'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <Link href="/" className="header__logo">
            Kingdom1820
          </Link>

          <nav className="header__nav">
            <Link href="/" className="header__nav-link">
              Home
            </Link>
            <Link href="/programs" className="header__nav-link">
              Find Programs
            </Link>
            <Link href="/about" className="header__nav-link">
              About
            </Link>
          </nav>

          <div className="header__actions">
            <Link href="/programs" className="btn btn-primary">
              Search Programs
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
