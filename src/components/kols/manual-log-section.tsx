'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { ManualLog } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Plus, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ManualLogSectionProps {
  kolId: string
  campaignId: string
  logs: ManualLog[]
}

const DELIVERABLE_TYPES = [
  { value: 'newsletter_mention', label: 'Newsletter Mention' },
  { value: 'space_participation', label: 'Space Participation' },
  { value: 'original_tweet', label: 'Original Tweet' },
  { value: 'company_mention', label: 'Company Mention' },
  { value: 'handle_tag', label: 'Handle Tag' },
  { value: 'quote_tweet', label: 'Quote Tweet' },
  { value: 'reply', label: 'Reply/Interaction' },
  { value: 'other', label: 'Other' },
]

export function ManualLogSection({ kolId, campaignId, logs }: ManualLogSectionProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    deliverable_type: 'newsletter_mention',
    date: '',
    link: '',
    notes: '',
    likes: '0',
    replies: '0',
    reposts: '0',
    views: '0',
    proof_link: '',
  })

  function update(field: string, val: string) {
    setForm(p => ({ ...p, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('manual_logs').insert({
      kol_id: kolId,
      campaign_id: campaignId,
      deliverable_type: form.deliverable_type,
      date: form.date || null,
      link: form.link || null,
      notes: form.notes || null,
      likes: parseInt(form.likes) || 0,
      replies: parseInt(form.replies) || 0,
      reposts: parseInt(form.reposts) || 0,
      views: parseInt(form.views) || 0,
      proof_link: form.proof_link || null,
    })
    setLoading(false)
    if (error) {
      toast({ title: 'Failed to add log', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Manual log added', variant: 'success' })
      setShowForm(false)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manual Logs</CardTitle>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Add Log
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={handleSubmit} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Deliverable Type</Label>
                <select
                  value={form.deliverable_type}
                  onChange={e => update('deliverable_type', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm"
                >
                  {DELIVERABLE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={e => update('date', e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Link</Label>
                <Input placeholder="https://" value={form.link} onChange={e => update('link', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Views</Label>
                <Input type="number" min="0" value={form.views} onChange={e => update('views', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Likes</Label>
                <Input type="number" min="0" value={form.likes} onChange={e => update('likes', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Reposts</Label>
                <Input type="number" min="0" value={form.reposts} onChange={e => update('reposts', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Replies</Label>
                <Input type="number" min="0" value={form.replies} onChange={e => update('replies', e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Proof Link (screenshot, etc.)</Label>
                <Input placeholder="https://" value={form.proof_link} onChange={e => update('proof_link', e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Save Log'}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {logs.length === 0 && !showForm ? (
          <p className="text-sm text-slate-400 text-center py-4">No manual logs yet. Add one for newsletter mentions, spaces, etc.</p>
        ) : (
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.id} className="flex items-start justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-700">
                      {DELIVERABLE_TYPES.find(t => t.value === log.deliverable_type)?.label || log.deliverable_type}
                    </span>
                    {log.date && <span className="text-xs text-slate-400">{formatDate(log.date)}</span>}
                  </div>
                  {log.notes && <p className="text-xs text-slate-500">{log.notes}</p>}
                  <div className="flex gap-3 mt-1 text-xs text-slate-400">
                    {log.views > 0 && <span>{log.views.toLocaleString()} views</span>}
                    {log.likes > 0 && <span>{log.likes} likes</span>}
                  </div>
                </div>
                {log.link && (
                  <a href={log.link} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 ml-2">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
