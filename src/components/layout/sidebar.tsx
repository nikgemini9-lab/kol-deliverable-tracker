'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Target, FileText, BarChart2,
  Settings, ChevronRight, Zap, BookOpen, Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kols', label: 'KOLs', icon: Users },
  { href: '/campaigns', label: 'Campaigns', icon: Target },
  { href: '/deliverables', label: 'Deliverables', icon: BookOpen },
  { href: '/tracked-posts', label: 'Tracked Posts', icon: Zap },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
            <Radio className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-sm">KOL Tracker</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700 mb-1">Need help?</p>
          <p>Check the docs or contact support.</p>
        </div>
      </div>
    </aside>
  )
}
