import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Nunito_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const nunito = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Chambista — Encuentra profesionales de confianza',
  description:
    'Chambista conecta a las personas con plomeros, electricistas, técnicos y más profesionales locales de confianza.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chambista',
  },
  icons: {
    icon: [
      {
        url: '/5447b5d0-2e72-43c0-bb40-a545a174aec4-removebg-preview.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    apple: '/5447b5d0-2e72-43c0-bb40-a545a174aec4-removebg-preview.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

import { QueryProvider } from '@/components/providers/query-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${jakarta.variable} ${nunito.variable}`}>
      <body className="antialiased font-body bg-background text-foreground">
        <QueryProvider>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </QueryProvider>
        {/* PWA Service Worker handling: unregister on dev/localhost to avoid caching issues, register in production */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                var isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                if (isDev) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var i = 0; i < regs.length; i++) {
                      regs[i].unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var j = 0; j < keys.length; j++) {
                        caches.delete(keys[j]);
                      }
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(reg) { console.log('[SW] Registrado:', reg.scope); })
                      .catch(function(err) { console.warn('[SW] Error:', err); });
                  });
                }
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
