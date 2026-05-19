import type { TweetType } from '../types'

interface ClassifyOptions {
  companyHandle: string | null
  companyName: string
  keywords: string[]
  authorHandle: string
}

export function classifyTweet(tweet: any, opts: ClassifyOptions): TweetType {
  const text = (tweet.fullText || '').toLowerCase()
  const handle = opts.companyHandle?.replace('@', '').toLowerCase() || ''
  const mentions: string[] = tweet.entities?.userMentions?.map((m: any) => m.screenName?.toLowerCase() || '') || []

  const isReply = !!tweet.replyTo
  const isQuoteTweet = !!tweet.quoted
  const mentionsHandle = handle && (text.includes(`@${handle}`) || mentions.includes(handle))
  const mentionsName = opts.companyName ? text.includes(opts.companyName.toLowerCase()) : false
  const mentionsKeyword = opts.keywords.some(k => k && text.includes(k.toLowerCase()))

  if (isReply && mentionsHandle) return 'reply'
  if (isReply) return 'reply'
  if (isQuoteTweet && (mentionsHandle || mentionsName || mentionsKeyword)) return 'quote_tweet'
  if (isQuoteTweet) return 'quote_tweet'
  if (mentionsHandle) return 'handle_tag'
  if (mentionsName || mentionsKeyword) return 'mention'
  return 'original'
}

export function isRelevantTweet(tweet: any, opts: ClassifyOptions): boolean {
  const text = (tweet.fullText || '').toLowerCase()
  const handle = opts.companyHandle?.replace('@', '').toLowerCase() || ''
  const mentions: string[] = tweet.entities?.userMentions?.map((m: any) => m.screenName?.toLowerCase() || '') || []

  if (handle && (text.includes(`@${handle}`) || mentions.includes(handle))) return true
  if (opts.companyName && text.includes(opts.companyName.toLowerCase())) return true
  if (opts.keywords.some(k => k && text.includes(k.toLowerCase()))) return true
  return false
}

export function extractTweetUrl(tweet: any, handle: string): string {
  return tweet.url || `https://x.com/${handle}/status/${tweet.id}`
}
