import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useProblems = (filters?: any) => {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: () => api.getRecentProblems(filters?.limit || 100),
  })
}

export const useLogAttempt = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.logAttempt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['recent-problems'] })
      queryClient.invalidateQueries({ queryKey: ['material-stats'] })
      queryClient.invalidateQueries({ queryKey: ['batch-stats'] })
    },
  })
}

export const useBatchStats = (problemId: number) => {
  return useQuery({
    queryKey: ['batch-stats', problemId],
    queryFn: () => api.getProblemBatchStats(problemId),
    enabled: !!problemId,
  })
}
