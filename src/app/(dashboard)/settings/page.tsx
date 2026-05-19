import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { SettingsView } from '@/components/settings/settings-view'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, slug)')
    .eq('user_id', session.user.id)
    .single()

  if (!memberRow) redirect('/onboarding')

  const workspaceId = memberRow.workspace_id

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('workspace_id', workspaceId)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 p-6 overflow-y-auto">
        <SettingsView
          workspace={memberRow.workspaces as any}
          workspaceId={workspaceId}
          companies={companies || []}
          profile={profile}
        />
      </div>
    </>
  )
}
