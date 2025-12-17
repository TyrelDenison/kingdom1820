import React from 'react'
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
      </body>
    </html>
  )
}
