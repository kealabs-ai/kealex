import { useMemo, useState, type FormEvent, type CSSProperties } from 'react'
import axios from 'axios'
import { CalendarDays, Check, ClipboardList, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useActivities, useActivityColumns, useCreateActivity, useCreateActivityColumn, useDeleteActivity, useDeleteActivityColumn, useUpdateActivity, useUpdateActivityColumn } from '../hooks/useActivities'
import type { ActivityColumnPayload, ActivityPayload } from '../api/activities'
import { PageBanner } from '../components/PageBanner'
import { TopBar } from '../components/TopBar'
import { Button } from '../components/UI'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import type { Activity, ActivityColumn, ActivityPriority, ActivityStatus } from '../types'

const DEFAULT_COLUMNS: ActivityColumn[] = [
  { id: 'todo', title: 'A Fazer', color: '#087E96', position: 0, createdAt: '', updatedAt: '' },
  { id: 'in_progress', title: 'Em Andamento', color: '#D97706', position: 1, createdAt: '', updatedAt: '' },
  { id: 'done', title: 'Concluído', color: '#16834F', position: 2, createdAt: '', updatedAt: '' },
]
const COLUMN_COLORS = ['#087E96', '#075DE8', '#7C3AED', '#D97706', '#E11D48', '#16834F', '#475569', '#B45309']

const PRIORITIES: { id: ActivityPriority; label: string }[] = [
  { id: 'baixa', label: 'Baixa' },
  { id: 'media', label: 'Média' },
  { id: 'alta', label: 'Alta' },
]

const EMPTY_FORM: ActivityPayload = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'media',
  dueDate: null,
}

function dateLabel(value: string | null) {
  if (!value) return 'Sem prazo'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function isOverdue(activity: Activity) {
  if (!activity.dueDate || activity.status === 'done') return false
  const today = new Date()
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return activity.dueDate.slice(0, 10) < localToday
}

function resolveColumnId(status: string, columns: ActivityColumn[]) {
  const exactMatch = columns.find((column) => column.id === status)
  if (exactMatch) return exactMatch.id

  // Recover IDs truncated by older databases where activities.status was VARCHAR(20).
  return columns.find((column) => column.id.length > status.length && column.id.startsWith(status))?.id ?? status
}

function activityErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback
  const status = error.response?.status
  const detail = error.response?.data?.detail
  const message = typeof detail === 'string'
    ? detail
    : Array.isArray(detail)
      ? detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join('; ')
      : undefined
  if (message) return `${fallback} (${message}${status ? ` · HTTP ${status}` : ''})`
  if (status) return `${fallback} (HTTP ${status})`
  return `${fallback} (${error.message})`
}

