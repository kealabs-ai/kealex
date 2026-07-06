import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Gavel, Plus, Calendar, MapPin, Users, Sparkles, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { TopBar } from '../components/TopBar'
import { DataCard, EmptyState, StatCard } from '../components/Cards'
import { Modal } from '../components/Modal'
import { Button, Input, Select, Textarea } from '../components/UI'
import type { Audiencia, StatusAudiencia } from '../types'

const MOCK_AUDIENCIAS: Audiencia[] = [
  {
    id: '1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    processoId: 'p1', processoTitulo: 'Ação de Indenização por Danos Morais',
    tipo: 'Conciliação', dataHora: new Date(Date.now() + 5 * 86400000).toISOString(),
    local: '3ª Vara Cível — Fórum João Mendes Jr.', juiz: 'Dr. Carlos Mendes',
    partes: 'João Silva (Autor) x Empresa XYZ Ltda (Réu)',
    roteiro: `## Roteiro de Audiência — Conciliação\n\n**Objetivo:** Buscar acordo extrajudicial.\n\n### Pontos-chave para negociação:\n1. Dano moral comprovado por documentos juntados às fls. 45-67\n2. Valor pleiteado: R$ 15.000,00 — aceitar mínimo de R$ 8.000,00\n3. Prazo de pagamento: à vista ou em até 3 parcelas\n\n### Perguntas para a parte contrária:\n- Qual a proposta de acordo da empresa?\n- Há reconhecimento do dano?\n\n### Teses de blindagem:\n- Precedente STJ: REsp 1.234.567 — dano moral in re ipsa`,
    status: 'agendada',
  },
  {
    id: '2', createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), updatedAt: new Date().toISOString(),
    processoId: 'p2', processoTitulo: 'Ação Trabalhista — Rescisão Indireta',
    tipo: 'Instrução', dataHora: new Date(Date.now() - 2 * 86400000).toISOString(),
    local: '5ª Vara do Trabalho de São Paulo', juiz: 'Dra. Ana Paula Ferreira',
    partes: 'Maria Santos (Reclamante) x Comércio ABC Ltda (Reclamada)',
    status: 'realizada',
  },
]

const statusConfig: Record<StatusAudiencia, { label: string; color: string }> = {
  agendada: { label: 'Agendada', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  realizada: { label: 'Realizada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  cancelada: { label: 'Cancelada', color: 'bg-rose-500/15 text-rose-400 border-rose-500/20' },
  adiada: { label: 'Adiada', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
}

type FormData = {
  processoTitulo: string; tipo: string; dataHora: string
  local: string; juiz: string; partes: string
}

export function AudienciasPage() {
  const [audiencias, setAudiencias] = useState<Audiencia[]>(MOCK_AUDIENCIAS)
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [gerandoRoteiro, setGerandoRoteiro] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<FormData>()

  const stats = [
    { label: 'Total', value: audiencias.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Gavel size={18} /> },
    { label: 'Agendadas', value: audiencias.filter((a) => a.status === 'agendada').length, gradient: 'linear-gradient(135deg,#6366f1,#4f46e5)', icon: <Calendar size={18} /> },
    { label: 'Realizadas', value: audiencias.filter((a) => a.status === 'realizada').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <Gavel size={18} /> },
    { label: 'Canceladas', value: audiencias.filter((a) => a.status === 'cancelada').length, gradient: 'linear-gradient(135deg,#f43f5e,#e11d48)', icon: <Gavel size={18} /> },
  ]

  const onSubmit = (data: FormData) => {
    const nova: Audiencia = {
      id: String(Date.now()), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      processoId: 'new', ...data, status: 'agendada',
    }
    setAudiencias((prev) => [nova, ...prev])
    reset()
    setOpen(false)
  }

  const gerarRoteiro = (id: string) => {
    setGerandoRoteiro(id)
    setTimeout(() => {
      setAudiencias((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                roteiro: `## Roteiro Gerado por IA — ${a.tipo}\n\n**Processo:** ${a.processoTitulo}\n\n### Objetivos da Audiência:\n1. Apresentar teses principais\n2. Ouvir testemunhas arroladas\n3. Requerer produção de provas\n\n### Perguntas para Testemunhas:\n- Descreva os fatos ocorridos em [data]\n- Confirma que estava presente no local?\n- Qual sua relação com as partes?\n\n### Teses de Blindagem:\n- Documentação probatória robusta\n- Precedentes favoráveis no STJ/STF\n- Nulidades processuais a arguir\n\n### Pedidos a Formular:\n- Juntada de documentos\n- Oitiva de testemunhas\n- Perícia técnica (se cabível)`,
              }
            : a
        )
      )
      setGerandoRoteiro(null)
      setExpanded(id)
    }, 2000)
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
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Próximas Audiências
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-indigo-950/30">
            {audiencias.length === 0 ? (
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
                        {/* Date badge */}
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

                          {/* Roteiro expandível */}
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
            <Textarea label="Observações" {...register('partes')} rows={2} placeholder="Notas adicionais..." />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
