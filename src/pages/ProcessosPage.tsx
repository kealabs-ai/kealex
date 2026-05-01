import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Briefcase, Search, Filter } from 'lucide-react'
import { useProcessos, useCreateProcesso, useUpdateProcesso, useDeleteProcesso } from '../hooks/useProcessos'
import { useUsuarios } from '../hooks/useUsuarios'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusProcessoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import type { Processo, StatusProcesso } from '../types'

type FormData = {
  numero: string; titulo: string; descricao: string
  clienteId: string; vara: string; tribunal: string
  status?: StatusProcesso
}

export function ProcessosPage() {
  const { data: processos, isLoading } = useProcessos()
  const { data: clientes } = useUsuarios('cliente')
  const create = useCreateProcesso()
  const update = useUpdateProcesso()
  const remove = useDeleteProcesso()
  const [editing, setEditing] = useState<Processo | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (p: Processo) => { reset(p); setEditing(p); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data as any, { onSuccess: close })
  }

  const filtered = processos?.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.numero.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const stats = [
    { label: 'Total', value: processos?.length ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Briefcase size={18} /> },
    { label: 'Ativos', value: processos?.filter((p) => p.status === 'ativo').length ?? 0, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <Briefcase size={18} /> },
    { label: 'Arquivados', value: processos?.filter((p) => p.status === 'arquivado').length ?? 0, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <Briefcase size={18} /> },
    { label: 'Encerrados', value: processos?.filter((p) => p.status === 'encerrado').length ?? 0, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <Briefcase size={18} /> },
  ]

  return (
    <div className="p-8 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie todos os processos jurídicos</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Processo</Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.08} />
        ))}
      </div>

      {/* table */}
      <DataCard delay={0.2}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título ou número..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
            />
          </div>
          <Button variant="secondary" size="sm" icon={<Filter size={13} />}>Filtrar</Button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Número', 'Título', 'Vara', 'Tribunal', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState message="Nenhum processo encontrado" icon={<Briefcase size={28} className="text-gray-300" />} /></td></tr>
            ) : (
              <AnimatePresence>
                {filtered.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-gray-500 bg-gray-50/50">{p.numero}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{p.titulo}</td>
                    <td className="px-4 py-3.5 text-gray-500">{p.vara}</td>
                    <td className="px-4 py-3.5 text-gray-500">{p.tribunal}</td>
                    <td className="px-4 py-3.5">{statusProcessoBadge(p.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => remove.mutate(p.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </DataCard>

      {open && (
        <Modal
          title={editing ? 'Editar Processo' : 'Novo Processo'}
          subtitle={editing ? `Editando: ${editing.numero}` : 'Preencha os dados do novo processo'}
          onClose={close}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número" {...register('numero')} placeholder="0001234-56.2024" />
              <Input label="Título" {...register('titulo')} placeholder="Ex: Ação Civil" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Vara" {...register('vara')} placeholder="1ª Vara Cível" />
              <Input label="Tribunal" {...register('tribunal')} placeholder="TJSP" />
            </div>
            <Textarea label="Descrição" {...register('descricao')} rows={3} placeholder="Descreva o processo..." />
            <Select label="Cliente" {...register('clienteId')}>
              <option value="">Selecione o cliente...</option>
              {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            {editing && (
              <Select label="Status" {...register('status')}>
                {['ativo', 'arquivado', 'encerrado'].map((s) => <option key={s} value={s}>{s}</option>)}
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
