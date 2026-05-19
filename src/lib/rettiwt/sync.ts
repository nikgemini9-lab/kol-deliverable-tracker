import { createClient } from '@supabase/supabase-js'
import { classifyTweet, isRelevantTweet, extractTweetUrl } from './classifier'

interface SyncOptions {
  kolId: string
  workspaceId: string
  campaignId: string
  kolHandle: string
  companyHandle: string | null
  companyName: string
  keywords: string[]
  month: number
  year: number
}

interface SyncResult {
  success: boolean
  tweetsFound: number
  tweetsStored: number
  error?: string
}

export async function syncKolTweets(opts: SyncOptions): Promise<SyncResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { getRettiwtClient } = await import('./client')
    const rettiwt = getRettiwtClient()

    const startDate = new Date(opts.year, opts.month - 1, 1)
    const endDate = new Date(opts.year, opts.month, 0)

    // Fetch tweets from this KOL for the campaign month
    const result = await rettiwt.tweet.search(
      {
        fromUsers: [opts.kolHandle.replace('@', '')],
        startDate,
        endDate,
      },
      100
    )

    const allTweets = result?.list || []

    if (allTweets.length === 0) {
      return { success: true, tweetsFound: 0, tweetsStored: 0 }
    }

    // Fetch existing tweet IDs to avoid duplicates
    const { data: existing } = await supabase
      .from('tracked_posts')
      .select('tweet_id')
      .eq('campaign_id', opts.campaignId)

    const existingIds = new Set((existing || []).map((r: any) => r.tweet_id))

    const toInsert = []

    for (const tweet of allTweets) {
      if (existingIds.has(tweet.id)) continue

      const tweetType = classifyTweet(tweet, {
        companyHandle: opts.companyHandle,
        companyName: opts.companyName,
        keywords: opts.keywords,
        authorHandle: opts.kolHandle,
      })

      // Track all tweets from the KOL (originals for that deliverable, + relevant ones)
      toInsert.push({
        campaign_id: opts.campaignId,
        kol_id: opts.kolId,
        tweet_id: tweet.id,
        tweet_url: extractTweetUrl(tweet, opts.kolHandle.replace('@', '')),
        tweet_text: tweet.fullText || null,
        tweet_type: tweetType,
        likes: tweet.likeCount || 0,
        replies: tweet.replyCount || 0,
        reposts: tweet.retweetCount || 0,
        views: tweet.viewCount || 0,
        posted_at: tweet.createdAt || null,
      })
    }

    if (toInsert.length > 0) {
      const { error } = await supabase.from('tracked_posts').insert(toInsert)
      if (error) throw error
    }

    await supabase.from('sync_logs').insert({
      workspace_id: opts.workspaceId,
      kol_id: opts.kolId,
      status: 'success',
      tweets_fetched: allTweets.length,
      tweets_matched: toInsert.length,
    })

    return {
      success: true,
      tweetsFound: allTweets.length,
      tweetsStored: toInsert.length,
    }
  } catch (err: any) {
    await supabase.from('sync_logs').insert({
      workspace_id: opts.workspaceId,
      kol_id: opts.kolId,
      status: 'failed',
      tweets_fetched: 0,
      tweets_matched: 0,
      error_message: err?.message || 'Unknown error',
    })

    return {
      success: false,
      tweetsFound: 0,
      tweetsStored: 0,
      error: err?.message || 'Unknown error',
    }
  }
}
