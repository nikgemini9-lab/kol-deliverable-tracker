import { createClient } from '@supabase/supabase-js'

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getWorkspaceForUser(userId: string) {
  const { data } = await serviceClient
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name)')
    .eq('user_id', userId)
    .single()
  return data
}
