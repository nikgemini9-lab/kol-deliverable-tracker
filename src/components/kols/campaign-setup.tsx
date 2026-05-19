'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { Company } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Target } from 'lucide-react'

interface CampaignSetupProps {
  kolId: string
  workspaceId: string
  companies: Company[]
}

export function CampaignSetup({ kolId, workspaceId, companies }: CampaignSetupProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const now = new Date()

  const [form, setForm] = useState({
    companyId: companies[0]?.id || '',
    month: (now.getMonth() + 1).toString(),
    year: now.getFullYear().toString(),
    original_tweets: '4',
    company_mentions: '4',
    handle_tags: '2',
    quote_tweets: '1',
    replies_interactions: '2',
    newsletter_mention: false,
    space_participation: false,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.companyId) {
      toast({ title: 'Please select a company', variant: 'error' })
      return
    }
    setLoading(true)

    // Create campaign
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .insert({
        workspace_id: workspaceId,
        kol_id: kolId,
        company_id: form.companyId,
        month: parseInt(form.month),
        year: parseInt(form.year),
        status: 'active',
        payout_recommendation: 'review',
      })
      .select()
      .single()

    if (campErr || !campaign) {
      setLoading(false)
      toast({ title: 'Failed to create campaign', description: campErr?.message, variant: 'error' })
      return
    }

    // Create deliverables
    await supabase.from('deliverables').insert({
      campaign_id: campaign.id,
      original_tweets: parseInt(form.original_tweets) || 0,
      company_mentions: parseInt(form.company_mentions) || 0,
      handle_tags: parseInt(form.handle_tags) || 0,
      quote_tweets: parseInt(form.quote_tweets) || 0,
      replies_interactions: parseInt(form.replies_interactions) || 0,
      newsletter_mention: form.newsletter_mention,
      space_participation: form.space_participation,
      custom_deliverables: [],
    })

    setLoading(false)
    toast({ title: 'Campaign created!', variant: 'success' })
    router.refresh()
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700 mb-1">No companies set up</p>
          <p className="text-sm text-slate-500">Add a company in Settings before creating campaigns.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Set Up Campaign & Deliverables</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label>Company</Label>
              <select
                value={form.companyId}
                onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Month</Label>
              <select
                value={form.month}
                onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2024, i).toLocaleString('en-US', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} type="number" />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-700 pt-2">Promised Deliverables</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { id: 'original_tweets', label: 'Original Tweets' },
              { id: 'company_mentions', label: 'Mentions' },
              { id: 'handle_tags', label: 'Handle Tags' },
              { id: 'quote_tweets', label: 'Quote Tweets' },
              { id: 'replies_interactions', label: 'Replies' },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input
                  type="number"
                  min="0"
                  value={(form as any)[f.id]}
                  onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.newsletter_mention}
                onChange={e => setForm(p => ({ ...p, newsletter_mention: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300" />
              <span className="text-sm text-slate-700">Newsletter Mention</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.space_participation}
                onChange={e => setForm(p => ({ ...p, space_participation: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300" />
              <span className="text-sm text-slate-700">Space Participation</span>
            </label>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Campaign'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
