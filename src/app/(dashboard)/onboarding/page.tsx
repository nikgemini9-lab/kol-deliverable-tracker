'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    workspaceName: '',
    companyName: '',
    companyHandle: '',
    keywords: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setLoading(false)
      toast({ title: 'Setup failed', description: data.error, variant: 'error' })
      return
    }

    setLoading(false)
    toast({ title: 'Setup complete! Welcome aboard 🎉', variant: 'success' })
    router.push('/dashboard')
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
