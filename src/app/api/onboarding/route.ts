import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { slugify } from '@/lib/utils'

export async function POST(req: Request) {
  const supabaseAuth = createServerClient()
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { workspaceName, companyName, companyHandle, keywords } = await req.json()

  if (!companyName) {
    return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
  }

  // Use service role key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = session.user.id

  // Ensure profile exists
  await supabase.from('profiles').upsert({
    id: userId,
    email: session.user.email ?? null,
    full_name: session.user.user_metadata?.full_name ?? null,
  }, { onConflict: 'id' })

  // Check if workspace already exists
  const { data: existing } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .single()

  let workspaceId = existing?.workspace_id

  if (!workspaceId) {
    const name = workspaceName || `${session.user.email?.split('@')[0]}'s Workspace`
    const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name, slug, owner_id: userId })
      .select()
      .single()

    if (wsError) {
      return NextResponse.json({ error: wsError.message }, { status: 500 })
    }

    workspaceId = ws.id

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: userId, role: 'owner' })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }
  }

  const kwArray = keywords ? keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : []

  const { error: companyError } = await supabase
    .from('companies')
    .insert({
      workspace_id: workspaceId,
      name: companyName,
      x_handle: companyHandle?.replace('@', '') || null,
      keywords: kwArray,
    })

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
