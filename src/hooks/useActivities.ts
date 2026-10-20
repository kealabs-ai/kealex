import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { activitiesApi, type ActivityColumnPayload, type ActivityPayload } from '../api/activities'
import type { ActivityStatus } from '../types'

export const ACTIVITIES_KEY = ['activities']
export const ACTIVITY_COLUMNS_KEY = ['activity-columns']

export function useActivityColumns() {
  return useQuery({
    queryKey: ACTIVITY_COLUMNS_KEY,
    queryFn: activitiesApi.listColumns,
    // Avoid firing another 30s request every time the tab regains focus while
    // the activity API is unavailable.
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useCreateActivityColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ActivityColumnPayload) => activitiesApi.createColumn(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITY_COLUMNS_KEY }),
  })
}

export function useUpdateActivityColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActivityColumnPayload> }) => activitiesApi.updateColumn(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITY_COLUMNS_KEY }),
  })
}

export function useDeleteActivityColumn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activitiesApi.deleteColumn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITY_COLUMNS_KEY }),
  })
}

export function useActivities(status?: ActivityStatus) {
  return useQuery({
    queryKey: [...ACTIVITIES_KEY, status ?? 'all'],
    queryFn: () => activitiesApi.list(status),
    refetchOnWindowFocus: false,
    retry: false,
  })
}

export function useCreateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ActivityPayload) => activitiesApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY }),
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ActivityPayload> }) => activitiesApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY }),
  })
}

export function useDeleteActivity() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: activitiesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACTIVITIES_KEY }),
  })
}
