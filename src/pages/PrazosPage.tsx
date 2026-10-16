import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { usePrazos, usePrazosVencendo, useCreatePrazo, useUpdatePrazo, useDeletePrazo } from '../hooks/usePrazos'
import { useProcessos } from '../hooks/useProcessos'
import { Modal } from '../components/Modal'
import { Calendar } from '../components/Calendar'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusPrazoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import type { Prazo, StatusPrazo } from '../types'

type FormData = { processoId: string; titulo: string; descricao: string; dataVencimento: string; status?: StatusPrazo }

import { diasRestantes } from '../utils/formatters'

export function PrazosPage() {
  const { user } = useAuth()
  const { data: prazos, isLoading, error } = usePrazos()
  const { data: vencendo } = usePrazosVencendo(7)
  const { data: processos } = useProcessos()
  const create = useCreatePrazo()
  const update = useUpdatePrazo()
  const remove = useDeletePrazo()
  const [editing, setEditing] = useState<Prazo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Prazo | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const isCliente = user?.role === 'cliente'

  if (error) {
    console.error('Erro ao carregar prazos:', error)
  }

  const prazosList = Array.isArray(prazos) ? prazos : []
  const vencendoList = Array.isArray(vencendo) ? vencendo : []

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (p: Prazo) => { reset({ ...p, dataVencimento: p.dataVencimento.slice(0, 10) }); setEditing(p); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data, { onSuccess: close })
  }

  const filtered = prazosList.filter((p) => p?.titulo && p.titulo.toLowerCase().includes(search.toLowerCase()))

  const stats = [
    { label: 'Total', value: prazosList.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Clock size={18} /> },
    { label: 'Pendentes', value: prazosList.filter((p) => p?.status === 'pendente').length, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <Clock size={18} /> },
    { label: 'Concluídos', value: prazosList.filter((p) => p?.status === 'concluido').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <CheckCircle size={18} /> },
    { label: 'Vencidos', value: prazosList.filter((p) => p?.status === 'vencido').length, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <AlertTriangle size={18} /> },
  ]

  return (
    <div className="kea-process-page kea-deadline-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content">
        <PageBanner
          title="Prazos"
          description={isCliente ? "Acompanhe os prazos dos seus processos." : "Controle prazos processuais e acompanhe vencimentos dos processos."}
          action={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Prazo</Button>}
        />
        <div className="kea-deadline-stats grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        {vencendoList.length > 0 && (
          <motion.div
            className="kea-deadline-alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="kea-deadline-alert-icon">
                <AlertTriangle size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="kea-deadline-alert-title">{vencendoList.length} prazo(s) vencendo nos próximos 7 dias</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {vencendoList.map((p) => {
                    const dias = diasRestantes(p.dataVencimento)
                    return (
                      <span key={p.id} className="kea-deadline-alert-item">
                        <Clock size={10} className="shrink-0" />
                        <span className="truncate max-w-[140px]">{p.titulo}</span>
                        <span className="font-bold shrink-0">{dias <= 0 ? 'hoje' : `${dias}d`}</span>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendário - Esquerda (1 coluna) */}
          <div className="kea-deadline-calendar lg:col-span-1">
            <Calendar prazos={prazosList} onDateSelect={() => {}} />
          </div>

          {/* Tabela de Prazos - Direita (3 colunas) */}
          <div className="kea-deadline-list lg:col-span-3">
            <DataCard delay={0.2} className="kea-deadline-table-card">
              <div className="kea-deadline-search-row">
                <div className="kea-deadline-search">
                  <Search size={16} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar prazo..." aria-label="Buscar prazo" />
                </div>
              </div>
              <table className="kea-deadline-table w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    {['Título', 'Descrição', 'Vencimento', 'Dias', 'Status', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6}><EmptyState message="Nenhum prazo encontrado" icon={<Clock size={28} className="text-gray-300" />} /></td></tr>
                  ) : (
                    <AnimatePresence>
                      {filtered.map((p, i) => {
                        const dias = diasRestantes(p.dataVencimento)
                        const urgente = dias <= 3 && p.status === 'pendente'
                        return (
                          <motion.tr
                            key={p.id}
                            className={`kea-deadline-row ${urgente ? 'is-urgent' : ''}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-white">{p.titulo}</td>
                            <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400 max-w-xs truncate">{p.descricao}</td>
                            <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400">{new Date(p.dataVencimento).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-3.5">
                              <span className={`text-xs font-bold ${dias < 0 ? 'text-red-600' : dias <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                                {dias < 0 ? `${Math.abs(dias)}d atrás` : dias === 0 ? 'Hoje' : `${dias}d`}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">{statusPrazoBadge(p.status)}</td>
                            <td className="px-4 py-3.5">
                              {!isCliente && (
                                <div className="flex gap-1.5 justify-end">
                                  <button className="kea-deadline-action is-edit" onClick={() => openEdit(p)} aria-label={`Editar ${p.titulo}`} title="Editar"><Pencil size={14} /></button>
                                  <button className="kea-deadline-action is-delete" onClick={() => setConfirmDelete(p)} aria-label={`Excluir ${p.titulo}`} title="Excluir"><Trash2 size={14} /></button>
                                </div>
                              )}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </DataCard>
          </div>
        </div>
      </div>

      {confirmDelete && (
        <Modal title="Confirmar Exclusão" onClose={() => setConfirmDelete(null)} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <Trash2 size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">Excluir o prazo <strong>{confirmDelete.titulo}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}

      {open && !isCliente && (
        <Modal title={editing ? 'Editar Prazo' : 'Novo Prazo'} subtitle="Defina o prazo processual" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select label="Processo" {...register('processoId')}>
              <option value="">Selecione...</option>
              {Array.isArray(processos) && processos.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </Select>
            <Input label="Título" {...register('titulo')} placeholder="Ex: Contestação" />
            <Textarea label="Descrição" {...register('descricao')} rows={2} placeholder="Detalhes do prazo..." />
            <Input label="Data de Vencimento" {...register('dataVencimento')} type="date" />
            {editing && (
              <Select label="Status" {...register('status')}>
                {['pendente', 'concluido', 'vencido'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
