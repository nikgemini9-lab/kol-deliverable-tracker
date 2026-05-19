import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { KolStatus, PayoutRecommendation, Campaign, Deliverables, TrackedPost, ManualLog } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCompletionPct(
  promised: Deliverables | null,
  posts: TrackedPost[],
  logs: ManualLog[]
): number {
  if (!promised) return 0

  let totalPromised = 0
  let totalCompleted = 0

  const origPromised = promised.original_tweets
  const origCompleted = posts.filter(p => p.tweet_type === 'original').length
  totalPromised += origPromised
  totalCompleted += Math.min(origCompleted, origPromised)

  const mentionPromised = promised.company_mentions
  const mentionCompleted = posts.filter(p =>
    p.tweet_type === 'mention' || p.tweet_type === 'mixed'
  ).length
  totalPromised += mentionPromised
  totalCompleted += Math.min(mentionCompleted, mentionPromised)

  const tagPromised = promised.handle_tags
  const tagCompleted = posts.filter(p => p.tweet_type === 'handle_tag').length
  totalPromised += tagPromised
  totalCompleted += Math.min(tagCompleted, tagPromised)

  const qtPromised = promised.quote_tweets
  const qtCompleted = posts.filter(p => p.tweet_type === 'quote_tweet').length
  totalPromised += qtPromised
  totalCompleted += Math.min(qtCompleted, qtPromised)

  const repliesPromised = promised.replies_interactions
  const repliesCompleted = posts.filter(p => p.tweet_type === 'reply').length
  totalPromised += repliesPromised
  totalCompleted += Math.min(repliesCompleted, repliesPromised)

  if (promised.newsletter_mention) {
    totalPromised += 1
    const nlDone = logs.some(l => l.deliverable_type === 'newsletter_mention')
    if (nlDone) totalCompleted += 1
  }

  if (promised.space_participation) {
    totalPromised += 1
    const spaceDone = logs.some(l => l.deliverable_type === 'space_participation')
    if (spaceDone) totalCompleted += 1
  }

  if (totalPromised === 0) return 100
  return Math.round((totalCompleted / totalPromised) * 100)
}

export function getKolStatus(
  campaign: Campaign,
  completionPct: number
): KolStatus {
  const now = new Date()
  const campaignEnd = campaign.kol?.campaign_end
    ? new Date(campaign.kol.campaign_end)
    : null

  if (completionPct >= 100) return 'completed'

  if (campaignEnd && now > campaignEnd && completionPct < 100) {
    return 'overdue'
  }

  if (campaignEnd) {
    const daysLeft = Math.floor((campaignEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 7 && completionPct < 70) return 'at_risk'
    if (daysLeft <= 14 && completionPct < 50) return 'at_risk'
  }

  return 'on_track'
}

export function getPayoutRecommendation(completionPct: number): PayoutRecommendation {
  if (completionPct >= 90) return 'pay'
  if (completionPct >= 50) return 'review'
  return 'hold'
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function monthName(month: number): string {
  return new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const STATUS_COLORS: Record<string, string> = {
  on_track: 'bg-emerald-100 text-emerald-700',
  at_risk: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-gray-100 text-gray-600',
}

export const PAYOUT_COLORS: Record<string, string> = {
  pay: 'bg-emerald-100 text-emerald-700',
  review: 'bg-amber-100 text-amber-700',
  hold: 'bg-red-100 text-red-700',
}
