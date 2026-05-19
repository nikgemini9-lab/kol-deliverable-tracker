'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { KOL } from '@/lib/types'

export function useKols(workspaceId: string | null) {
  const [kols, setKols] = useState<KOL[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKols = useCallback(async () => {
    if (!workspaceId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('kols')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setKols(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KOLs')
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    fetchKols()
  }, [fetchKols])

  return { kols, loading, error, refetch: fetchKols }
}
