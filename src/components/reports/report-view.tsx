'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KOL, Campaign, TrackedPost, ManualLog, Deliverables } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getCompletionPct, getPayoutRecommendation, monthName, formatNumber, PAYOUT_COLORS } from '@/lib/utils'
import { Copy, Download, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface ReportViewProps {
  kols: KOL[]
  campaigns: any[]
  posts: any[]
  logs: ManualLog[]
  month: number
  year: number
  selectedKolId?: string
  workspaceId: string
}

export function ReportView({ kols, campaigns, posts, logs, month, year, selectedKolId, workspaceId }: ReportViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selMonth, setSelMonth] = useState(month)
  const [selYear, setSelYear] = useState(year)
  const [selKolId, setSelKolId] = useState(selectedKolId || '')

  function navigate() {
    const params = new URLSearchParams()
    params.set('month', selMonth.toString())
    params.set('year', selYear.toString())
    if (selKolId) params.set('kolId', selKolId)
    router.push(`/reports?${params.toString()}`)
  }

  const filteredCampaigns = selKolId
    ? campaigns.filter(c => c.kol_id === selKolId)
    : campaigns

  function copyReport() {
    const lines: string[] = [`KOL Report — ${monthName(selMonth)} ${selYear}`, '']
    filteredCampaigns.forEach(c => {
      const d = c.deliverables?.[0] as Deliverables | null
      const kolPosts = posts.filter(p => p.kol_id === c.kol_id)
      const kolLogs = logs.filter(l => l.kol_id === c.kol_id)
      const pct = getCompletionPct(d, kolPosts, kolLogs)
      const payout = getPayoutRecommendation(pct)
      lines.push(`## ${c.kol?.name} (@${c.kol?.x_handle})`)
      lines.push(`Completion: ${pct}% | Payout: ${payout.toUpperCase()}`)
      if (d) {
        lines.push(`Original Tweets: ${kolPosts.filter(p => p.tweet_type === 'original').length}/${d.original_tweets}`)
        lines.push(`Mentions: ${kolPosts.filter(p => p.tweet_type === 'mention').length}/${d.company_mentions}`)
        lines.push(`Handle Tags: ${kolPosts.filter(p => p.tweet_type === 'handle_tag').length}/${d.handle_tags}`)
        lines.push(`Quote Tweets: ${kolPosts.filter(p => p.tweet_type === 'quote_tweet').length}/${d.quote_tweets}`)
        lines.push(`Replies: ${kolPosts.filter(p => p.tweet_type === 'reply').length}/${d.replies_interactions}`)
      }
      const totalEngagement = kolPosts.reduce((acc, p) => acc + p.views, 0)
      lines.push(`Total Views: ${formatNumber(totalEngagement)}`)
      lines.push('')
    })
    navigator.clipboard.writeText(lines.join('\n'))
    toast({ title: 'Report copied to clipboard', variant: 'success' })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Month</label>
              <select
                value={selMonth}
                onChange={e => setSelMonth(parseInt(e.target.value))}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Year</label>
              <input
                type="number"
                value={selYear}
                onChange={e => setSelYear(parseInt(e.target.value))}
                className="flex h-9 w-24 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">KOL (optional)</label>
              <select
                value={selKolId}
                onChange={e => setSelKolId(e.target.value)}
                className="flex h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                <option value="">All KOLs</option>
                {kols.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
            </div>
            <Button onClick={navigate} size="sm">Apply</Button>
            <Button onClick={copyReport} size="sm" variant="outline" className="gap-2 ml-auto">
              <Copy className="h-4 w-4" />
              Copy Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report cards */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No campaigns found for {monthName(selMonth)} {selYear}.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => {
            const d = campaign.deliverables?.[0] as Deliverables | null
            const kolPosts = posts.filter(p => p.kol_id === campaign.kol_id)
            const kolLogs = logs.filter(l => l.kol_id === campaign.kol_id)
            const pct = getCompletionPct(d, kolPosts, kolLogs)
            const payout = getPayoutRecommendation(pct)
            const totalViews = kolPosts.reduce((acc, p) => acc + (p.views || 0), 0)
            const totalLikes = kolPosts.reduce((acc, p) => acc + (p.likes || 0), 0)

            const rows = d ? [
              { label: 'Original Tweets', promised: d.original_tweets, completed: kolPosts.filter(p => p.tweet_type === 'original').length },
              { label: 'Company Mentions', promised: d.company_mentions, completed: kolPosts.filter(p => p.tweet_type === 'mention').length },
              { label: 'Handle Tags', promised: d.handle_tags, completed: kolPosts.filter(p => p.tweet_type === 'handle_tag').length },
              { label: 'Quote Tweets', promised: d.quote_tweets, completed: kolPosts.filter(p => p.tweet_type === 'quote_tweet').length },
              { label: 'Replies', promised: d.replies_interactions, completed: kolPosts.filter(p => p.tweet_type === 'reply').length },
            ].filter(r => r.promised > 0) : []

            return (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{campaign.kol?.name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-0.5">
                        @{campaign.kol?.x_handle} · {campaign.company?.name} · {monthName(campaign.month)} {campaign.year}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={PAYOUT_COLORS[payout] || ''}>
                        {payout === 'pay' ? '✓ Pay' : payout === 'hold' ? '✗ Hold' : '~ Review'}
                      </Badge>
                      <span className="text-lg font-bold text-slate-900">{pct}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress value={pct} className="h-2" />
                  </div>

                  {rows.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {rows.map(row => (
                        <div key={row.label} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{row.label}</span>
                          <span className={row.completed >= row.promised ? 'text-emerald-600 font-medium' : 'text-slate-500'}>
                            {row.completed}/{row.promised}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-6 text-sm text-slate-500 border-t border-slate-100 pt-3">
                    <span>{formatNumber(totalViews)} views</span>
                    <span>{formatNumber(totalLikes)} likes</span>
                    <span>{kolPosts.length} posts tracked</span>
                    <span>{kolLogs.length} manual logs</span>
                  </div>

                  {/* Missing deliverables */}
                  {rows.some(r => r.completed < r.promised) && (
                    <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100">
                      <p className="text-xs font-medium text-red-700 mb-1">Missing deliverables:</p>
                      <ul className="text-xs text-red-600 space-y-0.5">
                        {rows.filter(r => r.completed < r.promised).map(r => (
                          <li key={r.label}>• {r.label}: {r.promised - r.completed} remaining</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Post links */}
                  {kolPosts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-600 mb-2">Tracked Posts:</p>
                      <div className="flex flex-wrap gap-2">
                        {kolPosts.slice(0, 5).map(p => (
                          p.tweet_url && (
                            <a
                              key={p.id}
                              href={p.tweet_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {p.tweet_type}
                            </a>
                          )
                        ))}
                        {kolPosts.length > 5 && (
                          <span className="text-xs text-slate-400">+{kolPosts.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
