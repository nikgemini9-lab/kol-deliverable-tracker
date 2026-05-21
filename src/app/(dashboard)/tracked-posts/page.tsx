import { getWorkspaceForUser } from '@/lib/supabase/workspace'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatNumber } from '@/lib/utils'
import { redirect } from 'next/navigation'
import { ExternalLink } from 'lucide-react'

export default async function TrackedPostsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const memberRow = await getWorkspaceForUser(session.user.id)

  if (!memberRow) redirect('/onboarding')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id')
    .eq('workspace_id', memberRow.workspace_id)

  const { data: posts } = await supabase
    .from('tracked_posts')
    .select('*, kol:kols(id, name, x_handle)')
    .in('campaign_id', campaigns?.map(c => c.id) || [])
    .order('posted_at', { ascending: false })
    .limit(100)

  const TYPE_LABELS: Record<string, string> = {
    original: 'Original',
    mention: 'Mention',
    handle_tag: 'Tag',
    reply: 'Reply',
    quote_tweet: 'Quote',
    mixed: 'Mixed',
  }

  const TYPE_COLORS: Record<string, string> = {
    original: 'bg-slate-100 text-slate-700',
    mention: 'bg-emerald-100 text-emerald-700',
    handle_tag: 'bg-amber-100 text-amber-700',
    reply: 'bg-blue-100 text-blue-700',
    quote_tweet: 'bg-violet-100 text-violet-700',
    mixed: 'bg-slate-100 text-slate-700',
  }

  return (
    <>
      <Header title="Tracked Posts" subtitle={`${posts?.length || 0} posts tracked`} />
      <div className="flex-1 p-6">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No posts tracked yet. Go to a KOL profile and click &quot;Sync Now&quot;.</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>KOL</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Likes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <p className="font-medium text-sm text-slate-900">{(post.kol as any)?.name}</p>
                        <p className="text-xs text-slate-500">@{(post.kol as any)?.x_handle}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={TYPE_COLORS[post.tweet_type] || 'bg-slate-100 text-slate-600'}>
                          {TYPE_LABELS[post.tweet_type] || post.tweet_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-slate-600 truncate">
                          {post.tweet_text || '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">{formatNumber(post.views)}</TableCell>
                      <TableCell className="text-slate-600 text-sm">{formatNumber(post.likes)}</TableCell>
                      <TableCell className="text-slate-500 text-sm">{formatDate(post.posted_at)}</TableCell>
                      <TableCell>
                        {post.tweet_url && (
                          <a href={post.tweet_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
