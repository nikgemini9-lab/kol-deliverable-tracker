import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Users, Target, CheckCircle2, Clock, AlertTriangle, Eye, Heart, Repeat2, MessageCircle } from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    totalKols: number
    activeCampaigns: number
    totalCompleted: number
    totalPromised: number
    totalPending: number
    totalOverdue: number
    completionPct: number
    totalViews: number
    totalLikes: number
    totalReposts: number
    totalReplies: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { label: 'Total KOLs', value: stats.totalKols, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Target, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Completed', value: stats.totalCompleted, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Overdue', value: stats.totalOverdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const engagement = [
    { label: 'Total Views', value: stats.totalViews, icon: Eye },
    { label: 'Likes', value: stats.totalLikes, icon: Heart },
    { label: 'Reposts', value: stats.totalReposts, icon: Repeat2 },
    { label: 'Replies', value: stats.totalReplies, icon: MessageCircle },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(c => (
          <Card key={c.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{c.label}</span>
                <div className={`h-8 w-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Overall Completion</span>
            <span className="text-sm font-bold text-slate-900">{stats.completionPct}%</span>
          </div>
          <Progress value={stats.completionPct} className="h-2.5" />
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            <span>{stats.totalCompleted} completed</span>
            <span>{stats.totalPending} pending</span>
            <span className="text-red-500">{stats.totalOverdue} overdue</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {engagement.map(e => (
          <Card key={e.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <e.icon className="h-4 w-4 text-slate-400" />
                <span className="text-xs text-slate-500">{e.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-900">{formatNumber(e.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
