'use client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { KOL } from '@/lib/types'
import { formatCurrency, formatDate, STATUS_COLORS, PAYOUT_COLORS } from '@/lib/utils'
import { Calendar, DollarSign } from 'lucide-react'

interface KolCardProps {
  kol: KOL
  completionPct?: number
  statusLabel?: string
  payout?: string
}

export function KolCard({ kol, completionPct = 0, statusLabel = 'on_track', payout = 'review' }: KolCardProps) {
  const statusLabels: Record<string, string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    completed: 'Completed',
    overdue: 'Overdue',
  }

  return (
    <Link href={`/kols/${kol.id}`}>
      <Card className="hover:border-slate-300 transition-colors cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <Avatar className="h-10 w-10">
              {kol.avatar_url && <AvatarImage src={kol.avatar_url} />}
              <AvatarFallback className="text-sm">{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 truncate">{kol.name}</p>
              <p className="text-xs text-slate-500">@{kol.x_handle}</p>
            </div>
            <Badge className={STATUS_COLORS[statusLabel] || 'bg-slate-100 text-slate-600'}>
              {statusLabels[statusLabel] || statusLabel}
            </Badge>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Completion</span>
              <span className="font-medium text-slate-700">{completionPct}%</span>
            </div>
            <Progress value={completionPct} />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatCurrency(kol.monthly_fee)}/mo
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYOUT_COLORS[payout] || ''}`}>
              {payout === 'pay' ? 'Pay' : payout === 'hold' ? 'Hold' : 'Review'}
            </span>
          </div>

          {(kol.campaign_start || kol.campaign_end) && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3 w-3" />
              {formatDate(kol.campaign_start)} → {formatDate(kol.campaign_end)}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
