// ...
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import "leaflet/dist/leaflet.css"

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TELMEX ADMIN',
  description: 'Panel administrativo TELMEX',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/logo.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/logo.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/logo.png',
        sizes: '48x48',
        type: 'image/png',
      },
    ],
    apple: '/logo.png',
  },
}

import { AuthGuard } from "@/components/auth-guard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        <AuthGuard>{children}</AuthGuard>
        <Analytics />
      </body>
    </html>
  );
}
