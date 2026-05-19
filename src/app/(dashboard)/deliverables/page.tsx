import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeliverableProgress } from '@/components/deliverables/deliverable-progress'
import { getCompletionPct, monthName } from '@/lib/utils'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DeliverablesPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', session.user.id)
    .single()

  if (!memberRow) redirect('/onboarding')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, kol:kols(*), deliverables(*)')
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

  return (
    <>
      <Header title="Deliverables" subtitle="All promised deliverables across campaigns" />
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {!campaigns || campaigns.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No deliverables defined. Create a campaign for a KOL first.</p>
          </div>
        ) : (
          campaigns.map(c => {
            const deliverables = c.deliverables?.[0] || null
            const posts = allPosts?.filter(p => p.campaign_id === c.id) || []
            const logs = allLogs?.filter(l => l.campaign_id === c.id) || []
            const pct = getCompletionPct(deliverables, posts, logs)
            return (
              <div key={c.id}>
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/kols/${c.kol_id}`} className="text-sm font-medium text-slate-700 hover:text-slate-900">
                    {(c.kol as any)?.name} — {monthName(c.month)} {c.year} ({pct}%)
                  </Link>
                </div>
                <DeliverableProgress promised={deliverables} posts={posts} logs={logs} />
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
