'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Radio } from 'lucide-react'
import { slugify } from '@/lib/utils'

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    workspaceName: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      toast({ title: 'Password must be at least 8 characters', variant: 'error' })
      return
    }
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
      },
    })

    if (error || !data.user) {
      setLoading(false)
      toast({ title: 'Signup failed', description: error?.message, variant: 'error' })
      return
    }

    // Create workspace
    if (form.workspaceName) {
      const slug = slugify(form.workspaceName) + '-' + Math.random().toString(36).slice(2, 6)
      const { data: ws } = await supabase.from('workspaces').insert({
        name: form.workspaceName,
        slug,
        owner_id: data.user.id,
      }).select().single()

      if (ws) {
        await supabase.from('workspace_members').insert({
          workspace_id: ws.id,
          user_id: data.user.id,
          role: 'owner',
        })
      }
    }

    setLoading(false)
    toast({ title: 'Account created!', variant: 'success' })
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 mb-4">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Start tracking KOL deliverables today</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Jane Smith"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workspaceName">Workspace / Company Name</Label>
              <Input
                id="workspaceName"
                placeholder="My Company"
                value={form.workspaceName}
                onChange={e => setForm(p => ({ ...p, workspaceName: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-slate-900 font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
          By signing up, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  )
}
