import { getWorkspaceForUser } from '@/lib/supabase/workspace'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { KolForm } from '@/components/kols/kol-form'
import { redirect } from 'next/navigation'

export default async function NewKolPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const memberRow = await getWorkspaceForUser(session.user.id)

  if (!memberRow) redirect('/onboarding')

  return (
    <>
      <Header title="Add KOL" subtitle="Add a new influencer to track" />
      <div className="flex-1 p-6 max-w-2xl">
        <KolForm workspaceId={memberRow.workspace_id} />
      </div>
    </>
  )
}
