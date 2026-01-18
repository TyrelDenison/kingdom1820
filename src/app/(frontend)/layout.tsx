import React from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Header } from '@/components/Header'
import './styles.css'

export const metadata = {
  description: 'Find faith-based professional programs and business networks aligned with your values.',
  title: 'Kingdom1820 - Faith-Based Professional Programs',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
      </body>
    </html>
  )
}
