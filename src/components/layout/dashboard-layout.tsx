import { createClient } from '@/lib/supabase/server'
import { Sidebar } from './sidebar'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar userEmail={user?.email ?? null} userName={user?.user_metadata?.full_name ?? null} />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {children}
      </main>
    </div>
  )
}
