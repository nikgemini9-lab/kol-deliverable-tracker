'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Company, Workspace, Profile } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Building2 } from 'lucide-react'

interface SettingsViewProps {
  workspace: Workspace | null
  workspaceId: string
  companies: Company[]
  profile: Profile | null
}

export function SettingsView({ workspace, workspaceId, companies, profile }: SettingsViewProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [companyForm, setCompanyForm] = useState({
    name: '',
    x_handle: '',
    keywords: '',
    website: '',
    notes: '',
  })

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault()
    if (!companyForm.name) return
    setLoading(true)
    const keywords = companyForm.keywords
      .split(',')
      .map(k => k.trim())
      .filter(Boolean)

    const { error } = await supabase.from('companies').insert({
      workspace_id: workspaceId,
      name: companyForm.name,
      x_handle: companyForm.x_handle.replace('@', '') || null,
      keywords,
      website: companyForm.website || null,
      notes: companyForm.notes || null,
    })

    setLoading(false)
    if (error) {
      toast({ title: 'Failed to add company', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Company added', variant: 'success' })
      setShowCompanyForm(false)
      setCompanyForm({ name: '', x_handle: '', keywords: '', website: '', notes: '' })
      router.refresh()
    }
  }

  async function deleteCompany(id: string) {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    if (error) {
      toast({ title: 'Failed to delete', description: error.message, variant: 'error' })
    } else {
      toast({ title: 'Company removed', variant: 'success' })
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Workspace info */}
      <Card>
        <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{workspace?.name || 'My Workspace'}</p>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Companies / Brands</CardTitle>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowCompanyForm(!showCompanyForm)}>
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCompanyForm && (
            <form onSubmit={saveCompany} className="border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="Acme Corp"
                    value={companyForm.name}
                    onChange={e => setCompanyForm(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>X/Twitter Handle</Label>
                  <Input
                    placeholder="@acmecorp"
                    value={companyForm.x_handle}
                    onChange={e => setCompanyForm(p => ({ ...p, x_handle: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Keywords (comma separated)</Label>
                  <Input
                    placeholder="acme, acme protocol, $ACME"
                    value={companyForm.keywords}
                    onChange={e => setCompanyForm(p => ({ ...p, keywords: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Website</Label>
                  <Input
                    placeholder="https://acme.com"
                    value={companyForm.website}
                    onChange={e => setCompanyForm(p => ({ ...p, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    value={companyForm.notes}
                    onChange={e => setCompanyForm(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading}>{loading ? 'Saving...' : 'Add Company'}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowCompanyForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          {companies.length === 0 && !showCompanyForm ? (
            <p className="text-sm text-slate-400 text-center py-4">No companies yet. Add one to get started.</p>
          ) : (
            <div className="space-y-2">
              {companies.map(company => (
                <div key={company.id} className="flex items-start justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{company.name}</p>
                    {company.x_handle && <p className="text-xs text-slate-500">@{company.x_handle}</p>}
                    {company.keywords?.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">Keywords: {company.keywords.join(', ')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteCompany(company.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors ml-3"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rettiwt info */}
      <Card>
        <CardHeader><CardTitle>Rettiwt / X Integration</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              KOL Tracker uses <strong>Rettiwt-API</strong> to fetch tweets from KOL handles and classify them.
            </p>
            <p>
              Set your <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">RETTIWT_API_KEY</code> environment variable to enable auto-sync.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mt-3 border border-slate-200">
              <p className="text-xs font-medium text-slate-700 mb-1">How to get your Rettiwt API key:</p>
              <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                <li>Log in to X/Twitter in your browser</li>
                <li>Open DevTools → Application → Cookies</li>
                <li>Find the <code>auth_token</code> cookie value</li>
                <li>Use that as your RETTIWT_API_KEY</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
