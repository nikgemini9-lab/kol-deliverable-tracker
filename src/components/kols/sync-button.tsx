'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'

interface SyncButtonProps {
  kolId: string
  campaignId: string
  lastSync?: string | null
}

export function SyncButton({ kolId, campaignId, lastSync }: SyncButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSync() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sync/kol/${kolId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Sync complete',
          description: `Found ${data.tweetsFound} tweets, stored ${data.tweetsStored} new.`,
          variant: 'success',
        })
        router.refresh()
      } else {
        toast({
          title: 'Sync failed',
          description: data.error || 'Unknown error',
          variant: 'error',
        })
      }
    } catch (err) {
      toast({ title: 'Sync failed', description: 'Network error', variant: 'error' })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" onClick={handleSync} disabled={loading} className="gap-2">
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Syncing...' : 'Sync Now'}
      </Button>
      {lastSync && (
        <span className="text-xs text-slate-400">Last sync: {formatDate(lastSync)}</span>
      )}
    </div>
  )
}
