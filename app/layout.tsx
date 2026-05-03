import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Proofly — Certifiez votre travail freelance', template: '%s | Proofly' },
  description: 'Transformez votre travail en preuves certifiées et immuables. Un identifiant unique, une analyse IA, une page publique à partager.',
  openGraph: {
    title: 'Proofly — Certifiez votre travail freelance',
    description: 'Transformez votre travail en preuves certifiées et immuables.',
    url: process.env.NEXT_PUBLIC_APP_URL, siteName: 'Proofly', locale: 'fr_FR', type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Proofly — Certifiez votre travail freelance' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#FAFAF8', color: '#111111' }}>
        {children}
      </body>
    </html>
  )
}
