import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DeliverableProgress } from '@/components/deliverables/deliverable-progress'
import { RecentPosts } from '@/components/dashboard/recent-posts'
import { SyncButton } from '@/components/kols/sync-button'
import { ManualLogSection } from '@/components/kols/manual-log-section'
import { CampaignSetup } from '@/components/kols/campaign-setup'
import {
  getCompletionPct, getPayoutRecommendation, getKolStatus,
  formatCurrency, formatDate, STATUS_COLORS, PAYOUT_COLORS
} from '@/lib/utils'
import { redirect, notFound } from 'next/navigation'
import { ExternalLink, Calendar, DollarSign, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function KolDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: kol } = await supabase
    .from('kols')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!kol) notFound()

  // Get current month campaign
  const now = new Date()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, company:companies(*), deliverables(*)')
    .eq('kol_id', kol.id)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  const currentCampaign = campaigns?.[0] || null
  const deliverables = currentCampaign?.deliverables?.[0] || null

  const { data: posts } = await supabase
    .from('tracked_posts')
    .select('*, kol:kols(id, name, x_handle)')
    .eq('kol_id', kol.id)
    .order('posted_at', { ascending: false })

  const { data: manualLogs } = await supabase
    .from('manual_logs')
    .select('*')
    .eq('kol_id', kol.id)
    .order('created_at', { ascending: false })

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('workspace_id', kol.workspace_id)

  const { data: syncLogs } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('kol_id', kol.id)
    .order('synced_at', { ascending: false })
    .limit(1)

  const completionPct = getCompletionPct(deliverables, posts || [], manualLogs || [])
  const payout = getPayoutRecommendation(completionPct)
  const statusLabel = currentCampaign
    ? getKolStatus({ ...currentCampaign, kol } as any, completionPct)
    : 'on_track'

  const STATUS_LABELS: Record<string, string> = {
    on_track: 'On Track',
    at_risk: 'At Risk',
    completed: 'Completed',
    overdue: 'Overdue',
  }

  const lastSync = syncLogs?.[0]?.synced_at

  return (
    <>
      <Header
        title={kol.name}
        subtitle={`@${kol.x_handle}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href={`/kols/${kol.id}/edit`}>
              <Button size="sm" variant="outline">Edit</Button>
            </Link>
            {currentCampaign && (
              <SyncButton
                kolId={kol.id}
                campaignId={currentCampaign.id}
                lastSync={lastSync}
              />
            )}
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* KOL Info */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Card className="flex-1">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  {kol.avatar_url && <AvatarImage src={kol.avatar_url} />}
                  <AvatarFallback className="text-lg">{kol.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="font-semibold text-slate-900 text-lg">{kol.name}</h2>
                    <Badge className={STATUS_COLORS[statusLabel] || 'bg-slate-100 text-slate-600'}>
                      {STATUS_LABELS[statusLabel]}
                    </Badge>
                    <Badge className={PAYOUT_COLORS[payout] || ''}>
                      {payout === 'pay' ? '✓ Pay' : payout === 'hold' ? '✗ Hold' : '~ Review'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">@{kol.x_handle}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      {formatCurrency(kol.monthly_fee)}/mo
                    </span>
                    {kol.follower_count && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-slate-400" />
                        {kol.follower_count.toLocaleString()} followers
                      </span>
                    )}
                    {(kol.campaign_start || kol.campaign_end) && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {formatDate(kol.campaign_start)} → {formatDate(kol.campaign_end)}
                      </span>
                    )}
                    {kol.profile_link && (
                      <a
                        href={kol.profile_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full sm:w-48 shrink-0">
            <CardContent className="p-5 text-center">
              <p className="text-4xl font-bold text-slate-900 mb-1">{completionPct}%</p>
              <p className="text-xs text-slate-500">Overall completion</p>
              <Separator className="my-3" />
              <div className="space-y-1 text-xs text-slate-500">
                <p>{posts?.length || 0} posts tracked</p>
                <p>{manualLogs?.length || 0} manual logs</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign setup if no campaign */}
        {!currentCampaign ? (
          <CampaignSetup kolId={kol.id} workspaceId={kol.workspace_id} companies={companies || []} />
        ) : (
          <DeliverableProgress
            promised={deliverables}
            posts={posts || []}
            logs={manualLogs || []}
          />
        )}

        {/* Recent Posts */}
        <RecentPosts posts={(posts || []).slice(0, 10)} />

        {/* Manual Logs */}
        {currentCampaign && (
          <ManualLogSection
            kolId={kol.id}
            campaignId={currentCampaign.id}
            logs={manualLogs || []}
          />
        )}
      </div>
    </>
  )
}
