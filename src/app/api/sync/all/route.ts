import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncKolTweets } from '@/lib/rettiwt/sync'

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json()
    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*, kol:kols(*), company:companies(*)')
      .eq('workspace_id', workspaceId)
      .eq('month', month)
      .eq('year', year)
      .eq('status', 'active')

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ message: 'No active campaigns to sync', synced: 0 })
    }

    const results = await Promise.allSettled(
      campaigns.map(c =>
        syncKolTweets({
          kolId: c.kol_id,
          workspaceId,
          campaignId: c.id,
          kolHandle: (c.kol as any)?.x_handle || '',
          companyHandle: (c.company as any)?.x_handle || null,
          companyName: (c.company as any)?.name || '',
          keywords: (c.company as any)?.keywords || [],
          month,
          year,
        })
      )
    )

    const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length
    return NextResponse.json({ synced: succeeded, total: campaigns.length })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }
}
