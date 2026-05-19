import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const kolId = searchParams.get('kolId')

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', session.user.id)
    .single()

  if (!memberRow) return NextResponse.json({ error: 'No workspace' }, { status: 404 })

  let campaignQuery = supabase
    .from('campaigns')
    .select('*, kol:kols(*), company:companies(*), deliverables(*)')
    .eq('workspace_id', memberRow.workspace_id)
    .eq('month', month)
    .eq('year', year)

  if (kolId) campaignQuery = campaignQuery.eq('kol_id', kolId)

  const { data: campaigns, error: campErr } = await campaignQuery
  if (campErr) return NextResponse.json({ error: campErr.message }, { status: 500 })

  const campaignIds = (campaigns || []).map(c => c.id)

  const [postsResult, logsResult] = await Promise.all([
    campaignIds.length > 0
      ? supabase.from('tracked_posts').select('*').in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
    campaignIds.length > 0
      ? supabase.from('manual_logs').select('*').in('campaign_id', campaignIds)
      : Promise.resolve({ data: [] }),
  ])

  return NextResponse.json({
    campaigns: campaigns || [],
    posts: postsResult.data || [],
    logs: logsResult.data || [],
    month,
    year,
  })
}
