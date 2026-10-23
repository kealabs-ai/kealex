import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Briefcase, Search, FileText, Download, CircleCheck, Archive, CircleX, FolderOpen } from 'lucide-react'
import { useProcessos, useCreateProcesso, useUpdateProcesso, useDeleteProcesso, useAvancarFase } from '../hooks/useProcessos'
import { useClientes } from '../hooks/useClientes'
import { ProcessoTimeline } from '../components/ProcessoTimeline'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState } from '../components/Cards'
import { statusProcessoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { gerarGuiaTJMG } from '../utils/guiaGenerator'
import type { Processo, StatusProcesso } from '../types'

type FormData = {
  numero: string; titulo: string; descricao: string
  clienteId: string; vara: string; tribunal: string
  status?: StatusProcesso
}

export function ProcessosPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const { data: processos, isLoading, isError } = useProcessos()
  const isCliente = user?.role === 'cliente'
  const { data: clientes } = useClientes()
  const create = useCreateProcesso()
  const update = useUpdateProcesso()
  const remove = useDeleteProcesso()
  const avancarFase = useAvancarFase()
  const [editing, setEditing] = useState<Processo | null>(null)
  const [open, setOpen] = useState(false)
  const [guiaOpen, setGuiaOpen] = useState(false)
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Processo | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tribunalFilter, setTribunalFilter] = useState('todos')
  const [clienteFilter, setClienteFilter] = useState('todos')
  const [customFases, setCustomFases] = useState<string[]>([])
  const [novaFase, setNovaFase] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()
  const { register: registerGuia, handleSubmit: handleSubmitGuia, reset: resetGuia } = useForm<{
    tipo: string; valor: string; vencimento: string; descricao: string
  }>()

  const openCreate = () => { reset({}); setEditing(null); setCustomFases([]); setNovaFase(''); setOpen(true) }
  const openEdit = (p: Processo) => { reset({ numero: p.numero, titulo: p.titulo, descricao: p.descricao, clienteId: p.clienteId, vara: p.vara, tribunal: p.tribunal, status: p.status }); setEditing(p); setOpen(true) }
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

  const onSubmitGuia = async (data: any) => {
    if (!selectedProcesso) return
    
    try {
      await gerarGuiaTJMG({
        numeroProcesso: selectedProcesso.numero,
        titulo: selectedProcesso.titulo,
        vara: selectedProcesso.vara,
        tribunal: selectedProcesso.tribunal,
        clienteNome: selectedProcesso.clienteNome || 'Cliente',
        tipo: data.tipo,
        valor: parseFloat(data.valor),
        vencimento: data.vencimento,
        descricao: data.descricao
      })
      success('Guia gerada e baixada com sucesso!')
      closeGuia()
    } catch (error) {
      toastError('Erro ao gerar guia. Tente novamente.')
    }
  }

  const onSubmit = (data: FormData) => {
    const payload = customFases.length > 0 ? { ...data, fases: customFases } : data
    if (editing) update.mutate({ id: editing.id, data: payload as any }, { onSuccess: close })
    else create.mutate(payload as any, { onSuccess: close })
  }

  const allProcessos = Array.isArray(processos) ? processos : []
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const tribunalOptions = [...new Set(allProcessos.map((p) => p.tribunal).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const clienteOptions = [...new Map(allProcessos.filter((p) => p.clienteId).map((p) => [p.clienteId, p.clienteNome || 'Cliente']))]
    .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
  const displayProcessos = allProcessos.filter((p) => {
    const matchesSearch = [p.titulo, p.numero, p.clienteNome, p.tribunal, p.vara]
      .some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
    return matchesSearch
      && (statusFilter === 'todos' || p.status === statusFilter)
      && (tribunalFilter === 'todos' || p.tribunal === tribunalFilter)
      && (clienteFilter === 'todos' || p.clienteId === clienteFilter)
  })
  const activeFilterCount = [search.trim(), statusFilter !== 'todos', tribunalFilter !== 'todos', clienteFilter !== 'todos'].filter(Boolean).length

  const stats = [
    { label: 'Total de Processos', value: allProcessos.length, description: 'Todos os processos cadastrados', tone: 'blue', icon: <Briefcase size={20} /> },
    { label: 'Processos Ativos', value: allProcessos.filter((p) => p.status === 'ativo').length, description: 'Em andamento', tone: 'green', icon: <CircleCheck size={20} /> },
    { label: 'Arquivados', value: allProcessos.filter((p) => p.status === 'arquivado').length, description: 'Processos arquivados', tone: 'orange', icon: <Archive size={20} /> },
    { label: 'Encerrados', value: allProcessos.filter((p) => p.status === 'encerrado').length, description: 'Processos finalizados', tone: 'red', icon: <CircleX size={20} /> },
  ]

  return (
    <div className="kea-process-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content">
        <PageBanner
          title="Processos & Fases"
          description={isCliente ? 'Acompanhe seus processos jurídicos e consulte suas fases.' : 'Gerencie seus processos com uma esteira de fases interativa e acompanhe prazos, movimentações e documentos em um só lugar.'}
          action={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Processo</Button>}
        />
        <div className="kea-process-stats">
          {stats.map((stat) => (
            <article key={stat.label} className={`kea-process-stat is-${stat.tone}`}>
              <span className="kea-process-stat-icon">{stat.icon}</span>
              <div className="kea-process-stat-copy"><span>{stat.label}</span><strong>{isLoading || isError ? '—' : stat.value}</strong><small>{stat.description}</small></div>
              <span className="kea-process-stat-accent" />
            </article>
          ))}
        </div>

        <DataCard delay={0.2} className="kea-process-filter-card">
          <div className="kea-process-filters">
            <div className="kea-process-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, número, cliente, tribunal ou vara..."
                aria-label="Buscar processos"
              />
            </div>
            <label className="kea-process-status-filter"><span>Status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status"><option value="todos">Todos</option><option value="ativo">Ativos</option><option value="arquivado">Arquivados</option><option value="encerrado">Encerrados</option></select></label>
            <label className="kea-process-status-filter"><span>Tribunal</span><select value={tribunalFilter} onChange={(e) => setTribunalFilter(e.target.value)} aria-label="Filtrar por tribunal"><option value="todos">Todos</option>{tribunalOptions.map((tribunal) => <option key={tribunal} value={tribunal}>{tribunal}</option>)}</select></label>
            <label className="kea-process-status-filter"><span>Cliente</span><select value={clienteFilter} onChange={(e) => setClienteFilter(e.target.value)} aria-label="Filtrar por cliente"><option value="todos">Todos</option>{clienteOptions.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
            {(search || statusFilter !== 'todos' || tribunalFilter !== 'todos' || clienteFilter !== 'todos') && <button type="button" className="kea-process-clear" onClick={() => { setSearch(''); setStatusFilter('todos'); setTribunalFilter('todos'); setClienteFilter('todos') }}>Limpar</button>}
            {activeFilterCount > 0 && <span className="kea-process-active-filter-count" aria-live="polite">{activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} ativo{activeFilterCount === 1 ? '' : 's'}</span>}
          </div>
          <div className="kea-process-list-heading"><h2>Processos cadastrados</h2><span>{isLoading ? 'Carregando…' : `${displayProcessos.length} ${displayProcessos.length === 1 ? 'registro' : 'registros'}`}</span></div>
          <div className="kea-process-list">
            {isError ? (
              <p className="kea-process-empty-error" role="alert">Não foi possível carregar os processos. Tente novamente em instantes.</p>
            ) : isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} variant="list" />)
            ) : displayProcessos.length === 0 ? (
              <div className="p-8"><EmptyState message="Nenhum processo encontrado" icon={<Briefcase size={28} className="text-slate-300" />} /></div>
            ) : (
              <AnimatePresence>
                {displayProcessos.map((p, i) => {
                  return (
                    <motion.div
                      key={p.id}
                      className="kea-process-record"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="kea-process-record-main">
                        <div className="kea-process-identification">
                          <span className="kea-process-folder"><FolderOpen size={21} /></span>
                          <div className="kea-process-identification-copy">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{p.numero}</span>
                            {statusProcessoBadge(p.status)}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{p.titulo}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {p.clienteNome} • {p.vara} • {p.tribunal}
                          </p>

                          </div>
                        </div>
                        <div className="kea-process-phase-column">
                          <div className="kea-process-phase-summary">
                            <span>Fase atual</span>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-indigo-950/40">
                              <ProcessoTimeline
                                fases={p.fases}
                                faseAtual={p.faseAtual}
                                readonly={isCliente}
                                isLoading={avancarFase.isPending}
                                onAvancar={(novaFase) => {
                                  avancarFase.mutate({ id: p.id, faseAtual: novaFase })
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="kea-process-actions">
                          <motion.button
                            onClick={() => openGuia(p)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                            aria-label="Emitir guia"
                            title="Emitir Guia"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FileText size={20} />
                          </motion.button>
                          {!isCliente && (
                            <>
                              <motion.button
                                onClick={() => openEdit(p)}
                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                                aria-label="Editar processo"
                                title="Editar Processo"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Pencil size={20} />
                              </motion.button>
                              <motion.button
                                onClick={() => setConfirmDelete(p)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                                aria-label="Excluir processo"
                                title="Excluir Processo"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={20} />
                              </motion.button>
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
            
            <div className="border-t border-slate-100 dark:border-indigo-950/40 pt-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Fases do Processo</p>
              <div className="space-y-2 mb-3">
                {customFases.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Nenhuma fase adicionada. Use as padrões ou crie customizadas.</p>
                ) : (
                  customFases.map((fase, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{idx + 1}. {fase}</span>
                      <button
                        type="button"
                        onClick={() => setCustomFases(customFases.filter((_, i) => i !== idx))}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaFase}
                  onChange={(e) => setNovaFase(e.target.value)}
                  placeholder="Ex: Distribuição, Citação..."
                  className="flex-1 px-3 py-2 text-sm bg-transparent border border-slate-200 dark:border-indigo-950/60 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && novaFase.trim()) {
                      setCustomFases([...customFases, novaFase.trim()])
                      setNovaFase('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (novaFase.trim()) {
                      setCustomFases([...customFases, novaFase.trim()])
                      setNovaFase('')
                    }
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  Adicionar
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Confirmar Exclusão" onClose={() => setConfirmDelete(null)} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <Trash2 size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">Excluir o processo <strong>{confirmDelete.numero}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}>Excluir</Button>
            </div>
          </div>
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
                💡 A guia será gerada em formato PDF com código de barras para pagamento bancário e símbolo da justiça federal.
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
