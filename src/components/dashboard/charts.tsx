'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface ChartData {
  name: string
  value: number
}

interface CampaignStat {
  name: string
  pct: number
  month: string
}

interface DashboardChartsProps {
  chartData: ChartData[]
  campaignStats: CampaignStat[]
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444']

export function DashboardCharts({ chartData, campaignStats }: DashboardChartsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Posts by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {campaignStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">KOL Completion Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={campaignStats.slice(0, 8)}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(v) => v.slice(0, 8)}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Completion']}
                  contentStyle={{ fontSize: 12, borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar
                  dataKey="pct"
                  radius={[4, 4, 0, 0]}
                  fill="#10b981"
                  label={{ position: "top", fontSize: 10, fill: "#64748b" }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
