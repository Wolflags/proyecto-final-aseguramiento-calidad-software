import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InventoryPro',
  description: 'Creado por José Rafael Jáquez y Natasha López',
  generator: 'José Rafael Jáquez y Natasha López'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
