import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { TopKols } from '@/components/dashboard/top-kols'
import { RecentPosts } from '@/components/dashboard/recent-posts'
import { getCompletionPct, getPayoutRecommendation, getKolStatus } from '@/lib/utils'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  // Get workspace
  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name)')
    .eq('user_id', session.user.id)
    .single()

  if (!memberRow) {
    redirect('/onboarding')
  }

  const workspaceId = memberRow.workspace_id

  // Fetch data
  const [kolsRes, campaignsRes, postsRes] = await Promise.all([
    supabase.from('kols').select('*').eq('workspace_id', workspaceId),
    supabase.from('campaigns').select('*, kol:kols(*), company:companies(*), deliverables(*)').eq('workspace_id', workspaceId),
    supabase.from('tracked_posts').select('*, kol:kols(id, name, x_handle)').in(
      'campaign_id',
      (await supabase.from('campaigns').select('id').eq('workspace_id', workspaceId)).data?.map(c => c.id) || []
    ),
  ])

  const kols = kolsRes.data || []
  const campaigns = campaignsRes.data || []
  const allPosts = postsRes.data || []

  // Compute stats
  let totalPromised = 0
  let totalCompleted = 0
  let totalOverdue = 0

  const kolStats = kols.map(kol => {
    const kolCampaigns = campaigns.filter(c => c.kol_id === kol.id)
    const kolPosts = allPosts.filter(p => p.kol_id === kol.id)
    const deliverables = kolCampaigns[0]?.deliverables?.[0] || null

    const { data: logsData } = { data: [] as any[] }
    const pct = getCompletionPct(deliverables, kolPosts, logsData)
    const payout = getPayoutRecommendation(pct)

    const campaign = kolCampaigns[0]
    const status = campaign ? getKolStatus(campaign, pct) : 'on_track'

    return { ...kol, completionPct: pct, payout, status_label: status }
  })

  // Overall stats
  campaigns.forEach(campaign => {
    const d = campaign.deliverables?.[0]
    if (d) {
      totalPromised += d.original_tweets + d.company_mentions + d.handle_tags + d.quote_tweets + d.replies_interactions
    }
    const posts = allPosts.filter(p => p.campaign_id === campaign.id)
    totalCompleted += posts.length
  })

  const overdueCampaigns = campaigns.filter(c => c.status === 'overdue')
  const activeCampaigns = campaigns.filter(c => c.status === 'active' || c.status === 'at_risk')

  const engagementTotals = allPosts.reduce(
    (acc, p) => ({
      views: acc.views + (p.views || 0),
      likes: acc.likes + (p.likes || 0),
      reposts: acc.reposts + (p.reposts || 0),
      replies: acc.replies + (p.replies || 0),
    }),
    { views: 0, likes: 0, reposts: 0, replies: 0 }
  )

  const completionPct = totalPromised > 0 ? Math.round((totalCompleted / totalPromised) * 100) : 0

  const stats = {
    totalKols: kols.length,
    activeCampaigns: activeCampaigns.length,
    totalPromised,
    totalCompleted,
    totalPending: Math.max(0, totalPromised - totalCompleted),
    totalOverdue: overdueCampaigns.length,
    completionPct,
    totalViews: engagementTotals.views,
    totalLikes: engagementTotals.likes,
    totalReposts: engagementTotals.reposts,
    totalReplies: engagementTotals.replies,
  }

  const topKols = kolStats.sort((a, b) => b.completionPct - a.completionPct).slice(0, 5)
  const atRiskKols = kolStats.filter(k => k.status_label === 'at_risk' || k.status_label === 'overdue').slice(0, 5)
  const recentPosts = allPosts.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5)

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your KOL campaigns" />
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <StatsCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TopKols kols={topKols} />
          <TopKols kols={atRiskKols} title="KOLs at Risk" atRisk />
        </div>

        <RecentPosts posts={recentPosts} />
      </div>
    </>
  )
}
