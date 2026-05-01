import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, DollarSign, TrendingUp, Search } from 'lucide-react'
import { useHonorarios, useDashboardFinanceiro, useCreateHonorario, useUpdateHonorario, useDeleteHonorario } from '../hooks/useFinanceiro'
import { useProcessos } from '../hooks/useProcessos'
import { useUsuarios } from '../hooks/useUsuarios'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusHonorarioBadge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import type { Honorario, StatusHonorario } from '../types'

type FormData = {
  processoId: string; clienteId: string; descricao: string
  valorCentavos: number; dataVencimento: string
  status?: StatusHonorario; dataPagamento?: string
}

const fmt = (c: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c / 100)

export function FinanceiroPage() {
  const { data: honorarios, isLoading } = useHonorarios()
  const { data: dashboard } = useDashboardFinanceiro()
  const { data: processos } = useProcessos()
  const { data: clientes } = useUsuarios('cliente')
  const create = useCreateHonorario()
  const update = useUpdateHonorario()
  const remove = useDeleteHonorario()
  const [editing, setEditing] = useState<Honorario | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (h: Honorario) => {
    reset({ ...h, dataVencimento: h.dataVencimento.slice(0, 10), dataPagamento: h.dataPagamento?.slice(0, 10) })
    setEditing(h); setOpen(true)
  }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    const payload = { ...data, valorCentavos: Number(data.valorCentavos) }
    if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess: close })
    else create.mutate(payload, { onSuccess: close })
  }

  const filtered = honorarios?.filter((h) => h.descricao.toLowerCase().includes(search.toLowerCase())) ?? []

  const stats = dashboard ? [
    { label: 'Total Geral', value: fmt(dashboard.totalGeral), gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <TrendingUp size={18} /> },
    { label: 'Pago', value: fmt(dashboard.totalPago), gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <DollarSign size={18} /> },
    { label: 'Pendente', value: fmt(dashboard.totalPendente), gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <DollarSign size={18} /> },
    { label: 'Vencido', value: fmt(dashboard.totalVencido), gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <DollarSign size={18} /> },
  ] : []

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Honorários e faturamento</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Honorário</Button>
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>
      )}

      <DataCard delay={0.2}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar honorário..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Descrição', 'Valor', 'Vencimento', 'Pagamento', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}><EmptyState message="Nenhum honorário encontrado" icon={<DollarSign size={28} className="text-gray-300" />} /></td></tr>
            ) : (
              <AnimatePresence>
                {filtered.map((h, i) => (
                  <motion.tr
                    key={h.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-4 py-3.5 font-semibold text-gray-800">{h.descricao}</td>
                    <td className="px-4 py-3.5 font-mono font-semibold text-gray-900">{fmt(h.valorCentavos)}</td>
                    <td className="px-4 py-3.5 text-gray-500">{new Date(h.dataVencimento).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3.5 text-gray-500">{h.dataPagamento ? new Date(h.dataPagamento).toLocaleDateString('pt-BR') : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3.5">{statusHonorarioBadge(h.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(h)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => remove.mutate(h.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
        <Modal title={editing ? 'Editar Honorário' : 'Novo Honorário'} subtitle="Registre os honorários do processo" onClose={close} size="lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Select label="Processo" {...register('processoId')}>
                <option value="">Selecione...</option>
                {processos?.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
              </Select>
              <Select label="Cliente" {...register('clienteId')}>
                <option value="">Selecione...</option>
                {clientes?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </div>
            <Input label="Descrição" {...register('descricao')} placeholder="Ex: Honorários advocatícios" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Valor (centavos)" {...register('valorCentavos')} type="number" placeholder="Ex: 150000 = R$ 1.500,00" />
              <Input label="Data de Vencimento" {...register('dataVencimento')} type="date" />
            </div>
            {editing && (
              <div className="grid grid-cols-2 gap-3">
                <Select label="Status" {...register('status')}>
                  {['pendente', 'pago', 'vencido', 'cancelado'].map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                <Input label="Data de Pagamento" {...register('dataPagamento')} type="date" />
              </div>
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
