import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncKolTweets } from '@/lib/rettiwt/sync'

export async function POST(
  req: NextRequest,
  { params }: { params: { kolId: string } }
) {
  try {
    const { campaignId } = await req.json()
    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch KOL
    const { data: kol, error: kolErr } = await supabase
      .from('kols')
      .select('*')
      .eq('id', params.kolId)
      .single()

    if (kolErr || !kol) {
      return NextResponse.json({ error: 'KOL not found' }, { status: 404 })
    }

    // Fetch campaign with company
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('*, company:companies(*)')
      .eq('id', campaignId)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    const company = campaign.company

    const result = await syncKolTweets({
      kolId: kol.id,
      workspaceId: kol.workspace_id,
      campaignId,
      kolHandle: kol.x_handle,
      companyHandle: company?.x_handle || null,
      companyName: company?.name || '',
      keywords: company?.keywords || [],
      month: campaign.month,
      year: campaign.year,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Sync error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
