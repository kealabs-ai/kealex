import axios from 'axios'
import { api } from './client'
import type { Activity, ActivityColumn, ActivityStatus } from '../types'

export type ActivityPayload = Pick<Activity, 'title' | 'description' | 'status' | 'priority' | 'dueDate'>
export type ActivityColumnPayload = Pick<ActivityColumn, 'title' | 'color'>

const ACTIVITIES_API_PATH = '/k1/lex/activities'
const ACTIVITIES_API_BASE_URL = import.meta.env.KEALEX_API_BASE_URL || 'https://srv1023256.hstgr.cloud'

const logActivityError = (method: string, path: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error(`[activities][response error] ${method} ${path}`, {
      status: error.response?.status,
      response: error.response?.data,
      message: error.message,
    })
    return
  }

  console.error(`[activities][request error] ${method} ${path}`, error)
}

const getActivityJson = async <T,>(path: string, params?: Record<string, unknown>): Promise<T> => {
  console.debug(`[activities][request] GET ${path}`, params ?? null)
  try {
    const response = await api.get<T>(path, { baseURL: ACTIVITIES_API_BASE_URL, params })
    console.debug(`[activities][response] GET ${path}`, { status: response.status, data: response.data })
    return response.data
  } catch (error) {
    logActivityError('GET', path, error)
    throw error
  }
}

const postActivityJson = async <T,>(path: string, payload: Record<string, unknown>): Promise<T> => {
  console.debug(`[activities][request] POST ${path}`, payload)
  try {
    const response = await api.post<T>(path, payload, {
      baseURL: ACTIVITIES_API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    })
    console.debug(`[activities][response] POST ${path}`, { status: response.status, data: response.data })
    return response.data
  } catch (error) {
    logActivityError('POST', path, error)
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
