import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import { usePrazos, usePrazosVencendo, useCreatePrazo, useUpdatePrazo, useDeletePrazo } from '../hooks/usePrazos'
import { useProcessos } from '../hooks/useProcessos'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusPrazoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import type { Prazo, StatusPrazo } from '../types'

type FormData = { processoId: string; titulo: string; descricao: string; dataVencimento: string; status?: StatusPrazo }

const diasRestantes = (data: string) => {
  const diff = new Date(data).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function PrazosPage() {
  const { data: prazos, isLoading } = usePrazos()
  const { data: vencendo } = usePrazosVencendo(7)
  const { data: processos } = useProcessos()
  const create = useCreatePrazo()
  const update = useUpdatePrazo()
  const remove = useDeletePrazo()
  const [editing, setEditing] = useState<Prazo | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (p: Prazo) => { reset({ ...p, dataVencimento: p.dataVencimento.slice(0, 10) }); setEditing(p); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data, { onSuccess: close })
  }

  const filtered = prazos?.filter((p) => p.titulo.toLowerCase().includes(search.toLowerCase())) ?? []

  const stats = [
    { label: 'Total', value: prazos?.length ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Clock size={18} /> },
    { label: 'Pendentes', value: prazos?.filter((p) => p.status === 'pendente').length ?? 0, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <Clock size={18} /> },
    { label: 'Concluídos', value: prazos?.filter((p) => p.status === 'concluido').length ?? 0, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <CheckCircle size={18} /> },
    { label: 'Vencidos', value: prazos?.filter((p) => p.status === 'vencido').length ?? 0, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <AlertTriangle size={18} /> },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prazos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Controle de prazos processuais</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Prazo</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      {/* alerta vencendo */}
      {vencendo && vencendo.length > 0 && (
        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">{vencendo.length} prazo(s) vencendo nos próximos 7 dias</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {vencendo.map((p) => {
                  const dias = diasRestantes(p.dataVencimento)
                  return (
                    <span key={p.id} className="inline-flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-xs text-amber-700">
                      <Clock size={11} />
                      {p.titulo}
                      <span className="font-bold">{dias <= 0 ? 'hoje' : `${dias}d`}</span>
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <DataCard delay={0.2}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar prazo..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Título', 'Descrição', 'Vencimento', 'Dias', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
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
                      className={`border-b border-gray-50 transition-colors group ${urgente ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-indigo-50/30'}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td className="px-4 py-3.5 font-semibold text-gray-800">{p.titulo}</td>
                      <td className="px-4 py-3.5 text-gray-500 max-w-xs truncate">{p.descricao}</td>
                      <td className="px-4 py-3.5 text-gray-500">{new Date(p.dataVencimento).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-bold ${dias < 0 ? 'text-red-600' : dias <= 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                          {dias < 0 ? `${Math.abs(dias)}d atrás` : dias === 0 ? 'Hoje' : `${dias}d`}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{statusPrazoBadge(p.status)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => remove.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </DataCard>

      {open && (
        <Modal title={editing ? 'Editar Prazo' : 'Novo Prazo'} subtitle="Defina o prazo processual" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select label="Processo" {...register('processoId')}>
              <option value="">Selecione...</option>
              {processos?.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
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
