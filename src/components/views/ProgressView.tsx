import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';

export function ProgressView() {
  const { data: stats } = useQuery({
    queryKey: ['material-stats'],
    queryFn: api.getAllMaterialStats,
  });

  const { data: problems } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  });

  // Calculate learning velocity per material
  const velocityData = stats?.map((material) => {
    const materialProblems = problems?.filter(
      (p) => p.material_name === material.material_name
    );

    const batchStats = materialProblems?.reduce((acc, problem) => {
      problem.attempts.forEach((attempt) => {
        if (!acc[attempt.batchnumber]) {
          acc[attempt.batchnumber] = { total: 0, successful: 0 };
        }
        acc[attempt.batchnumber].total++;
        if (attempt.successful) acc[attempt.batchnumber].successful++;
      });
      return acc;
    }, {});

    const batches = Object.entries(batchStats || {}).map(([num, data]) => ({
      batch: Number(num),
      successRate: (data.successful / data.total) * 100,
      attempts: data.total,
    }));

    return {
      material: material.materialname,
      subject: material.subjectname,
      batches: batches.sort((a, b) => a.batch - b.batch),
      avgAttempts: material.avgattemptsperproblem,
      totalTime: material.totaltimeminutes,
    };
  });

  // Difficulty hotspots
  const hotspots = stats
    ?.filter((m) => m.avgattemptsperproblem > 3)
    .sort((a, b) => b.avgattemptsperproblem - a.avgattemptsperproblem);

  // Time efficiency trends
  const timeEfficiency = problems
    ?.filter((p) => p.issolved)
    .map((p) => ({
      title: p.title,
      totalAttempts: p.attempts.length,
      totalTime: p.attempts.reduce((sum, a) => sum + a.timespentminutes, 0),
      avgTimePerAttempt: p.attempts.reduce((sum, a) => sum + a.timespentminutes, 0) / p.attempts.length,
    }))
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-bold">Learning Progress</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Mastered</span>
          </div>
          <div className="text-2xl font-bold">
            {stats?.filter((m) => m.successrate >= 80).length || 0}
          </div>
          <div className="text-xs text-muted-foreground">materials</div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Avg Success</span>
          </div>
          <div className="text-2xl font-bold">
            {stats?.length
              ? (stats.reduce((sum, m) => sum + m.successrate, 0) / stats.length).toFixed(0)
              : 0}%
          </div>
          <div className="text-xs text-muted-foreground">across all materials</div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Total Time</span>
          </div>
          <div className="text-2xl font-bold">
            {((stats?.reduce((sum, m) => sum + m.totaltimeminutes, 0) || 0) / 60).toFixed(1)}h
          </div>
          <div className="text-xs text-muted-foreground">invested</div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Hotspots</span>
          </div>
          <div className="text-2xl font-bold">{hotspots?.length || 0}</div>
          <div className="text-xs text-muted-foreground">need focus</div>
        </Card>
      </div>

      {/* Learning Velocity */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Learning Velocity</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Success rate improvement across batches
        </p>

        <div className="space-y-3">
          {velocityData?.slice(0, 8).map((data) => (
            <div key={data.material} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{data.material}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {data.batches.length} batches
                </span>
              </div>

              <div className="flex items-center gap-1 h-6">
                {data.batches.map((batch, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded overflow-hidden relative group"
                    style={{
                      background: `hsl(${batch.successRate * 1.2}, 70%, 50%)`,
                      opacity: 0.3 + batch.successRate / 150,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white drop-shadow">
                        {batch.successRate.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Batch 1</span>
                <span>Latest</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Difficulty Hotspots */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-500" />
          Difficulty Hotspots
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Materials requiring &gt;3 attempts on average
        </p>

        <div className="space-y-2">
          {hotspots?.slice(0, 8).map((material) => (
            <div key={material.materialid} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/10 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{material.materialname}</p>
                <p className="text-xs text-muted-foreground">{material.subjectname}</p>
              </div>
              <Badge variant="destructive" className="text-xs shrink-0">
                {material.avgattemptsperproblem.toFixed(1)} avg attempts
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Time Efficiency */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Time Investment
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Problems with highest time investment
        </p>

        <div className="space-y-2">
          {timeEfficiency?.map((prob, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{prob.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{prob.totalAttempts} attempts</span>
                  <span>•</span>
                  <span>{prob.avgTimePerAttempt.toFixed(1)} min/attempt</span>
                </div>
              </div>
              <span className="text-sm font-bold shrink-0">{prob.totalTime.toFixed(0)}m</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
