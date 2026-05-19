import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Zap, BarChart3, CheckCircle, MessageSquare, Shield, ArrowRight,
  TrendingUp, Users, FileText, Star
} from 'lucide-react'

const features = [
  {
    icon: MessageSquare,
    title: 'Auto X/Twitter Tracking',
    description: 'Automatically sync tweets from your KOLs and classify them by deliverable type using our Rettiwt integration.',
  },
  {
    icon: CheckCircle,
    title: 'Deliverable Management',
    description: 'Set promised deliverables per campaign and track completion with real-time progress bars.',
  },
  {
    icon: BarChart3,
    title: 'Performance Reports',
    description: 'Generate detailed reports with promised vs. completed breakdowns and engagement metrics.',
  },
  {
    icon: TrendingUp,
    title: 'Payout Recommendations',
    description: 'Get automatic pay/hold/review recommendations based on completion percentages.',
  },
  {
    icon: Shield,
    title: 'Multi-Workspace',
    description: 'Manage multiple brands and KOL campaigns from a single platform with role-based access.',
  },
  {
    icon: FileText,
    title: 'Manual Log Support',
    description: 'Log newsletter mentions, space participation, and other off-platform deliverables manually.',
  },
]

const steps = [
  {
    step: '01',
    title: 'Add your KOLs',
    description: 'Enter each KOL\'s X handle, monthly fee, and campaign dates. Set promised deliverables per month.',
  },
  {
    step: '02',
    title: 'Sync their posts',
    description: 'Click "Sync" to automatically fetch and classify their tweets. Our AI identifies mentions, handle tags, replies, and more.',
  },
  {
    step: '03',
    title: 'Get recommendations',
    description: 'Review completion percentages and get instant pay/hold/review recommendations for each KOL.',
  },
]

const painPoints = [
  'Manually checking every KOL\'s Twitter profile',
  'Losing track of promised vs delivered content',
  'No clear way to justify or deny KOL payments',
  'Spreadsheets that are always out of date',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-slate-100 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">KOL Tracker</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get started free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 mb-6">
            <Star className="h-3 w-3" />
            Built for crypto & Web3 teams
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Track every KOL deliverable{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-500">
              in one place
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop manually checking Twitter. Automatically sync KOL posts, track promised deliverables,
            and get instant payout recommendations — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                Start tracking for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign in to dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 bg-red-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Sound familiar?</h2>
            <p className="text-slate-500">These are the problems KOL managers face every day.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-red-100">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-xs font-bold">✗</span>
                </div>
                <p className="text-sm text-slate-700">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A complete system for tracking KOL partnerships from promise to payout.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-500">Get set up in minutes, track forever.</p>
          </div>
          <div className="space-y-8">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">100%</div>
              <p className="text-slate-500 text-sm">Automated tracking</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">5min</div>
              <p className="text-slate-500 text-sm">Setup per KOL</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-slate-900 mb-2">∞</div>
              <p className="text-slate-500 text-sm">KOLs supported</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to track your KOLs?
          </h2>
          <p className="text-slate-400 mb-8">
            Join teams that trust KOL Tracker to manage their influencer campaigns.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 gap-2">
              Get started for free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-slate-900 flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-900">KOL Tracker</span>
            </div>
            <p className="text-xs text-slate-400">&copy; 2025 KOL Deliverable Tracker. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/login" className="text-xs text-slate-500 hover:text-slate-900">Sign in</Link>
              <Link href="/signup" className="text-xs text-slate-500 hover:text-slate-900">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
