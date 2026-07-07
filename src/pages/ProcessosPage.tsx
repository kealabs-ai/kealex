import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Briefcase, Search, Filter, FileText, Download } from 'lucide-react'
import { useProcessos, useCreateProcesso, useUpdateProcesso, useDeleteProcesso } from '../hooks/useProcessos'
import { useClientes } from '../hooks/useClientes'
import { ProcessoTimeline } from '../components/ProcessoTimeline'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusProcessoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import type { Processo, StatusProcesso } from '../types'

type FormData = {
  numero: string; titulo: string; descricao: string
  clienteId: string; vara: string; tribunal: string
  status?: StatusProcesso
}

export function ProcessosPage() {
  const { user } = useAuth()
  const { data: processos, isLoading } = useProcessos()
  const isCliente = user?.role === 'cliente'
  const { data: clientes } = !isCliente ? useClientes() : { data: undefined }
  const create = useCreateProcesso()
  const update = useUpdateProcesso()
  const remove = useDeleteProcesso()
  const [editing, setEditing] = useState<Processo | null>(null)
  const [open, setOpen] = useState(false)
  const [guiaOpen, setGuiaOpen] = useState(false)
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null)
  const [expandedTimeline, setExpandedTimeline] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()
  const { register: registerGuia, handleSubmit: handleSubmitGuia, reset: resetGuia } = useForm<{
    tipo: string; valor: string; vencimento: string; descricao: string
  }>()

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (p: Processo) => { reset(p); setEditing(p); setOpen(true) }
  const close = () => setOpen(false)

  const openGuia = (p: Processo) => {
    setSelectedProcesso(p)
    resetGuia({
      tipo: 'custas',
      valor: '',
      vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      descricao: `Guia de pagamento - Processo ${p.numero}`
    })
    setGuiaOpen(true)
  }
  const closeGuia = () => setGuiaOpen(false)

  const onSubmitGuia = (data: any) => {
    const guia = {
      processo: selectedProcesso?.numero,
      tipo: data.tipo,
      valor: parseFloat(data.valor),
      vencimento: data.vencimento,
      descricao: data.descricao,
      codigoBarras: '23793.38128 60000.123456 78901.234567 8 12340000012345'
    }
    alert(`Guia gerada com sucesso!\n\nProcesso: ${guia.processo}\nTipo: ${guia.tipo}\nValor: R$ ${guia.valor.toFixed(2)}\nVencimento: ${new Date(guia.vencimento).toLocaleDateString('pt-BR')}\n\nCódigo de Barras:\n${guia.codigoBarras}\n\nEm produção, um PDF seria gerado e baixado automaticamente.`)
    closeGuia()
  }

  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data as any, { onSuccess: close })
  }

  const displayProcessos = processos?.filter((p) =>
    p.titulo.toLowerCase().includes(search.toLowerCase()) ||
    p.numero.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const stats = [
    { label: 'Total', value: displayProcessos?.length ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Briefcase size={18} /> },
    { label: 'Ativos', value: displayProcessos?.filter((p) => p.status === 'ativo').length ?? 0, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <Briefcase size={18} /> },
    { label: 'Arquivados', value: displayProcessos?.filter((p) => p.status === 'arquivado').length ?? 0, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <Briefcase size={18} /> },
    { label: 'Encerrados', value: displayProcessos?.filter((p) => p.status === 'encerrado').length ?? 0, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <Briefcase size={18} /> },
  ]

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-transparent">
      <TopBar
        icon={Briefcase}
        title="Processos & Fases"
        subtitle={isCliente ? "Acompanhe seus processos jurídicos" : "Gerencie processos com esteira de fases interativa"}
        actions={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Processo</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.07} />
          ))}
        </div>

        <DataCard delay={0.2}>
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-indigo-950/40">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou número..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-slate-200 dark:border-indigo-950/60 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            <Button variant="secondary" size="sm" icon={<Filter size={13} />}>Filtrar</Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-indigo-950/30">
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : displayProcessos.length === 0 ? (
              <div className="p-8"><EmptyState message="Nenhum processo encontrado" icon={<Briefcase size={28} className="text-slate-300" />} /></div>
            ) : (
              <AnimatePresence>
                {displayProcessos.map((p, i) => {
                  const isExpanded = expandedTimeline === p.id
                  return (
                    <motion.div
                      key={p.id}
                      className="p-4 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all duration-200"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{p.numero}</span>
                            {statusProcessoBadge(p.status)}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{p.titulo}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {p.clienteNome} • {p.vara} • {p.tribunal}
                          </p>

                          {/* Timeline expandível */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-indigo-950/40">
                                  <ProcessoTimeline fases={p.fases} faseAtual={p.faseAtual} readonly={isCliente} />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          <button
                            onClick={() => setExpandedTimeline(isExpanded ? null : p.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                          >
                            Fases {isExpanded ? '−' : '+'}
                          </button>
                          <button onClick={() => openGuia(p)} className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all" title="Emitir Guia">
                            <FileText size={11} className="inline mr-1" /> Guia
                          </button>
                          {!isCliente && (
                            <>
                              <button onClick={() => openEdit(p)} className="px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all">
                                <Pencil size={11} className="inline mr-1" /> Editar
                              </button>
                              <button onClick={() => remove.mutate(p.id)} className="px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all">
                                <Trash2 size={11} className="inline mr-1" /> Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </DataCard>
      </div>

      {open && !isCliente && (
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
              {Array.isArray(clientes) && clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
            {editing && (
              <Select label="Status" {...register('status')}>
                {['ativo', 'arquivado', 'encerrado'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}

      {guiaOpen && selectedProcesso && (
        <Modal
          title="Emitir Guia de Pagamento"
          subtitle={`Processo: ${selectedProcesso.numero} - ${selectedProcesso.titulo}`}
          onClose={closeGuia}
        >
          <form onSubmit={handleSubmitGuia(onSubmitGuia)} className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Processo Selecionado</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-mono">{selectedProcesso.numero}</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">{selectedProcesso.titulo}</p>
            </div>

            <Select label="Tipo de Guia" {...registerGuia('tipo')}>
              <option value="custas">Custas Processuais</option>
              <option value="honorarios">Honorários Periciais</option>
              <option value="deposito">Depósito Judicial</option>
              <option value="multa">Multa</option>
              <option value="outro">Outro</option>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...registerGuia('valor')}
              />
              <Input
                label="Vencimento"
                type="date"
                {...registerGuia('vencimento')}
              />
            </div>

            <Textarea
              label="Descrição"
              rows={3}
              placeholder="Detalhes do pagamento..."
              {...registerGuia('descricao')}
            />

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                💡 A guia será gerada em formato PDF com código de barras para pagamento bancário.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={closeGuia}>Cancelar</Button>
              <Button type="submit" icon={<Download size={15} />}>Gerar e Baixar Guia</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
