import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Search, Plus, X, CreditCard, ShieldCheck } from 'lucide-react'
import { useCobrancas, useProximaFase, useCancelarCobranca, useCreateCobranca, useCobrancaTimeline, usePagarCobranca } from '../hooks/useCobrancaFluxo'
import { useClientes } from '../hooks/useClientes'
import { useProcessos } from '../hooks/useProcessos'
import { CobrancaFluxoComponent } from '../components/CobrancaFluxo'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { assinaturaApi } from '../api/assinatura'
import type { CobrancaTimeline, PagamentoCartaoPayload } from '../api/cobrancas'
import { fmt } from '../utils/formatters'

// Componente wrapper para carregar a timeline de cada cobrança sob demanda
function CobrancaCard({
  cobranca,
  clienteNome,
  processoTitulo,
  processoNumero,
  onProximaFase,
  onMarcarPago,
  onCancelar,
}: {
  cobranca: Parameters<typeof CobrancaFluxoComponent>[0]['cobranca']
  clienteNome?: string
  processoTitulo?: string
  processoNumero?: string
  onProximaFase: (id: string) => void
  onMarcarPago: (id: string) => void
  onCancelar: (id: string) => void
}) {
  const [timelineId, setTimelineId] = useState<string | undefined>()
  const { data: timeline } = useCobrancaTimeline(timelineId)

  return (
    <CobrancaFluxoComponent
      cobranca={cobranca}
      clienteNome={clienteNome}
      processoTitulo={processoTitulo}
      processoNumero={processoNumero}
      timeline={timeline as CobrancaTimeline | undefined}
      onProximaFase={onProximaFase}
      onMarcarPago={onMarcarPago}
      onCancelar={onCancelar}
      onLoadTimeline={(id) => setTimelineId(id)}
    />
  )
}

