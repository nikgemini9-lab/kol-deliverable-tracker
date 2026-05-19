import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { KOL } from '@/lib/types'

interface KolWithCompletion extends KOL {
  completionPct: number
  payout: 'pay' | 'hold' | 'review'
}

interface TopKolsProps {
  kols: KolWithCompletion[]
  title?: string
  atRisk?: boolean
}

export function TopKols({ kols, title = 'Top Performing KOLs', atRisk = false }: TopKolsProps) {
  if (kols.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400 text-sm">No data yet</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kols.map(kol => (
            <Link key={kol.id} href={`/kols/${kol.id}`} className="flex items-center gap-3 group">
              <Avatar className="h-9 w-9">
                {kol.avatar_url && <AvatarImage src={kol.avatar_url} />}
                <AvatarFallback className="text-xs">
                  {kol.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    {kol.name}
                  </span>
                  <span className="text-xs font-medium text-slate-700 ml-2">{kol.completionPct}%</span>
                </div>
                <Progress value={kol.completionPct} className="h-1.5" />
                <p className="text-xs text-slate-400 mt-0.5">@{kol.x_handle}</p>
              </div>
              {atRisk && (
                <Badge variant="warning" className="ml-2 shrink-0">At Risk</Badge>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
