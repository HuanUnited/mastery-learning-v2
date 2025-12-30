import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BaseView, ViewCard } from '@/components/layouts'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { formatDate, formatPercentage, formatDuration } from '@/lib/utils'
import { BarChart3, TrendingUp, Calendar, Target, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export function DashboardView() {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('compact')
  const [activeTab, setActiveTab] = useState('overview')

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
  })

  const { data: progress } = useQuery({
    queryKey: ['progress'],
    queryFn: api.getProgress,
  })

  const { data: dueReviews } = useQuery({
    queryKey: ['due-reviews'],
    queryFn: api.getDueReviews,
  })

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: api.getAnalytics,
  })

  return (
    <BaseView
      title="Dashboard"
      subtitle="Overview of your learning progress"
      density={density}
      maxWidth="6xl"
      actions={
        <Badge
          variant="outline"
          className="cursor-pointer"
          onClick={() => setDensity(d => d === 'comfortable' ? 'compact' : 'comfortable')}
        >
          {density === 'compact' ? '☰ Compact' : '⊟ Comfortable'}
        </Badge>
      }
    >
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold">{stats?.totalAttempts ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">
                {formatPercentage(stats?.successRate ?? 0, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Spent</p>
              <p className="text-2xl font-bold">
                {formatDuration(stats?.totalMinutes ?? 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Reviews</p>
              <p className="text-2xl font-bold">{dueReviews?.length ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <ViewCard title="Recent Activity" density={density}>
              <div className="space-y-2">
                {stats?.recentAttempts?.slice(0, 5).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium text-sm">{attempt.materialName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(attempt.timestamp)}
                      </p>
                    </div>
                    <Badge
                      variant={attempt.solved ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {attempt.solved ? '✓ Solved' : '✗ Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </ViewCard>

            {/* Current Streak */}
            <ViewCard title="Learning Streak" density={density}>
              <div className="flex items-center justify-center flex-col gap-4 py-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-4xl font-bold">{stats?.currentStreak ?? 0}</p>
                      <p className="text-xs text-muted-foreground">days</p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Best: {stats?.longestStreak ?? 0} days</p>
                </div>
              </div>
            </ViewCard>
          </div>

          {/* Materials Progress */}
          <ViewCard title="Materials Overview" density={density}>
            <div className="space-y-3">
              {progress?.materials?.slice(0, 6).map((material) => (
                <div key={material.id} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{material.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {material.solvedCount}/{material.totalAttempts} solved
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(material.solvedCount / material.totalAttempts) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ViewCard>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <ViewCard title="Material Progress" density={density}>
            <div className="space-y-4">
              {progress?.materials?.map((material) => (
                <div key={material.id} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{material.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Phase: {material.phase} • Last: {formatDate(material.lastAttempt)}
                      </p>
                    </div>
                    <Badge
                      variant={material.mastered ? 'default' : 'outline'}
                      className={material.mastered ? 'mastery-badge' : ''}
                    >
                      {material.mastered ? '★ Mastered' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Attempts</p>
                      <p className="font-semibold">{material.totalAttempts}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-semibold">{formatPercentage(material.successRate)}</p>
                    </div>
                    <div className="text-center p-2 bg-muted rounded">
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-semibold">{formatDuration(material.totalMinutes)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${material.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ViewCard>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <ViewCard title="By Phase" density={density}>
              <div className="space-y-3">
                {analytics?.byPhase?.map((phase) => (
                  <div key={phase.phase} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{phase.phase}</span>
                      <span className="text-muted-foreground">{phase.count} attempts</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(phase.count / (stats?.totalAttempts ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ViewCard>

            <ViewCard title="By Topic" density={density}>
              <div className="space-y-3">
                {analytics?.byTopic?.slice(0, 5).map((topic) => (
                  <div key={topic.topic} className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate flex-1">{topic.topic}</span>
                    <Badge variant="outline" className="ml-2">
                      {topic.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </ViewCard>
          </div>

          <ViewCard title="Weekly Activity" density={density}>
            <div className="grid grid-cols-7 gap-2">
              {analytics?.weeklyActivity?.map((day, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{day.dayName}</p>
                  <div
                    className="h-20 bg-primary/10 rounded flex items-end justify-center"
                    title={`${day.count} attempts`}
                  >
                    <div
                      className="w-full bg-primary rounded-b transition-all"
                      style={{ height: `${(day.count / (analytics.maxDailyCount || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold mt-1">{day.count}</p>
                </div>
              ))}
            </div>
          </ViewCard>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          <ViewCard
            title="Due for Review"
            density={density}
            actions={
              dueReviews && dueReviews.length > 0 && (
                <Badge variant="destructive">{dueReviews.length} due</Badge>
              )
            }
          >
            {!dueReviews || dueReviews.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">All caught up! No reviews due.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dueReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex justify-between items-center p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{review.materialName}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Last reviewed: {formatDate(review.lastReview)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {review.phase}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {review.topic}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <Badge
                        variant={review.urgency === 'high' ? 'destructive' : 'secondary'}
                      >
                        {review.urgency}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due {formatDate(review.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ViewCard>
        </TabsContent>
      </Tabs>
    </BaseView>
  )
}