export function CobrancaPage() {
  const { user } = useAuth()
  const { data: cobrancas = [], isLoading } = useCobrancas()
  const { data: clientes = [] } = useClientes()
  const { data: processos = [] } = useProcessos()
  const { data: billingProfile } = useQuery({
    queryKey: ['billing-profile', user?.tenantId],
    queryFn: assinaturaApi.billingProfile,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  })

  const proximaFase = useProximaFase()
  const pagar = usePagarCobranca()
  const cancelar = useCancelarCobranca()
  const criar = useCreateCobranca()
  const { error: toastError, success: toastSuccess } = useToast()

  const [search, setSearch] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendente' | 'pago' | 'cancelado'>('todos')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ processoId: '', clienteId: '', valorCentavos: '', dataVencimento: '' })
  const [pagamentoModal, setPagamentoModal] = useState<{ id: string; descricao: string } | null>(null)

  const PAGAMENTO_INICIAL = {
    holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '',
    name: '', email: '', cpfCnpj: '', postalCode: '', addressNumber: '', phone: '',
  }
  const [pagForm, setPagForm] = useState(PAGAMENTO_INICIAL)

  function formatCard(v: string) { return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }
  function formatCpf(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 14)
    if (d.length <= 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '')
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5').replace(/-$/, '')
  }
  function formatCep(v: string) { const d = v.replace(/\D/g, '').slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d }
  function formatPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  }

  function pagamentoValido() {
    const num = pagForm.number.replace(/\D/g, '')
    const cpf = pagForm.cpfCnpj.replace(/\D/g, '')
    const cep = pagForm.postalCode.replace(/\D/g, '')
    return pagForm.holderName.trim().length >= 3 && num.length >= 13
      && /^\d{1,2}$/.test(pagForm.expiryMonth) && /^\d{4}$/.test(pagForm.expiryYear)
      && /^\d{3,4}$/.test(pagForm.ccv) && pagForm.name.trim().length >= 3
      && pagForm.email.includes('@') && [11, 14].includes(cpf.length)
      && cep.length === 8 && pagForm.addressNumber.trim().length > 0
  }

  async function handlePagar() {
    if (!pagamentoModal) return
    try {
      // Cria ou recupera o customer no Asaas com os dados do titular preenchidos
      const { customerId } = await assinaturaApi.criarClienteAsaas({
        name: pagForm.name,
        email: pagForm.email,
        cpfCnpj: pagForm.cpfCnpj.replace(/\D/g, ''),
        postalCode: pagForm.postalCode.replace(/\D/g, ''),
        addressNumber: pagForm.addressNumber,
        phone: pagForm.phone.replace(/\D/g, '') || undefined,
      })
      const payload: PagamentoCartaoPayload = {
        cobrancaId: pagamentoModal.id,
        customer: customerId,
        billingType: 'CREDIT_CARD',
        description: pagamentoModal.descricao,
        creditCard: {
          holderName: pagForm.holderName,
          number: pagForm.number.replace(/\D/g, ''),
          expiryMonth: pagForm.expiryMonth,
          expiryYear: pagForm.expiryYear,
          ccv: pagForm.ccv,
        },
        creditCardHolderInfo: {
          name: pagForm.name,
          email: pagForm.email,
          cpfCnpj: pagForm.cpfCnpj.replace(/\D/g, ''),
          postalCode: pagForm.postalCode.replace(/\D/g, ''),
          addressNumber: pagForm.addressNumber,
          phone: pagForm.phone.replace(/\D/g, '') || undefined,
        },
      }
      await pagar.mutateAsync(payload)
      toastSuccess('Pagamento confirmado com sucesso!')
      setPagamentoModal(null)
      setPagForm(PAGAMENTO_INICIAL)
    } catch (err: any) {
      toastError(err?.response?.data?.detail ?? 'Erro ao processar pagamento. Verifique os dados do cartão.')
    }
  }

  // Mapas para lookup rápido
  const clienteMap = Object.fromEntries((Array.isArray(clientes) ? clientes : []).map((c) => [c.id, c]))
  const processoMap = Object.fromEntries((Array.isArray(processos) ? processos : []).map((p) => [p.id, p]))

  // Processos filtrados pelo cliente selecionado no modal
  const processosDoCliente = form.clienteId
    ? (Array.isArray(processos) ? processos : []).filter((p) => p.clienteId === form.clienteId)
    : (Array.isArray(processos) ? processos : [])

  const filtered = cobrancas.filter((c) => {
    const cliente = clienteMap[c.clienteId]
    const processo = processoMap[c.processoId]
    const term = search.toLowerCase()
    const matchSearch =
      !term ||
      cliente?.nome?.toLowerCase().includes(term) ||
      processo?.titulo?.toLowerCase().includes(term) ||
      processo?.numero?.toLowerCase().includes(term)
    const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus
    return matchSearch && matchStatus
  })

  const stats = [
    {
      label: 'Total em Cobrança',
      value: fmt(filtered.filter((c) => c.status !== 'cancelado').reduce((acc, c) => acc + c.valorCentavos, 0)),
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
      icon: <TrendingUp size={18} />,
    },
    {
      label: 'Pendentes',
      value: filtered.filter((c) => c.status === 'pendente' && c.faseAtual < 2).length,
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
      icon: <Clock size={18} />,
    },
    {
      label: 'Em Cobrança',
      value: filtered.filter((c) => c.status === 'pendente' && c.faseAtual >= 2).length,
      gradient: 'linear-gradient(135deg,#ef4444,#dc2626)',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: 'Pagos',
      value: filtered.filter((c) => c.status === 'pago').length,
      gradient: 'linear-gradient(135deg,#10b981,#059669)',
      icon: <CheckCircle size={18} />,
    },
  ]

  const handleCriar = async () => {
    if (!form.processoId || !form.clienteId || !form.valorCentavos) return
    await criar.mutateAsync({
      processoId: form.processoId,
      clienteId: form.clienteId,
      valorCentavos: Math.round(parseFloat(form.valorCentavos) * 100),
      dataVencimento: form.dataVencimento || undefined,
    })
    setShowModal(false)
    setForm({ processoId: '', clienteId: '', valorCentavos: '', dataVencimento: '' })
  }

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all'
  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1 uppercase tracking-wide'

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
      <TopBar
        icon={TrendingUp}
        title="Gestão de Cobrança"
        subtitle="Acompanhe o fluxo de cobrança vinculado a clientes e processos"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={15} className="mr-1" />Nova Cobrança
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        {/* Filtros */}
        <motion.div
          className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente, processo ou número..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              {(['todos', 'pendente', 'pago', 'cancelado'] as const).map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filtroStatus === s
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Lista */}
        {isLoading ? (
          <DataCard delay={0.3}>
            <div className="space-y-4">{[...Array(3)].map((_, i) => <SkeletonRow key={i} variant="list" />)}</div>
          </DataCard>
        ) : filtered.length === 0 ? (
          <DataCard delay={0.3}>
            <EmptyState
              message="Nenhuma cobrança encontrada"
              icon={<TrendingUp size={28} className="text-gray-300" />}
            />
          </DataCard>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <AnimatePresence>
              {filtered.map((cobranca, idx) => {
                const cliente = clienteMap[cobranca.clienteId]
                const processo = processoMap[cobranca.processoId]
                return (
                  <motion.div
                    key={cobranca.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <CobrancaCard
                      cobranca={cobranca}
                      clienteNome={cliente?.nome}
                      processoTitulo={processo?.titulo}
                      processoNumero={processo?.numero}
                      onProximaFase={(id) => proximaFase.mutate(id)}
                      onMarcarPago={(id) => {
                        const c = cobrancas.find((c) => c.id === id)
                        const processo = c ? processoMap[c.processoId] : null
                        const cliente = c ? clienteMap[c.clienteId] : null
                        const descricao = `Honorários advocatícios${processo?.numero ? ` - Processo ${processo.numero}` : processo?.titulo ? ` - ${processo.titulo}` : ''}`
                        setPagamentoModal({ id, descricao })
                        setPagForm((f) => ({
                          ...f,
                          name: cliente?.nome ?? '',
                          email: cliente?.email ?? '',
                          cpfCnpj: billingProfile?.cpfCnpj ? billingProfile.cpfCnpj : '',
                          phone: billingProfile?.mobilePhone ?? billingProfile?.phone ?? '',
                        }))
                      }}
                      onCancelar={(id) => cancelar.mutate({ id })}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Pagamento com Cartão */}
      <AnimatePresence>
        {pagamentoModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPagamentoModal(null)}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CreditCard size={16} className="text-indigo-500" /> Registrar Pagamento
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">{pagamentoModal.descricao}</p>
                </div>
                <button onClick={() => setPagamentoModal(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Dados do cartão */}
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Dados do Cartão</p>
                <div>
                  <label className={labelCls}>Nome no cartão</label>
                  <input value={pagForm.holderName} onChange={(e) => setPagForm((f) => ({ ...f, holderName: e.target.value.toUpperCase() }))}
                    placeholder="NOME COMO NO CARTÃO" className={inputCls} autoComplete="cc-name" />
                </div>
                <div>
                  <label className={labelCls}>Número do cartão</label>
                  <div className="relative">
                    <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input inputMode="numeric" value={pagForm.number} onChange={(e) => setPagForm((f) => ({ ...f, number: formatCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000" className={`${inputCls} pl-9`} autoComplete="cc-number" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Mês</label>
                    <input inputMode="numeric" value={pagForm.expiryMonth} onChange={(e) => setPagForm((f) => ({ ...f, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                      placeholder="MM" maxLength={2} className={inputCls} autoComplete="cc-exp-month" />
                  </div>
                  <div>
                    <label className={labelCls}>Ano</label>
                    <input inputMode="numeric" value={pagForm.expiryYear} onChange={(e) => setPagForm((f) => ({ ...f, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="AAAA" maxLength={4} className={inputCls} autoComplete="cc-exp-year" />
                  </div>
                  <div>
                    <label className={labelCls}>CVV</label>
                    <input inputMode="numeric" value={pagForm.ccv} onChange={(e) => setPagForm((f) => ({ ...f, ccv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      placeholder="000" maxLength={4} className={inputCls} autoComplete="cc-csc" />
                  </div>
                </div>

                {/* Dados do titular */}
                <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide pt-1">Dados do Titular</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelCls}>Nome completo</label>
                    <input value={pagForm.name} onChange={(e) => setPagForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Nome completo" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>E-mail</label>
                    <input type="email" value={pagForm.email} onChange={(e) => setPagForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemplo.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>CPF / CNPJ</label>
                    <input inputMode="numeric" value={pagForm.cpfCnpj} onChange={(e) => setPagForm((f) => ({ ...f, cpfCnpj: formatCpf(e.target.value) }))}
                      placeholder="CPF ou CNPJ" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>CEP</label>
                    <input inputMode="numeric" value={pagForm.postalCode} onChange={(e) => setPagForm((f) => ({ ...f, postalCode: formatCep(e.target.value) }))}
                      placeholder="00000-000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Número</label>
                    <input value={pagForm.addressNumber} onChange={(e) => setPagForm((f) => ({ ...f, addressNumber: e.target.value }))}
                      placeholder="123" className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Telefone <span className="normal-case font-normal text-gray-400">(opcional)</span></label>
                    <input inputMode="numeric" value={pagForm.phone} onChange={(e) => setPagForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
                      placeholder="(11) 99999-9999" className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <ShieldCheck size={12} className="text-green-500" /> Pagamento processado com segurança via Asaas.
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setPagamentoModal(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button onClick={handlePagar} disabled={pagar.isPending || !pagamentoValido()}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {pagar.isPending ? 'Processando...' : <><CreditCard size={14} /> Confirmar Pagamento</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nova Cobrança */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Nova Cobrança</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Vincule a um cliente e processo</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Cliente */}
                <div>
                  <label className={labelCls}>Cliente</label>
                  <select
                    value={form.clienteId}
                    onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value, processoId: '' }))}
                    className={inputCls}
                  >
                    <option value="">Selecione um cliente...</option>
                    {(Array.isArray(clientes) ? clientes : []).map((c) => (
                      <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Processo */}
                <div>
                  <label className={labelCls}>Processo</label>
                  <select
                    value={form.processoId}
                    onChange={(e) => setForm((f) => ({ ...f, processoId: e.target.value }))}
                    className={inputCls}
                    disabled={!form.clienteId}
                  >
                    <option value="">
                      {form.clienteId ? 'Selecione um processo...' : 'Selecione um cliente primeiro'}
                    </option>
                    {processosDoCliente.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.numero ? `${p.numero} — ` : ''}{p.titulo}
                      </option>
                    ))}
                  </select>
                  {form.clienteId && processosDoCliente.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Nenhum processo encontrado para este cliente</p>
                  )}
                </div>

                {/* Valor */}
                <div>
                  <label className={labelCls}>Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.valorCentavos}
                    onChange={(e) => setForm((f) => ({ ...f, valorCentavos: e.target.value }))}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </div>

                {/* Data de vencimento */}
                <div>
                  <label className={labelCls}>Data de Vencimento <span className="text-gray-400 normal-case font-normal">(opcional)</span></label>
                  <input
                    type="date"
                    value={form.dataVencimento}
                    onChange={(e) => setForm((f) => ({ ...f, dataVencimento: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Preview do vínculo */}
              {form.clienteId && form.processoId && (
                <motion.div
                  className="mt-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Vínculo da cobrança</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">
                    <span className="font-medium">{clienteMap[form.clienteId]?.nome}</span>
                    {' → '}
                    <span className="font-medium">{processoMap[form.processoId]?.titulo}</span>
                  </p>
                </motion.div>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCriar}
                  disabled={criar.isPending || !form.processoId || !form.clienteId || !form.valorCentavos}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {criar.isPending ? 'Criando...' : 'Criar Cobrança'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
