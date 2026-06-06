import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-ibm-mono',
})

export const metadata: Metadata = {
  title: 'PitchMirror — AI Demo Day Simulator',
  description: 'Practice your Demo Day pitch with AI investor replicas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${bebasNeue.variable} ${dmSans.variable} ${ibmPlexMono.variable} bg-void text-snow antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
