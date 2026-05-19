'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import { Deliverables } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface DeliverableFormProps {
  campaignId: string
  existing?: Deliverables | null
  onSuccess?: () => void
}

export function DeliverableForm({ campaignId, existing, onSuccess }: DeliverableFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    original_tweets: existing?.original_tweets?.toString() || '0',
    company_mentions: existing?.company_mentions?.toString() || '0',
    handle_tags: existing?.handle_tags?.toString() || '0',
    quote_tweets: existing?.quote_tweets?.toString() || '0',
    replies_interactions: existing?.replies_interactions?.toString() || '0',
    newsletter_mention: existing?.newsletter_mention || false,
    space_participation: existing?.space_participation || false,
  })

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      campaign_id: campaignId,
      original_tweets: parseInt(form.original_tweets) || 0,
      company_mentions: parseInt(form.company_mentions) || 0,
      handle_tags: parseInt(form.handle_tags) || 0,
      quote_tweets: parseInt(form.quote_tweets) || 0,
      replies_interactions: parseInt(form.replies_interactions) || 0,
      newsletter_mention: form.newsletter_mention,
      space_participation: form.space_participation,
      custom_deliverables: existing?.custom_deliverables || [],
    }

    let error
    if (existing) {
      const result = await supabase.from('deliverables').update(payload).eq('id', existing.id)
      error = result.error
    } else {
      const result = await supabase.from('deliverables').insert(payload)
      error = result.error
    }

    setLoading(false)
    if (error) {
      toast({ title: 'Failed to save deliverables', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Deliverables saved', variant: 'success' })
      onSuccess?.()
      router.refresh()
    }
  }

  const fields = [
    { id: 'original_tweets', label: 'Original Tweets' },
    { id: 'company_mentions', label: 'Company Mentions' },
    { id: 'handle_tags', label: 'Handle Tags (@mention)' },
    { id: 'quote_tweets', label: 'Quote Tweets' },
    { id: 'replies_interactions', label: 'Replies / Interactions' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {fields.map(f => (
          <div key={f.id} className="space-y-1.5">
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              type="number"
              min="0"
              value={(form as any)[f.id]}
              onChange={e => update(f.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.newsletter_mention}
            onChange={e => update('newsletter_mention', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">Newsletter Mention</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.space_participation}
            onChange={e => update('space_participation', e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm text-slate-700">Space Participation</span>
        </label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Deliverables'}
      </Button>
    </form>
  )
}
