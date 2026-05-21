import { getWorkspaceForUser } from '@/lib/supabase/workspace'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getCompletionPct, getPayoutRecommendation, monthName, STATUS_COLORS, PAYOUT_COLORS } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CampaignsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const memberRow = await getWorkspaceForUser(session.user.id)

  if (!memberRow) redirect('/onboarding')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, kol:kols(*), company:companies(*), deliverables(*)')
    .eq('workspace_id', memberRow.workspace_id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const { data: allPosts } = await supabase
    .from('tracked_posts')
    .select('*')
    .in('campaign_id', campaigns?.map(c => c.id) || [])

  const { data: allLogs } = await supabase
    .from('manual_logs')
    .select('*')
    .in('campaign_id', campaigns?.map(c => c.id) || [])

  const STATUS_LABELS: Record<string, string> = {
    active: 'Active',
    at_risk: 'At Risk',
    completed: 'Completed',
    overdue: 'Overdue',
  }

  return (
    <>
      <Header title="Campaigns" subtitle={`${campaigns?.length || 0} total campaigns`} />
      <div className="flex-1 p-6">
        {!campaigns || campaigns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No campaigns yet. Add a KOL and create their first campaign.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KOL</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead>Payout</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map(c => {
                    const deliverables = c.deliverables?.[0] || null
                    const posts = allPosts?.filter(p => p.campaign_id === c.id) || []
                    const logs = allLogs?.filter(l => l.campaign_id === c.id) || []
                    const pct = getCompletionPct(deliverables, posts, logs)
                    const payout = getPayoutRecommendation(pct)
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <p className="font-medium text-slate-900">{c.kol?.name}</p>
                          <p className="text-xs text-slate-500">@{c.kol?.x_handle}</p>
                        </TableCell>
                        <TableCell className="text-slate-700">{c.company?.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {monthName(c.month)} {c.year}
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-600'}>
                            {STATUS_LABELS[c.status] || c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={pct} className="flex-1" />
                            <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={PAYOUT_COLORS[payout] || ''}>
                            {payout === 'pay' ? 'Pay' : payout === 'hold' ? 'Hold' : 'Review'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/kols/${c.kol_id}`}>
                            <Button size="sm" variant="ghost">View KOL</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
