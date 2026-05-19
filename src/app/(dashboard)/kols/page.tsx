import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, UserPlus } from 'lucide-react'
import { getCompletionPct, getPayoutRecommendation, getKolStatus, formatCurrency, PAYOUT_COLORS, STATUS_COLORS } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function KolsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', session.user.id)
    .single()

  if (!memberRow) redirect('/onboarding')

  const workspaceId = memberRow.workspace_id

  const { data: kols } = await supabase
    .from('kols')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  const { data: campaignIds } = await supabase
    .from('campaigns')
    .select('id, kol_id, deliverables(*)')
    .eq('workspace_id', workspaceId)

  const { data: posts } = await supabase
    .from('tracked_posts')
    .select('*')
    .in('campaign_id', campaignIds?.map(c => c.id) || [])

  const { data: manualLogs } = await supabase
    .from('manual_logs')
    .select('*')
    .in('campaign_id', campaignIds?.map(c => c.id) || [])

  const kolsWithStats = (kols || []).map(kol => {
    const campaign = campaignIds?.find(c => c.kol_id === kol.id)
    const deliverables = campaign?.deliverables?.[0] || null
    const kolPosts = posts?.filter(p => p.kol_id === kol.id) || []
    const kolLogs = manualLogs?.filter(l => l.kol_id === kol.id) || []
    const pct = getCompletionPct(deliverables, kolPosts, kolLogs)
    const payout = getPayoutRecommendation(pct)
    const statusLabel = campaign ? getKolStatus(campaign as any, pct) : 'on_track'
    return { ...kol, completionPct: pct, payout, statusLabel }
  })

  const addButton = (
    <Link href="/kols/new">
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        Add KOL
      </Button>
    </Link>
  )

  if (!kols || kols.length === 0) {
    return (
      <>
        <Header title="KOLs" actions={addButton} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="font-semibold text-slate-900 mb-2">No KOLs yet</h2>
            <p className="text-sm text-slate-500 mb-6">Add your first KOL to start tracking their deliverables.</p>
            <Link href="/kols/new">
              <Button className="gap-2"><Plus className="h-4 w-4" />Add your first KOL</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const STATUS_LABELS: Record<string, string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    completed: 'Completed',
    overdue: 'Overdue',
  }

  return (
    <>
      <Header title="KOLs" subtitle={`${kols.length} KOLs total`} actions={addButton} />
      <div className="flex-1 p-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>KOL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kolsWithStats.map(kol => (
                  <TableRow key={kol.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {kol.avatar_url && <AvatarImage src={kol.avatar_url} />}
                          <AvatarFallback className="text-xs">{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{kol.name}</p>
                          <p className="text-xs text-slate-500">@{kol.x_handle}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[kol.statusLabel] || 'bg-slate-100 text-slate-600'}>
                        {STATUS_LABELS[kol.statusLabel] || kol.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <Progress value={kol.completionPct} className="flex-1" />
                        <span className="text-xs text-slate-600 w-8 text-right">{kol.completionPct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{formatCurrency(kol.monthly_fee)}</TableCell>
                    <TableCell>
                      <Badge className={PAYOUT_COLORS[kol.payout] || ''}>
                        {kol.payout === 'pay' ? 'Pay' : kol.payout === 'hold' ? 'Hold' : 'Review'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/kols/${kol.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
