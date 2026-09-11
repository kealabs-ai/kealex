import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Plus, Calendar, MapPin, Users, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { DataCard, EmptyState, StatCard, SkeletonRow } from '../components/Cards'
import { Modal } from '../components/Modal'
import { Button, Input, Select, Textarea } from '../components/UI'
import { useAudiencias, useCreateAudiencia, useUpdateAudiencia } from '../hooks/useIntimacoes'
import type { StatusAudiencia } from '../types'

const statusConfig: Record<StatusAudiencia, { label: string; color: string }> = {
  agendada: { label: 'Agendada', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  realizada: { label: 'Realizada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  cancelada: { label: 'Cancelada', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  adiada: { label: 'Adiada', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
}

type FormData = {
  processoTitulo: string; tipo: string; dataHora: string
  local: string; juiz: string; partes: string; observacoes?: string
}

export function AudienciasPage() {
  const { data, isLoading } = useAudiencias()
  const create = useCreateAudiencia()
  const update = useUpdateAudiencia()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gerandoRoteiro, setGerandoRoteiro] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<FormData>()

  const audiencias = Array.isArray(data) ? data : []

  const stats = [
    { label: 'Total', value: audiencias.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Gavel size={18} /> },
    { label: 'Agendadas', value: audiencias.filter((a) => a.status === 'agendada').length, gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: <Calendar size={18} /> },
    { label: 'Realizadas', value: audiencias.filter((a) => a.status === 'realizada').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <Gavel size={18} /> },
    { label: 'Canceladas', value: audiencias.filter((a) => a.status === 'cancelada').length, gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: <Gavel size={18} /> },
  ]

  const onSubmit = (data: FormData) => {
    create.mutate(
      { processoId: '', ...data, status: 'agendada' } as any,
      { onSuccess: () => { reset(); setOpen(false) } }
    )
  }

  const gerarRoteiro = (id: string) => {
    const aud = audiencias.find((a) => a.id === id)
    if (!aud) return
    setGerandoRoteiro(id)
    const roteiro = `## Roteiro Gerado por IA — ${aud.tipo}\n\n**Processo:** ${aud.processoTitulo}\n\n### Objetivos da Audiência:\n1. Apresentar teses principais\n2. Ouvir testemunhas arroladas\n3. Requerer produção de provas\n\n### Perguntas para Testemunhas:\n- Descreva os fatos ocorridos\n- Confirma que estava presente no local?\n- Qual sua relação com as partes?\n\n### Teses de Blindagem:\n- Documentação probatória robusta\n- Precedentes favoráveis no STJ/STF\n\n### Pedidos a Formular:\n- Juntada de documentos\n- Oitiva de testemunhas\n- Perícia técnica (se cabível)`
    setTimeout(() => {
      update.mutate(
        { id, data: { roteiro } },
        { onSuccess: () => { setGerandoRoteiro(null); setExpanded(id) } }
      )
    }, 1500)
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-transparent">
      <TopBar
        icon={Gavel}
        title="Audiências Estratégicas"
        subtitle="Preparação e roteiros inteligentes para audiências"
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>
            Nova Audiência
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.07} />)}
        </div>

        <DataCard delay={0.2}>
          <div className="p-4 border-b border-slate-100 dark:border-indigo-950/40">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Próximas Audiências</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-indigo-950/30">
            {isLoading ? (
              [...Array(3)].map((_, i) => <SkeletonRow key={i} variant="list" />)
            ) : audiencias.length === 0 ? (
              <EmptyState message="Nenhuma audiência cadastrada" icon={<Gavel size={28} className="text-slate-300" />} />
            ) : (
              <AnimatePresence>
                {audiencias.map((aud, i) => {
                  const cfg = statusConfig[aud.status]
                  const isExpanded = expanded === aud.id
                  const dataHora = new Date(aud.dataHora)
                  const isFutura = dataHora > new Date()

                  return (
                    <motion.div
                      key={aud.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-indigo-950/20 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 text-center p-2.5 rounded-xl min-w-[52px] ${isFutura ? 'bg-indigo-600 shadow-md shadow-indigo-600/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          <p className={`text-lg font-bold leading-none ${isFutura ? 'text-white' : 'text-slate-500'}`}>
                            {dataHora.getDate()}
                          </p>
                          <p className={`text-[10px] font-medium uppercase ${isFutura ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {dataHora.toLocaleDateString('pt-BR', { month: 'short' })}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              {aud.tipo}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                            {aud.processoTitulo}
                          </p>

                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={11} />
                              {aud.local}
                            </span>
                            {aud.partes && (
                              <span className="flex items-center gap-1">
                                <Users size={11} />
                                {aud.partes}
                              </span>
                            )}
                          </div>

                          <AnimatePresence>
                            {isExpanded && aud.roteiro && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 p-4 bg-indigo-950/30 border border-indigo-500/15 rounded-xl">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={13} className="text-indigo-400" />
                                    <span className="text-xs font-semibold text-indigo-400">Roteiro Estratégico</span>
                                  </div>
                                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                                    {aud.roteiro}
                                  </pre>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0">
                          {aud.roteiro ? (
                            <button
                              onClick={() => setExpanded(isExpanded ? null : aud.id)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                            >
                              Roteiro {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            </button>
                          ) : (
                            <button
                              onClick={() => gerarRoteiro(aud.id)}
                              disabled={gerandoRoteiro === aud.id}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-all disabled:opacity-60"
                            >
                              <Sparkles size={11} className={gerandoRoteiro === aud.id ? 'animate-spin' : ''} />
                              {gerandoRoteiro === aud.id ? 'Gerando...' : 'Gerar IA'}
                            </button>
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

      {open && (
        <Modal title="Nova Audiência" subtitle="Cadastre uma audiência para preparação estratégica" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Processo / Título" {...register('processoTitulo')} placeholder="Ex: Ação de Indenização..." />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Tipo" {...register('tipo')}>
                <option value="Conciliação">Conciliação</option>
                <option value="Instrução">Instrução</option>
                <option value="Julgamento">Julgamento</option>
                <option value="Mediação">Mediação</option>
                <option value="Depoimento">Depoimento Pessoal</option>
              </Select>
              <Input label="Data e Hora" type="datetime-local" {...register('dataHora')} />
            </div>
            <Input label="Local / Vara" {...register('local')} placeholder="Ex: 3ª Vara Cível — Fórum Central" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Juiz(a)" {...register('juiz')} placeholder="Dr(a). Nome" />
              <Input label="Partes" {...register('partes')} placeholder="Autor x Réu" />
            </div>
            <Textarea label="Observações" {...register('observacoes')} rows={2} placeholder="Notas adicionais..." />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={create.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
