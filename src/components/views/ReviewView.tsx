import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Filter, TrendingUp, AlertCircle } from 'lucide-react';

export function ReviewView() {
  const [days, setDays] = useState(7);
  const [successFilter, setSuccessFilter] = useState('failed');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState('error');

  const { data: problems } = useQuery({
    queryKey: ['recent-problems', 100],
    queryFn: () => api.getRecentProblems(100),
  });

  // Filter recent attempts
  const filteredProblems = problems
    ?.map((p) => ({
      ...p,
      recentAttempts: p.attempts.filter((a) => {
        const attemptDate = new Date(a.timestamp);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return attemptDate >= cutoffDate;
      }),
    }))
    .filter((p) => {
      if (p.recentAttempts.length === 0) return false;
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (successFilter === 'failed') return p.recentAttempts.some((a) => !a.successful);
      if (successFilter === 'success') return p.recentAttempts.every((a) => a.successful);
      return true;
    });

  // Group by error patterns
  const errorGroups = filteredProblems?.reduce((acc, problem) => {
    problem.recentAttempts
      .filter((a) => !a.successful && a.errors)
      .forEach((attempt) => {
        const errors = attempt.errors.toLowerCase();
        let category = 'Other';
        
        if (errors.includes('syntax') || errors.includes('type')) category = 'Syntax/Type';
        else if (errors.includes('logic') || errors.includes('algorithm')) category = 'Logic';
        else if (errors.includes('off by one') || errors.includes('boundary')) category = 'Boundary';
        else if (errors.includes('time') || errors.includes('timeout')) category = 'Performance';
        else if (errors.includes('forgot') || errors.includes('missed')) category = 'Recall';
        
        if (!acc[category]) acc[category] = [];
        acc[category].push({ problem, attempt });
      });
    return acc;
  }, {});

  // Group by material
  const materialGroups = filteredProblems?.reduce((acc, problem) => {
    const key = `${problem.subjectname} - ${problem.materialname}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(problem);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Review Queue</h2>
        <Badge variant="outline" className="text-sm">
          {filteredProblems?.length || 0} problems to review
        </Badge>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          
          <Select value={days.toString()} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-28 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7d</SelectItem>
              <SelectItem value="14">Last 14d</SelectItem>
              <SelectItem value="30">Last 30d</SelectItem>
            </SelectContent>
          </Select>

          <Select value={successFilter} onValueChange={setSuccessFilter}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All attempts</SelectItem>
              <SelectItem value="failed">Failed only</SelectItem>
              <SelectItem value="success">Success only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={groupBy} onValueChange={setGroupBy}>
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="error">Group by error</SelectItem>
              <SelectItem value="material">Group by material</SelectItem>
              <SelectItem value="none">No grouping</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs h-8 text-sm"
          />
        </div>
      </Card>

      {/* Grouped by Error */}
      {groupBy === 'error' && errorGroups && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Errors by Pattern
          </h3>

          {Object.entries(errorGroups).map(([category, items]) => (
            <Card key={category} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  {category}
                </h4>
                <Badge variant="secondary" className="text-xs">{items.length}</Badge>
              </div>

              <div className="space-y-1.5">
                {items.slice(0, 5).map(({ problem, attempt }, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{problem.title}</p>
                      <p className="text-muted-foreground line-clamp-1">{attempt.errors}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 text-[10px]">
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {items.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{items.length - 5} more
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Grouped by Material */}
      {groupBy === 'material' && materialGroups && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">By Material</h3>
          {Object.entries(materialGroups).map(([material, probs]) => (
            <Card key={material} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{material}</h4>
                <Badge variant="secondary" className="text-xs">{probs.length} problems</Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {probs.map((p) => (
                  <Badge key={p.id} variant="outline" className="text-xs">
                    {p.title}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Flat List */}
      {groupBy === 'none' && (
        <div className="space-y-2">
          {filteredProblems?.map((problem) => (
            <Card key={problem.id} className="p-3">
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{problem.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {problem.subjectname} • {problem.materialname}
                  </p>
                </div>
                <Badge variant={problem.issolved ? 'default' : 'secondary'} className="text-xs shrink-0">
                  {problem.recentAttempts.length} recent
                </Badge>
              </div>

              <div className="space-y-1">
                {problem.recentAttempts.slice(0, 2).map((attempt) => (
                  <div
                    key={attempt.id}
                    className={`text-xs p-1.5 rounded ${
                      attempt.successful
                        ? 'bg-green-50 dark:bg-green-900/10'
                        : 'bg-red-50 dark:bg-red-900/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[10px]">
                        {attempt.successful ? '✓' : '✗'} #{attempt.attemptnumber}
                      </span>
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(attempt.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    {attempt.errors && (
                      <p className="mt-0.5 text-muted-foreground line-clamp-1">{attempt.errors}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
