import { api } from './client'
import type { Activity, ActivityColumn, ActivityStatus } from '../types'
import { logger } from '../utils/logger'

export type ActivityPayload = Pick<Activity, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>
export type ActivityColumnPayload = Pick<ActivityColumn, 'title' | 'color'>

const ACTIVITIES_API_PATH = '/k1/lex/activities'

const logActivityError = () => logger.error('activities.request_failed')

const getActivityJson = async <T,>(path: string, params?: Record<string, unknown>): Promise<T> => {
  try {
    const response = await api.get<T>(path, { params })
    return response.data
  } catch (error) {
    logActivityError()
    throw error
  }
}

const postActivityJson = async <T,>(path: string, payload: Record<string, unknown>): Promise<T> => {
  try {
    const response = await api.post<T>(path, payload, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  } catch (error) {
    logActivityError()
    throw error
  }
}

export const activitiesApi = {
  listColumns: () => getActivityJson<ActivityColumn[]>(`${ACTIVITIES_API_PATH}/columns`),
  createColumn: (data: ActivityColumnPayload) =>
    postActivityJson<ActivityColumn>(`${ACTIVITIES_API_PATH}/columns`, {
      title: data.title.trim(),
      color: data.color.toUpperCase(),
    }),
  updateColumn: (id: string, data: Partial<ActivityColumnPayload>) =>
    postActivityJson<ActivityColumn>(`${ACTIVITIES_API_PATH}/columns/update`, {
      id,
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.color !== undefined ? { color: data.color.toUpperCase() } : {}),
    }),
  deleteColumn: (id: string) =>
    postActivityJson<{ ok: boolean }>(`${ACTIVITIES_API_PATH}/columns/delete`, { id }),
  list: (status?: ActivityStatus) =>
    getActivityJson<Activity[]>(ACTIVITIES_API_PATH, status ? { status } : undefined),
  create: (data: ActivityPayload) =>
    postActivityJson<Activity>(ACTIVITIES_API_PATH, {
      title: data.title.trim(),
      description: data.description.trim(),
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
    }),
  update: (id: string, data: Partial<ActivityPayload>) =>
    postActivityJson<Activity>(`${ACTIVITIES_API_PATH}/update`, { ...data, id }),
  remove: (id: string) =>
    postActivityJson<{ ok: boolean }>(`${ACTIVITIES_API_PATH}/delete`, { id }),
}
