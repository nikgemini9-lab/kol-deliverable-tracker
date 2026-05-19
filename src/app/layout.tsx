import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'KOL Tracker — Track Every Deliverable',
  description: 'Track KOL/influencer deliverables automatically with X/Twitter integration',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
