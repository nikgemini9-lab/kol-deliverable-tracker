'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { slugify } from '@/lib/utils'
import { Building2, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    workspaceName: '',
    companyName: '',
    companyHandle: '',
    keywords: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Check if workspace already exists
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single()

    let workspaceId = existing?.workspace_id

    if (!workspaceId && form.workspaceName) {
      const slug = slugify(form.workspaceName) + '-' + Math.random().toString(36).slice(2, 6)
      const { data: ws } = await supabase.from('workspaces').insert({
        name: form.workspaceName,
        slug,
        owner_id: user.id,
      }).select().single()

      if (ws) {
        workspaceId = ws.id
        await supabase.from('workspace_members').insert({
          workspace_id: ws.id,
          user_id: user.id,
          role: 'owner',
        })
      }
    }

    if (workspaceId && form.companyName) {
      const keywords = form.keywords.split(',').map(k => k.trim()).filter(Boolean)
      await supabase.from('companies').insert({
        workspace_id: workspaceId,
        name: form.companyName,
        x_handle: form.companyHandle.replace('@', '') || null,
        keywords,
      })
    }

    setLoading(false)
    toast({ title: 'Setup complete! Welcome aboard 🎉', variant: 'success' })
    router.push('/kols')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Let&apos;s get you set up</h1>
          <p className="text-sm text-slate-500 mt-2">This takes about 2 minutes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Workspace</p>
              <div className="space-y-1.5">
                <Label htmlFor="workspaceName">Workspace Name</Label>
                <Input
                  id="workspaceName"
                  placeholder="My Company KOL Tracker"
                  value={form.workspaceName}
                  onChange={e => setForm(p => ({ ...p, workspaceName: e.target.value }))}
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
                Company / Brand to Track
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corp"
                    value={form.companyName}
                    onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="companyHandle">X/Twitter Handle</Label>
                  <Input
                    id="companyHandle"
                    placeholder="@acmecorp"
                    value={form.companyHandle}
                    onChange={e => setForm(p => ({ ...p, companyHandle: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="keywords">
                    Tracking Keywords
                    <span className="text-xs font-normal text-slate-400 ml-1">(comma separated)</span>
                  </Label>
                  <Input
                    id="keywords"
                    placeholder="acme, acme protocol, $ACME"
                    value={form.keywords}
                    onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
                  />
                  <p className="text-xs text-slate-400">
                    These keywords will be used to detect company mentions in KOL posts.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading || !form.companyName}>
              {loading ? 'Setting up...' : 'Complete setup'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          You can change all of this later in Settings.
        </p>
      </div>
    </div>
  )
}
