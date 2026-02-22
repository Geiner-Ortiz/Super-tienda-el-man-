import type { Metadata, Viewport } from 'next'
import { siteConfig } from '@/config/siteConfig'
import { ThemeProvider } from '@/shared/components/ThemeProvider'
import './globals.css'

export const metadata: Metadata = {
  title: siteConfig.seo.siteTitle,
  description: siteConfig.seo.defaultDescription,
  openGraph: {
    title: siteConfig.seo.siteTitle,
    description: siteConfig.seo.defaultDescription,
    locale: siteConfig.seo.locale,
    siteName: siteConfig.firmName,
    type: 'website',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: siteConfig.firmName,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10B981' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="overflow-x-hidden w-full relative">
        <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors toastOptions={{ style: { zIndex: 99999 } }} />
        </ThemeProvider>
      </body>
    </html>
  )
}
