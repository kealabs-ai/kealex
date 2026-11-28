const SAFE_EVENTS = new Set([
  'ai.request',
  'ai.request_failed',
  'activities.request_failed',
  'process.phase_advance_failed',
  'process.phase_advance_mutation_failed',
  'ui.render_failed',
])

const SAFE_METRICS = new Set(['messageCount'])

type SafeEvent =
  | 'ai.request'
  | 'ai.request_failed'
  | 'activities.request_failed'
  | 'process.phase_advance_failed'
  | 'process.phase_advance_mutation_failed'
  | 'ui.render_failed'

type SafeMetrics = { messageCount?: number }

function write(level: 'log' | 'warn' | 'error', event: SafeEvent, metrics?: SafeMetrics): void {
  if (!SAFE_EVENTS.has(event)) return

  const safeMetrics = Object.fromEntries(
    Object.entries(metrics ?? {}).filter(([key, value]) =>
      SAFE_METRICS.has(key) && typeof value === 'number' && Number.isFinite(value),
    ),
  )
  const output = console[level] as (...args: unknown[]) => void
  if (Object.keys(safeMetrics).length) output(`[kealex] ${event}`, safeMetrics)
  else output(`[kealex] ${event}`)
}

export const logger = {
  info: (event: SafeEvent, metrics?: SafeMetrics) => write('log', event, metrics),
  warn: (event: SafeEvent, metrics?: SafeMetrics) => write('warn', event, metrics),
  error: (event: SafeEvent) => write('error', event),
}
