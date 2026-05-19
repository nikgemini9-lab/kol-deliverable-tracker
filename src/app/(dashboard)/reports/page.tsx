import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { ReportView } from '@/components/reports/report-view'
import { redirect } from 'next/navigation'

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string; kolId?: string }
}) {
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
  const now = new Date()
  const month = parseInt(searchParams.month || String(now.getMonth() + 1))
  const year = parseInt(searchParams.year || String(now.getFullYear()))

  const { data: kols } = await supabase
    .from('kols')
    .select('*')
    .eq('workspace_id', workspaceId)

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, kol:kols(*), company:companies(*), deliverables(*)')
    .eq('workspace_id', workspaceId)
    .eq('month', month)
    .eq('year', year)

  const campaignIds = campaigns?.map(c => c.id) || []

  const { data: posts } = await supabase
    .from('tracked_posts')
    .select('*, kol:kols(id, name, x_handle)')
    .in('campaign_id', campaignIds)

  const { data: logs } = await supabase
    .from('manual_logs')
    .select('*')
    .in('campaign_id', campaignIds)

  return (
    <>
      <Header title="Reports" subtitle="Monthly delivery reports" />
      <div className="flex-1 p-6 overflow-y-auto">
        <ReportView
          kols={kols || []}
          campaigns={campaigns || []}
          posts={posts || []}
          logs={logs || []}
          month={month}
          year={year}
          selectedKolId={searchParams.kolId}
          workspaceId={workspaceId}
        />
      </div>
    </>
  )
}
