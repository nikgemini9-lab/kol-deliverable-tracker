export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  created_at: string
}

export interface Company {
  id: string
  workspace_id: string
  name: string
  x_handle: string | null
  keywords: string[]
  website: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface KOL {
  id: string
  workspace_id: string
  name: string
  x_handle: string
  profile_link: string | null
  monthly_fee: number
  campaign_start: string | null
  campaign_end: string | null
  notes: string | null
  status: 'active' | 'paused' | 'completed'
  avatar_url: string | null
  follower_count: number | null
  created_at: string
  updated_at: string
}

export interface Campaign {
  id: string
  workspace_id: string
  kol_id: string
  company_id: string
  month: number
  year: number
  status: 'active' | 'completed' | 'overdue' | 'at_risk'
  payout_recommendation: 'pay' | 'hold' | 'review'
  created_at: string
  updated_at: string
  kol?: KOL
  company?: Company
  deliverables?: Deliverables
}

export interface Deliverables {
  id: string
  campaign_id: string
  original_tweets: number
  company_mentions: number
  handle_tags: number
  quote_tweets: number
  replies_interactions: number
  newsletter_mention: boolean
  space_participation: boolean
  custom_deliverables: CustomDeliverable[]
  created_at: string
  updated_at: string
}

export interface CustomDeliverable {
  id: string
  name: string
  promised: number
  completed: number
  notes?: string
}

export interface TrackedPost {
  id: string
  campaign_id: string
  kol_id: string
  tweet_id: string
  tweet_url: string | null
  tweet_text: string | null
  tweet_type: 'original' | 'mention' | 'handle_tag' | 'reply' | 'quote_tweet' | 'mixed'
  likes: number
  replies: number
  reposts: number
  views: number
  posted_at: string | null
  created_at: string
}

export interface ManualLog {
  id: string
  campaign_id: string
  kol_id: string
  deliverable_type: string
  date: string | null
  link: string | null
  notes: string | null
  likes: number
  replies: number
  reposts: number
  views: number
  proof_link: string | null
  created_at: string
}

export interface SyncLog {
  id: string
  workspace_id: string
  kol_id: string
  status: 'success' | 'failed' | 'partial'
  tweets_fetched: number
  tweets_matched: number
  error_message: string | null
  synced_at: string
}

export type KolStatus = 'on_track' | 'at_risk' | 'completed' | 'overdue'
export type PayoutRecommendation = 'pay' | 'hold' | 'review'
export type TweetType = 'original' | 'mention' | 'handle_tag' | 'reply' | 'quote_tweet' | 'mixed'

export interface DeliverableProgress {
  type: string
  label: string
  promised: number
  completed: number
  percentage: number
}

export interface CampaignWithProgress {
  campaign: Campaign
  kol: KOL
  company: Company
  deliverables: Deliverables | null
  trackedCount: {
    original: number
    mention: number
    handle_tag: number
    reply: number
    quote_tweet: number
  }
  completionPercentage: number
  status: KolStatus
  payoutRecommendation: PayoutRecommendation
}

export interface DashboardStats {
  totalKols: number
  activeCampaigns: number
  completedPercentage: number
  totalViews: number
}
