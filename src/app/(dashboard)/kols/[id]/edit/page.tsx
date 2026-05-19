import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { KolForm } from '@/components/kols/kol-form'
import { redirect, notFound } from 'next/navigation'

export default async function EditKolPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: kol } = await supabase.from('kols').select('*').eq('id', params.id).single()
  if (!kol) notFound()

  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', session.user.id)
    .single()

  return (
    <>
      <Header title="Edit KOL" subtitle={kol.name} />
      <div className="flex-1 p-6 max-w-2xl">
        <KolForm workspaceId={memberRow?.workspace_id || kol.workspace_id} kol={kol} />
      </div>
    </>
  )
}
