import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Deliverables, TrackedPost, ManualLog } from '@/lib/types'
import { CheckCircle2, XCircle, Minus } from 'lucide-react'

interface DeliverableProgressProps {
  promised: Deliverables | null
  posts: TrackedPost[]
  logs: ManualLog[]
}

export function DeliverableProgress({ promised, posts, logs }: DeliverableProgressProps) {
  if (!promised) {
    return (
      <Card>
        <CardHeader><CardTitle>Deliverables</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-4">No deliverables defined yet.</p>
        </CardContent>
      </Card>
    )
  }

  const origCompleted = posts.filter(p => p.tweet_type === 'original').length
  const mentionCompleted = posts.filter(p => p.tweet_type === 'mention' || p.tweet_type === 'mixed').length
  const tagCompleted = posts.filter(p => p.tweet_type === 'handle_tag').length
  const qtCompleted = posts.filter(p => p.tweet_type === 'quote_tweet').length
  const replyCompleted = posts.filter(p => p.tweet_type === 'reply').length
  const newsletterDone = logs.some(l => l.deliverable_type === 'newsletter_mention')
  const spaceDone = logs.some(l => l.deliverable_type === 'space_participation')

  const rows = [
    { label: 'Original Tweets', promised: promised.original_tweets, completed: origCompleted },
    { label: 'Company Mentions', promised: promised.company_mentions, completed: mentionCompleted },
    { label: 'Handle Tags', promised: promised.handle_tags, completed: tagCompleted },
    { label: 'Quote Tweets', promised: promised.quote_tweets, completed: qtCompleted },
    { label: 'Replies/Interactions', promised: promised.replies_interactions, completed: replyCompleted },
  ]

  const boolRows = [
    { label: 'Newsletter Mention', promised: promised.newsletter_mention, completed: newsletterDone },
    { label: 'Space Participation', promised: promised.space_participation, completed: spaceDone },
  ]

  return (
    <Card>
      <CardHeader><CardTitle>Deliverable Progress</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rows.filter(r => r.promised > 0).map(row => {
            const pct = row.promised > 0 ? Math.min(100, Math.round((row.completed / row.promised) * 100)) : 0
            return (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-700">{row.label}</span>
                  <span className="text-xs text-slate-500">
                    {row.completed}/{row.promised}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
            )
          })}

          {boolRows.filter(r => r.promised).map(row => (
            <div key={row.label} className="flex items-center justify-between py-1">
              <span className="text-sm text-slate-700">{row.label}</span>
              {row.completed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 text-slate-300" />
              )}
            </div>
          ))}

          {promised.custom_deliverables?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Custom</p>
              {promised.custom_deliverables.map((cd) => {
                const pct = cd.promised > 0 ? Math.min(100, Math.round((cd.completed / cd.promised) * 100)) : 0
                return (
                  <div key={cd.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700">{cd.name}</span>
                      <span className="text-xs text-slate-500">{cd.completed}/{cd.promised}</span>
                    </div>
                    <Progress value={pct} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