function ActivityCard({
  activity,
  onEdit,
  onDelete,
  onStatusChange,
  columns,
  color,
}: {
  activity: Activity
  onEdit: (activity: Activity) => void
  onDelete: (activity: Activity) => void
  onStatusChange: (activity: Activity, status: ActivityStatus) => void
  columns: ActivityColumn[]
  color: string
}) {
  const overdue = isOverdue(activity)
  return (
    <article
      className="kea-activity-card"
      style={{ '--activity-accent': color } as CSSProperties}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('text/activity-id', activity.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      aria-label={`Atividade: ${activity.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h3>
        <span className={`kea-activity-priority is-${activity.priority}`}>{PRIORITIES.find((priority) => priority.id === activity.priority)?.label}</span>
      </div>
      {activity.description && <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600 dark:text-slate-300">{activity.description}</p>}
      <div className={`mt-4 flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 dark:text-red-300' : 'text-slate-500 dark:text-slate-400'}`}>
        <CalendarDays size={14} aria-hidden="true" />
        <span>{overdue ? 'Atrasada · ' : ''}{dateLabel(activity.dueDate)}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <label className="sr-only" htmlFor={`activity-status-${activity.id}`}>Mover {activity.title} para outra coluna</label>
        <select
          id={`activity-status-${activity.id}`}
          className="kea-activity-status-select"
          value={resolveColumnId(activity.status, columns)}
          onChange={(event) => onStatusChange(activity, event.target.value as ActivityStatus)}
        >
          {columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <button type="button" className="kea-activity-icon-button" onClick={() => onEdit(activity)} aria-label={`Editar ${activity.title}`} title="Editar"><Pencil size={15}/></button>
          <button type="button" className="kea-activity-icon-button is-delete" onClick={() => onDelete(activity)} aria-label={`Excluir ${activity.title}`} title="Excluir"><Trash2 size={15}/></button>
        </div>
      </div>
    </article>
  )
}

export function ActivitiesPage() {
  const { data, isLoading, isError, error: loadError, refetch } = useActivities()
  const { data: columnData, isLoading: columnsLoading, isError: columnsError, refetch: refetchColumns } = useActivityColumns()
  const createActivity = useCreateActivity()
  const createColumn = useCreateActivityColumn()
  const updateActivity = useUpdateActivity()
  const updateColumn = useUpdateActivityColumn()
  const deleteActivity = useDeleteActivity()
  const deleteColumn = useDeleteActivityColumn()
  const { success, error: toastError } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [columnFormOpen, setColumnFormOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<ActivityColumn | null>(null)
  const [columnDeleteTarget, setColumnDeleteTarget] = useState<ActivityColumn | null>(null)
  const [columnForm, setColumnForm] = useState<ActivityColumnPayload>({ title: '', color: COLUMN_COLORS[0] })
  const [editing, setEditing] = useState<Activity | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null)
  const [form, setForm] = useState<ActivityPayload>(EMPTY_FORM)
  const [dragOver, setDragOver] = useState<ActivityStatus | null>(null)
  const activities = Array.isArray(data) ? data : []
  const columns = Array.isArray(columnData) && columnData.length > 0 ? columnData : DEFAULT_COLUMNS
  const grouped = useMemo(() => Object.fromEntries(
    columns.map((column) => [column.id, activities.filter((activity) => resolveColumnId(activity.status, columns) === column.id)])
  ) as Record<ActivityStatus, Activity[]>, [activities, columns])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, status: columns[0]?.id ?? 'todo' })
    setFormOpen(true)
  }

  const openColumnForm = (column?: ActivityColumn) => {
    setEditingColumn(column ?? null)
    setColumnForm(column ? { title: column.title, color: column.color } : { title: '', color: COLUMN_COLORS[0] })
    setColumnFormOpen(true)
  }

  const submitColumn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = { ...columnForm, title: columnForm.title.trim() }
    const options = {
      onSuccess: () => {
        setColumnFormOpen(false)
        setEditingColumn(null)
        success(editingColumn ? 'Coluna atualizada.' : 'Coluna criada.')
      },
      onError: (error: unknown) => toastError(activityErrorMessage(error, 'Não foi possível salvar a coluna.')),
    }
    if (editingColumn) updateColumn.mutate({ id: editingColumn.id, data: payload }, options)
    else createColumn.mutate(payload, options)
  }

  const confirmDeleteColumn = () => {
    if (!columnDeleteTarget) return
    deleteColumn.mutate(columnDeleteTarget.id, {
      onSuccess: () => success('Coluna excluída.'),
      onError: (error) => toastError(activityErrorMessage(error, 'Não foi possível excluir a coluna.')),
      onSettled: () => setColumnDeleteTarget(null),
    })
  }

  const openEdit = (activity: Activity) => {
    setEditing(activity)
    setForm({
      title: activity.title,
      description: activity.description ?? '',
      status: activity.status,
      priority: activity.priority,
      dueDate: activity.dueDate?.slice(0, 10) ?? null,
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    if (createActivity.isPending || updateActivity.isPending) return
    setFormOpen(false)
    setEditing(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload: ActivityPayload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
    }
    const options = {
      onSuccess: () => {
        // React Query still reports the mutation as pending while running this callback.
        // Avoid closeForm's pending guard here so successful saves dismiss the modal.
        setFormOpen(false)
        setEditing(null)
        success(editing ? 'Atividade atualizada.' : 'Atividade criada.')
      },
      onError: (error: unknown) => toastError(activityErrorMessage(error, 'Não foi possível salvar a atividade.')),
    }
    if (editing) updateActivity.mutate({ id: editing.id, data: payload }, options)
    else createActivity.mutate(payload, options)
  }

  const moveActivity = (activity: Activity, status: ActivityStatus) => {
    if (activity.status === status) return
    updateActivity.mutate({ id: activity.id, data: { status } }, {
      onError: (error) => toastError(activityErrorMessage(error, 'Não foi possível mover a atividade.')),
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteActivity.mutate(deleteTarget.id, {
      onSuccess: () => {
        success('Atividade excluída.')
        setDeleteTarget(null)
      },
      onError: (error) => toastError(activityErrorMessage(error, 'Não foi possível excluir a atividade.')),
    })
  }

  return (
    <div className="kea-process-page kea-activities-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content">
        <PageBanner
          section="Meu Espaço"
          title="Minhas Atividades"
          description="Organize suas tarefas e acompanhe cada etapa do trabalho."
          action={<div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" icon={<Plus size={16}/>} onClick={() => openColumnForm()}>Nova Coluna</Button><Button type="button" icon={<Plus size={16}/>} onClick={openCreate}>Nova Atividade</Button></div>}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <ClipboardList size={17} className="text-[#087E96] dark:text-[#20B987]" aria-hidden="true" />
            <span>{activities.length} {activities.length === 1 ? 'atividade' : 'atividades'}</span>
            <span className="text-slate-400">·</span>
            <span>Arraste um cartão para mudar de coluna</span>
          </div>
          {updateActivity.isPending && <span className="inline-flex items-center gap-2 text-xs text-slate-500"><Loader2 size={14} className="animate-spin"/>Salvando alteração…</span>}
        </div>

        {columnsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" role="alert">
            <p>Não foi possível carregar as colunas do quadro.</p>
            <button type="button" className="mt-3 font-semibold underline" onClick={() => void refetchColumns()}>Tentar novamente</button>
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200" role="alert">
            <p>{activityErrorMessage(loadError, 'Não foi possível carregar suas atividades.')}</p>
            <button type="button" className="mt-3 font-semibold underline" onClick={() => void refetch()}>Tentar novamente</button>
          </div>
        ) : (
          <div className="kea-activity-board">
            {columnsLoading && !columnData ? <div className="text-sm text-slate-500">Carregando colunas…</div> : columns.map((column) => (
              <section
                key={column.id}
                className={`kea-activity-column${dragOver === column.id ? ' is-drag-over' : ''}`}
                style={{ '--activity-accent': column.color } as CSSProperties}
                aria-labelledby={`activity-column-${column.id}`}
                onDragOver={(event) => { event.preventDefault(); setDragOver(column.id) }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(null) }}
                onDrop={(event) => {
                  event.preventDefault()
                  const activityId = event.dataTransfer.getData('text/activity-id')
                  const activity = activities.find((item) => item.id === activityId)
                  if (activity) moveActivity(activity, column.id)
                  setDragOver(null)
                }}
              >
                <header className="kea-activity-column-header">
                  <div className="min-w-0"><h2 id={`activity-column-${column.id}`}>{column.title}</h2></div>
                  <span className="kea-activity-count">{grouped[column.id]?.length ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" className="kea-activity-icon-button" onClick={() => openColumnForm(column)} aria-label={`Editar coluna ${column.title}`} title="Editar coluna"><Pencil size={14}/></button>
                    <button type="button" className="kea-activity-icon-button is-delete" onClick={() => setColumnDeleteTarget(column)} disabled={deleteColumn.isPending} aria-label={`Excluir coluna ${column.title}`} title="Excluir coluna"><Trash2 size={14}/></button>
                  </div>
                </header>
                <div className="kea-activity-column-body">
                  {isLoading ? (
                    <div className="space-y-3" aria-label="Carregando atividades">{[0, 1].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-slate-200/70 dark:bg-slate-700/70" />)}</div>
                  ) : grouped[column.id]?.length ? (
                    grouped[column.id].map((activity) => <ActivityCard key={activity.id} activity={activity} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={moveActivity} columns={columns} color={column.color}/>)
                  ) : (
                    <div className="kea-activity-empty"><Check size={16}/><span>Nenhuma atividade nesta coluna</span></div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {formOpen && <Modal title={editing ? 'Editar atividade' : 'Nova atividade'} subtitle="Defina os detalhes e acompanhe pelo quadro." onClose={closeForm} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Título *
            <input className="kea-ui-input mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#087E96] focus:ring-2 focus:ring-[#087E96]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} maxLength={180} required autoFocus />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Descrição
            <textarea className="kea-ui-textarea mt-1.5 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#087E96] focus:ring-2 focus:ring-[#087E96]/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} maxLength={5000} />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Coluna
              <select className="kea-ui-select mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>{columns.map((column) => <option key={column.id} value={column.id}>{column.title}</option>)}</select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Prioridade
              <select className="kea-ui-select mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as ActivityPriority }))}>{PRIORITIES.map((priority) => <option key={priority.id} value={priority.id}>{priority.label}</option>)}</select>
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Prazo
              <input type="date" className="kea-ui-input mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={form.dueDate ?? ''} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value || null }))}/>
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={createActivity.isPending || updateActivity.isPending}>Cancelar</Button>
            <Button type="submit" loading={createActivity.isPending || updateActivity.isPending} disabled={!form.title.trim() || createActivity.isPending || updateActivity.isPending}>{editing ? 'Salvar alterações' : 'Criar atividade'}</Button>
          </div>
        </form>
      </Modal>}

      {columnFormOpen && <Modal title={editingColumn ? 'Editar coluna' : 'Nova coluna'} subtitle="Personalize o nome e a cor exibidos no quadro." onClose={() => setColumnFormOpen(false)} size="sm">
        <form onSubmit={submitColumn} className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Nome da coluna
            <input className="kea-ui-input mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white" value={columnForm.title} onChange={(event) => setColumnForm((current) => ({ ...current, title: event.target.value }))} maxLength={80} required autoFocus />
          </label>
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Cor dos cards e cabeçalho</span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {COLUMN_COLORS.map((color) => <button key={color} type="button" className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${columnForm.color.toUpperCase() === color ? 'border-slate-900 ring-2 ring-slate-300 dark:border-white dark:ring-slate-600' : 'border-white shadow dark:border-slate-700'}`} style={{ backgroundColor: color }} onClick={() => setColumnForm((current) => ({ ...current, color }))} aria-label={`Selecionar cor ${color}`} aria-pressed={columnForm.color.toUpperCase() === color} />)}
              <input type="color" className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0" value={columnForm.color} onChange={(event) => setColumnForm((current) => ({ ...current, color: event.target.value }))} aria-label="Escolher outra cor" />
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <Button type="button" variant="secondary" onClick={() => setColumnFormOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createColumn.isPending || updateColumn.isPending} disabled={!columnForm.title.trim() || createColumn.isPending || updateColumn.isPending}>{editingColumn ? 'Salvar coluna' : 'Criar coluna'}</Button>
          </div>
        </form>
      </Modal>}

      {columnDeleteTarget && <Modal title="Excluir coluna?" subtitle="Esta ação não pode ser desfeita." onClose={() => { if (!deleteColumn.isPending) setColumnDeleteTarget(null) }} size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">A coluna <strong className="text-slate-900 dark:text-white">{columnDeleteTarget.title}</strong> será removida do seu quadro.</p>
        {(grouped[columnDeleteTarget.id]?.length ?? 0) > 0 && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Mova as atividades desta coluna antes de excluí-la.</p>}
        {columns.length <= 1 && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">O quadro precisa manter pelo menos uma coluna.</p>}
        <div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setColumnDeleteTarget(null)} disabled={deleteColumn.isPending}>Cancelar</Button><Button type="button" variant="danger" icon={<Trash2 size={15}/>} onClick={confirmDeleteColumn} loading={deleteColumn.isPending} disabled={(grouped[columnDeleteTarget.id]?.length ?? 0) > 0 || columns.length <= 1 || deleteColumn.isPending}>Excluir coluna</Button></div>
      </Modal>}

      {deleteTarget && <Modal title="Excluir atividade?" subtitle="Esta ação não pode ser desfeita." onClose={() => { if (!deleteActivity.isPending) setDeleteTarget(null) }} size="sm">
        <p className="text-sm text-slate-600 dark:text-slate-300">A atividade <strong className="text-slate-900 dark:text-white">{deleteTarget.title}</strong> será removida.</p>
        <div className="mt-5 flex justify-end gap-2"><Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={deleteActivity.isPending}>Cancelar</Button><Button variant="danger" icon={<Trash2 size={15}/>} onClick={confirmDelete} loading={deleteActivity.isPending}>Excluir</Button></div>
      </Modal>}
    </div>
  )
}
