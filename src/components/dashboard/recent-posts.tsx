import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrackedPost, KOL } from '@/lib/types'
import { formatNumber, formatDate } from '@/lib/utils'
import { ExternalLink, Heart, Repeat2, MessageCircle, Eye } from 'lucide-react'

interface RecentPostsProps {
  posts: (TrackedPost & { kol?: KOL })[]
}

const TYPE_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' | 'outline' }> = {
  original: { label: 'Original', variant: 'secondary' },
  mention: { label: 'Mention', variant: 'success' },
  handle_tag: { label: 'Tag', variant: 'warning' },
  reply: { label: 'Reply', variant: 'outline' },
  quote_tweet: { label: 'Quote', variant: 'default' },
  mixed: { label: 'Mixed', variant: 'secondary' },
}

export function RecentPosts({ posts }: RecentPostsProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Recent Tracked Posts</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400 text-sm">
            No posts tracked yet. Sync a KOL to get started.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader><CardTitle>Recent Tracked Posts</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map(post => {
            const typeInfo = TYPE_LABELS[post.tweet_type] || TYPE_LABELS.original
            return (
              <div key={post.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">
                      @{post.kol?.x_handle || '—'}
                    </span>
                    <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                  </div>
                  {post.tweet_url && (
                    <a
                      href={post.tweet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {post.tweet_text && (
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{post.tweet_text}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(post.views)}</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{formatNumber(post.likes)}</span>
                  <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{formatNumber(post.reposts)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{formatNumber(post.replies)}</span>
                  {post.posted_at && <span className="ml-auto">{formatDate(post.posted_at)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
