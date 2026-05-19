'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { KOL } from '@/lib/types'

interface KolFormProps {
  workspaceId: string
  kol?: KOL
  onSuccess?: () => void
}

export function KolForm({ workspaceId, kol, onSuccess }: KolFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: kol?.name || '',
    x_handle: kol?.x_handle || '',
    profile_link: kol?.profile_link || '',
    monthly_fee: kol?.monthly_fee?.toString() || '0',
    campaign_start: kol?.campaign_start || '',
    campaign_end: kol?.campaign_end || '',
    notes: kol?.notes || '',
    status: kol?.status || 'active',
    follower_count: kol?.follower_count?.toString() || '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.x_handle) {
      toast({ title: 'Name and X handle are required', variant: 'error' })
      return
    }
    setLoading(true)

    const payload = {
      workspace_id: workspaceId,
      name: form.name,
      x_handle: form.x_handle.replace('@', ''),
      profile_link: form.profile_link || null,
      monthly_fee: parseFloat(form.monthly_fee) || 0,
      campaign_start: form.campaign_start || null,
      campaign_end: form.campaign_end || null,
      notes: form.notes || null,
      status: form.status as 'active' | 'paused' | 'completed',
      follower_count: form.follower_count ? parseInt(form.follower_count) : null,
    }

    let error
    if (kol) {
      const result = await supabase.from('kols').update(payload).eq('id', kol.id)
      error = result.error
    } else {
      const result = await supabase.from('kols').insert(payload)
      error = result.error
    }

    setLoading(false)
    if (error) {
      toast({ title: 'Failed to save KOL', description: error.message, variant: 'error' })
    } else {
      toast({ title: kol ? 'KOL updated' : 'KOL added', variant: 'success' })
      onSuccess?.()
      router.refresh()
      if (!kol) router.push('/kols')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={form.name}
            onChange={e => update('name', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="x_handle">X/Twitter Handle *</Label>
          <Input
            id="x_handle"
            placeholder="@johndoe"
            value={form.x_handle}
            onChange={e => update('x_handle', e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile_link">Profile Link</Label>
          <Input
            id="profile_link"
            placeholder="https://x.com/johndoe"
            value={form.profile_link}
            onChange={e => update('profile_link', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthly_fee">Monthly Fee (USD)</Label>
          <Input
            id="monthly_fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.monthly_fee}
            onChange={e => update('monthly_fee', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="campaign_start">Campaign Start</Label>
          <Input
            id="campaign_start"
            type="date"
            value={form.campaign_start}
            onChange={e => update('campaign_start', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="campaign_end">Campaign End</Label>
          <Input
            id="campaign_end"
            type="date"
            value={form.campaign_end}
            onChange={e => update('campaign_end', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="follower_count">Follower Count</Label>
          <Input
            id="follower_count"
            type="number"
            min="0"
            placeholder="10000"
            value={form.follower_count}
            onChange={e => update('follower_count', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={e => update('status', e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any notes about this KOL..."
          value={form.notes}
          onChange={e => update('notes', e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : kol ? 'Update KOL' : 'Add KOL'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
