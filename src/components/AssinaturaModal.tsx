import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, CreditCard, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Star, XCircle, Copy, Check, QrCode } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { assinaturaApi, PLANOS_CONFIG, PERIODICIDADES_CONFIG, calcularValores, ASAAS_STATUS_APROVADO, type AssinarPayload, type HolderInfo, type CreditCardData, type Periodicidade } from '../api/assinatura'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { useTrial } from '../hooks/useTrial'
import { AssinaturaExistente } from './AssinaturaExistente'

interface Props {
  open: boolean
  onClose: () => void
  planoInicial?: 'starter' | 'professional'
  periodicidadeInicial?: Periodicidade
  /** Quando true, o modal não pode ser fechado (conta bloqueada) */
  obrigatorio?: boolean
}

type MetodoPagamento = 'cartao' | 'pix'
type Step = 'plano' | 'titular' | 'metodo' | 'cartao' | 'pix' | 'sucesso'

const STEP_LABELS: Record<string, string> = {
  plano: 'Plano',
  titular: 'Titular',
  metodo: 'Pagamento',
  sucesso: 'Confirmacao',
}

const STEPS: Step[] = ['plano', 'titular', 'metodo', 'sucesso']

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim()
}

function formatCpfCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  if (d.length <= 11) {
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function validadeCartaoOk(month: string, year: string) {
  if (!/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return false
  const m = Number(month)
  const y = Number(year)
  const now = new Date()
  return m >= 1 && m <= 12 && (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1))
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

interface ViaCepResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

async function fetchCep(cep: string): Promise<ViaCepResult | null> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
    const data = await res.json()
    return data.erro ? null : data
  } catch {
    return null
  }
}

async function searchCidades(query: string): Promise<{ nome: string; uf: string }[]> {
  if (query.length < 3) return []
  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
    )
    const data: Array<{ nome: string; microrregiao: { mesorregiao: { UF: { sigla: string } } } }> = await res.json()
    const q = query.toLowerCase()
    return data
      .filter((c) => c.nome.toLowerCase().includes(q))
      .slice(0, 8)
      .map((c) => ({ nome: c.nome, uf: c.microrregiao.mesorregiao.UF.sigla }))
  } catch {
    return []
  }
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function AssinaturaModal({ open, onClose, planoInicial, periodicidadeInicial, obrigatorio }: Props) {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { error: toastError } = useToast()
  const { isTrial, daysLeft } = useTrial()
  const { data: billingProfile, isLoading: loadingBillingProfile } = useQuery({
    queryKey: ['billing-profile', user?.tenantId],
    queryFn: assinaturaApi.billingProfile,
    enabled: open && Boolean(user),
    staleTime: 5 * 60 * 1000,
  })
  const queryClient = useQueryClient()

  const [step, setStep] = useState<Step>(planoInicial ? 'titular' : 'plano')
  const [planoId, setPlanoId] = useState<'starter' | 'professional'>(planoInicial ?? 'professional')
  const [periodicidade, setPeriodicidade] = useState<Periodicidade>(periodicidadeInicial ?? 'mensal')
  const [metodo, setMetodo] = useState<MetodoPagamento>('cartao')
  const [pixData, setPixData] = useState<{ qrCode: string; key: string; expiresAt: string; subscriptionId: string; value: number; nextDueDate: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [cidadeSugestoes, setCidadeSugestoes] = useState<{ nome: string; uf: string }[]>([])
  const [cidadeQuery, setCidadeQuery] = useState('')
  const [showCidadeSugestoes, setShowCidadeSugestoes] = useState(false)
  const { data: billingStatus } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: open && Boolean(user),
    staleTime: 0,
    refetchInterval: (query) => (step === 'pix' && query.state.data?.status !== 'active') || query.state.data?.status === 'pending' ? 5000 : false,
  })

  // Quando pending: pula direto para cartao com dados já carregados
  useEffect(() => {
    if (!open) return
    if (billingStatus?.status === 'pending' && billingProfile && step === 'plano') {
      const plan = (billingStatus.plano as 'starter' | 'professional') ?? planoInicial ?? 'professional'
      setPlanoId(plan)
      setStep('cartao')
    }
  }, [open, billingStatus?.status, billingProfile])
  const {
    data: existingSubscription,
    isLoading: loadingExistingSubscription,
    isError: failedToLoadExistingSubscription,
  } = useQuery({
    queryKey: ['assinatura-existente', user?.tenantId],
    queryFn: assinaturaApi.getAssinatura,
    enabled: open && Boolean(user) && billingStatus?.status === 'past_due',
    staleTime: 0,
  })
  const regularizationMethod = billingStatus?.status === 'past_due' && existingSubscription
    ? existingSubscription.billingType === 'PIX' ? 'pix' : 'cartao'
    : null

  const [titular, setTitular] = useState<HolderInfo>({
    name: user?.nome ?? '',
    email: user?.email ?? '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
    phone: '',
    mobilePhone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  // Preencher dados do billingProfile quando carrega
  useEffect(() => {
    if (billingProfile && !titular.cpfCnpj) {
      setTitular((prev) => ({
        ...prev,
        name: prev.name || billingProfile.name || '',
        email: prev.email || billingProfile.email || '',
        cpfCnpj: formatCpfCnpj(billingProfile.billing_cpf_cnpj || billingProfile.cpfCnpj || ''),
        phone: prev.phone || formatPhone(billingProfile.phone || ''),
        mobilePhone: prev.mobilePhone || formatPhone(billingProfile.mobilePhone || ''),
        postalCode: prev.postalCode || formatCep(billingProfile.postalCode || ''),
        address: prev.address || billingProfile.address || '',
        addressNumber: prev.addressNumber || billingProfile.addressNumber || '',
        addressComplement: prev.addressComplement || billingProfile.addressComplement || '',
        neighborhood: prev.neighborhood || billingProfile.neighborhood || '',
        city: prev.city || billingProfile.city || '',
        state: prev.state || billingProfile.state || '',
      }))
      if (billingProfile.city && billingProfile.state) {
        setCidadeQuery(`${billingProfile.city}, ${billingProfile.state}`)
      }
    }
  }, [billingProfile])

  const [cartao, setCartao] = useState<CreditCardData>({
    holderName: user?.nome ?? '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  })

  const [resultado, setResultado] = useState<{ subscriptionId: string; nextDueDate: string; value: number; status?: string } | null>(null)
  const [erroCartao, setErroCartao] = useState<string | null>(null)
  const [assinaturaExistente, setAssinaturaExistente] = useState(false)
  const formTitular: HolderInfo = {
    ...titular,
    name: titular.name || billingProfile?.name || '',
    email: titular.email || billingProfile?.email || '',
    cpfCnpj: titular.cpfCnpj || formatCpfCnpj(billingProfile?.billing_cpf_cnpj || billingProfile?.cpfCnpj || ''),
    phone: titular.phone || formatPhone(billingProfile?.phone || ''),
    mobilePhone: titular.mobilePhone || formatPhone(billingProfile?.mobilePhone || ''),
    postalCode: titular.postalCode || formatCep(billingProfile?.postalCode || ''),
    address: titular.address || billingProfile?.address || '',
    addressNumber: titular.addressNumber || billingProfile?.addressNumber || '',
    addressComplement: titular.addressComplement || billingProfile?.addressComplement || '',
    neighborhood: titular.neighborhood || billingProfile?.neighborhood || '',
    city: titular.city || billingProfile?.city || '',
    state: titular.state || billingProfile?.state || '',
  }
  useEffect(() => {
    if (billingStatus?.status !== 'active' || step !== 'pix' || !pixData) return
    if (user?.plano !== billingStatus.plano || user.subscriptionStatus !== 'active' || user.tenantAtivo === false) {
      updateUser({ plano: billingStatus.plano, subscriptionStatus: 'active', tenantAtivo: true })
    }
    queryClient.setQueryData(['billing-status'], billingStatus)
  }, [billingStatus, pixData, queryClient, step, updateUser, user])

  const mutationPix = useMutation({
    mutationFn: async () => {
      const { customerId } = await assinaturaApi.criarClienteAsaas(formTitular)
      return assinaturaApi.assinarPix({ plano: planoId, periodicidade, asaasCustomerId: customerId })
    },
    onSuccess: (data) => {
      setPixData({ qrCode: data.pixQrCode, key: data.pixKey, expiresAt: data.pixExpiresAt, subscriptionId: data.subscriptionId, value: data.value, nextDueDate: data.nextDueDate })
      setStep('pix')
      queryClient.invalidateQueries({ queryKey: ['billing-status'] })
      queryClient.invalidateQueries({ queryKey: ['assinatura-existente', user?.tenantId] })
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail ?? 'Erro ao gerar PIX. Tente novamente.'
      setErroCartao(msg)
      toastError(msg)
    },
  })

  const mutation = useMutation({
    mutationFn: async () => {
      // Atualiza dados do titular (sem criar novo registro)
      await assinaturaApi.criarClienteAsaas(formTitular)
      queryClient.invalidateQueries({ queryKey: ['billing-profile', user?.tenantId] })
      // Se já existe assinatura pending, usa reativar em vez de criar nova
      if (billingStatus?.status === 'pending') {
        return assinaturaApi.reativarAssinatura()
      }
      const { customerId } = await assinaturaApi.criarClienteAsaas(formTitular)
      const payload: AssinarPayload = {
        plano: planoId,
        periodicidade,
        asaasCustomerId: customerId,
        creditCard: cartao,
        holderInfo: formTitular,
      }
      return assinaturaApi.assinar(payload)
    },
    onSuccess: (data) => {
      if (!ASAAS_STATUS_APROVADO.has(data.status?.toUpperCase())) {
        if (['PENDING', 'AWAITING_RISK_ANALYSIS'].includes(data.status?.toUpperCase())) {
          updateUser({ plano: data.plano, subscriptionStatus: 'pending', tenantAtivo: true })
          queryClient.invalidateQueries({ queryKey: ['billing-status'] })
          navigate('/pagamento-pendente', {
            replace: true,
            state: { plano: data.plano, periodicidade, statusGateway: data.status },
          })
          return
        }
        const msg = resolverMensagemStatus(data.status)
        setErroCartao(msg)
        toastError(msg)
        return
      }
      updateUser({ plano: data.plano, subscriptionStatus: 'active', tenantAtivo: true })
      queryClient.setQueryData(['billing-status'], {
        plano: data.plano,
        status: 'active',
        subscriptionStatus: 'active',
        nextDueDate: data.nextDueDate,
        trialExpiresAt: user?.trialExpiresAt ?? null,
      })

      setErroCartao(null)
      setResultado({ subscriptionId: data.subscriptionId, nextDueDate: data.nextDueDate, value: data.value, status: data.status })
      setStep('sucesso')
      if (obrigatorio) setTimeout(() => navigate('/processos', { replace: true }), 2500)
    },
    onError: (err: any) => {
      if (err.response?.status === 409 || /assinatura.*vinculada|ja existe.*assinatura/i.test(err.response?.data?.detail ?? '')) {
        setAssinaturaExistente(true)
        return
      }
      const msg = err.response?.data?.detail ?? 'Erro ao processar assinatura. Verifique os dados e tente novamente.'
      setErroCartao(msg)
      toastError(msg)
    },
  })

  const planoSelecionado = PLANOS_CONFIG.find((p) => p.id === planoId)!
  const valores = calcularValores(planoSelecionado.valor, periodicidade)
  const stepIndexMap: Record<Step, number> = { plano: 0, titular: 1, metodo: 2, cartao: 2, pix: 2, sucesso: 3 }
  const stepIndex = stepIndexMap[step]

  function handleClose() {
    if (obrigatorio) return
    if (mutation.isPending || mutationPix.isPending) return
    setStep(planoInicial ? 'titular' : 'plano')
    setResultado(null)
    setErroCartao(null)
    setPixData(null)
    setCopied(false)
    setAssinaturaExistente(false)
    onClose()
  }

  function resolverMensagemStatus(status: string): string {
    const s = (status ?? '').toUpperCase()
    if (['PENDING', 'AWAITING_RISK_ANALYSIS'].includes(s)) return 'Pagamento pendente de confirmação. Aguarde ou tente novamente com outro cartão.'
    if (['DECLINED', 'REFUSED'].includes(s)) return 'Pagamento recusado pelo banco. Verifique os dados do cartão ou use outro cartão.'
    if (['CANCELED', 'CANCELLED'].includes(s)) return 'Pagamento cancelado. Tente novamente.'
    if (['OVERDUE', 'EXPIRED'].includes(s)) return 'Pagamento expirado. Tente novamente.'
    return `Pagamento não confirmado (status: ${status}). Verifique os dados e tente novamente.`
  }

  function titularValido() {
    return titular.name && titular.email && [11, 14].includes(titular.cpfCnpj.replace(/\D/g, '').length)
      && titular.postalCode.replace(/\D/g, '').length === 8 && titular.addressNumber && titular.mobilePhone
  }

  async function handleCepChange(cep: string) {
    const formatted = formatCep(cep)
    setTitular((t) => ({ ...t, postalCode: formatted }))
    const digits = cep.replace(/\D/g, '')
    if (digits.length === 8) {
      setCepLoading(true)
      const data = await fetchCep(digits)
      setCepLoading(false)
      if (data) {
        setTitular((t) => ({
          ...t,
          address: data.logradouro || t.address,
          neighborhood: data.bairro || t.neighborhood,
          city: data.localidade || t.city,
          state: data.uf || t.state,
        }))
        setCidadeQuery(`${data.localidade}, ${data.uf}`)
      }
    }
  }

  async function handleCidadeSearch(query: string) {
    setCidadeQuery(query)
    setTitular((t) => ({ ...t, city: query }))
    if (query.length >= 3) {
      const sugestoes = await searchCidades(query)
      setCidadeSugestoes(sugestoes)
      setShowCidadeSugestoes(true)
    } else {
      setCidadeSugestoes([])
      setShowCidadeSugestoes(false)
    }
  }

  function selectCidade(cidade: { nome: string; uf: string }) {
    setTitular((t) => ({ ...t, city: cidade.nome, state: cidade.uf }))
    setCidadeQuery(`${cidade.nome}, ${cidade.uf}`)
    setShowCidadeSugestoes(false)
  }

  function cartaoValido() {
    const number = cartao.number.replace(/\D/g, '')
    return cartao.holderName.trim().length >= 3 && number.length >= 13 && number.length <= 19
      && validadeCartaoOk(cartao.expiryMonth, cartao.expiryYear) && /^\d{3,4}$/.test(cartao.ccv)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* Header */}
        <div className="bg-[#081B33] px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold text-base">Assinar Kealex</h2>
            {!obrigatorio && (
              <button onClick={handleClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            )}
          </div>
          {/* Steps */}
          <div className="flex items-center gap-1">
            {STEPS.filter((s) => s !== 'sucesso').map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  stepIndex > i ? 'bg-[#00C2A8] text-white' : stepIndex === i ? 'bg-white text-[#081B33]' : 'bg-white/20 text-white/50'
                }`}>
                  {stepIndex > i ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${stepIndex === i ? 'text-white' : 'text-white/50'}`}>
                  {STEP_LABELS[s]}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-white/20 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Trial info */}
        {isTrial && daysLeft !== null && daysLeft > 0 && step !== 'sucesso' && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-700">
            <ShieldCheck size={13} className="shrink-0" />
            <span>Voce esta no trial gratuito. A cobranca so inicia apos os <strong>{daysLeft} dias restantes</strong>.</span>
          </div>
        )}
        {billingStatus?.status === 'pending' && step !== 'sucesso' && (
          <div role="alert" className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2">
            <span className="font-bold">Pagamento pendente.</span> Confirme um novo cartão para regularizar sua assinatura.
          </div>
        )}
        {billingStatus?.status === 'past_due' && step !== 'sucesso' && (
          <div role="alert" className="bg-red-50 border-b border-red-100 px-6 py-2.5 text-xs text-red-700">
            O acesso está pausado. A plataforma será liberada após a confirmação da regularização pelo Asaas.
          </div>
        )}
        {billingStatus?.status === 'trial_expired' && step !== 'sucesso' && (
          <div role="status" className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 text-xs text-amber-800">
            Seu período de teste encerrou. Escolha uma forma de pagamento para liberar o acesso.
          </div>
        )}

        <div className="p-6">
          {assinaturaExistente ? (
            <AssinaturaExistente
              onNovaCotratacao={() => setAssinaturaExistente(false)}
              onClose={handleClose}
            />
          ) : (
          <AnimatePresence mode="wait">

            {/* STEP: PLANO */}
            {step === 'plano' && (
              <motion.div key="plano" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Escolha o plano ideal para voce</p>
                {billingStatus?.status === 'past_due' && failedToLoadExistingSubscription && (
                  <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    Não foi possível consultar a assinatura vencida no Asaas. Tente novamente antes de iniciar o pagamento.
                  </div>
                )}
                <div className="space-y-3 mb-4">
                  {PLANOS_CONFIG.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      disabled={billingStatus?.status === 'past_due' && Boolean(existingSubscription) && p.id !== existingSubscription?.plano}
                      onClick={() => setPlanoId(p.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        planoId === p.id ? 'border-[#00C2A8] bg-[#00C2A8]/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#081B33] text-sm">{p.nome}</span>
                            {p.destaque && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00C2A8] bg-[#00C2A8]/10 px-2 py-0.5 rounded-full">
                                <Star size={9} /> Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{p.descricao}</p>
                          <ul className="mt-2 space-y-0.5">
                            {p.recursos.map((r) => (
                              <li key={r} className="flex items-center gap-1.5 text-xs text-slate-600">
                                <CheckCircle2 size={11} className="text-[#00C2A8] shrink-0" /> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-lg font-extrabold text-[#081B33]">R$ {p.valor.toFixed(2).replace('.', ',')}</p>
                          <p className="text-xs text-slate-400">/mes</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Periodicidade</p>
                <div className="grid grid-cols-2 gap-2 mb-5">
                  {PERIODICIDADES_CONFIG.map((per) => {
                    const v = calcularValores(planoSelecionado.valor, per.id)
                    return (
                      <button key={per.id} type="button" disabled={billingStatus?.status === 'past_due'} onClick={() => setPeriodicidade(per.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          periodicidade === per.id ? 'border-[#00C2A8] bg-[#00C2A8]/5' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-bold text-[#081B33]">{per.label}</span>
                          {per.desconto > 0 && <span className="text-[10px] font-bold text-[#00C2A8] bg-[#00C2A8]/10 px-1.5 py-0.5 rounded-full">{(per.desconto * 100).toFixed(0)}% off</span>}
                        </div>
                        <p className="text-sm font-extrabold text-[#081B33]">R$ {v.valorFinal.toFixed(2).replace('.', ',')}</p>
                        {per.desconto > 0 && <p className="text-[10px] text-slate-400 line-through">R$ {v.valorBruto.toFixed(2).replace('.', ',')}</p>}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setStep('titular')}
                  disabled={billingStatus?.status === 'past_due' && (!existingSubscription || loadingExistingSubscription || failedToLoadExistingSubscription)}
                  className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  {billingStatus?.status === 'past_due' && loadingExistingSubscription ? 'Consultando assinatura...' : 'Continuar'} <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* STEP: TITULAR */}
            {step === 'titular' && (
              <motion.div key="titular" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Dados do titular do cartao</p>
                {loadingBillingProfile && <p className="text-xs text-slate-500 mb-3" role="status">Recuperando dados cadastrados...</p>}
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Nome completo">
                        <input autoComplete="name" value={titular.name} onChange={(e) => setTitular({ ...titular, name: e.target.value })}
                          placeholder="Nome como no cartao" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="CPF ou CNPJ">
                      <input inputMode="numeric" value={titular.cpfCnpj} onChange={(e) => setTitular({ ...titular, cpfCnpj: formatCpfCnpj(e.target.value) })}
                        placeholder="CPF ou CNPJ" className={inputCls} />
                    </Field>
                    <Field label="E-mail">
                      <input type="email" autoComplete="email" value={titular.email} onChange={(e) => setTitular({ ...titular, email: e.target.value })}
                        placeholder="email@exemplo.com" className={inputCls} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Celular (WhatsApp) *">
                        <input inputMode="numeric" value={titular.mobilePhone ?? ''} onChange={(e) => setTitular({ ...titular, mobilePhone: formatPhone(e.target.value) })}
                          placeholder="(11) 99999-9999" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="CEP">
                      <div className="relative">
                        <input inputMode="numeric" autoComplete="postal-code" value={titular.postalCode}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000" className={inputCls} />
                        {cepLoading && (
                          <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#00C2A8]" />
                        )}
                      </div>
                    </Field>
                    <div className="relative">
                      <Field label="Cidade">
                        <input value={cidadeQuery} onChange={(e) => handleCidadeSearch(e.target.value)}
                          onBlur={() => setTimeout(() => setShowCidadeSugestoes(false), 150)}
                          placeholder="Buscar cidade..." className={inputCls} />
                      </Field>
                      {showCidadeSugestoes && cidadeSugestoes.length > 0 && (
                        <ul className="absolute z-10 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto">
                          {cidadeSugestoes.map((c) => (
                            <li key={`${c.nome}-${c.uf}`}
                              onMouseDown={() => selectCidade(c)}
                              className="px-3 py-2 text-xs text-slate-700 hover:bg-[#00C2A8]/10 cursor-pointer flex items-center justify-between">
                              <span>{c.nome}, {c.uf}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Field label="Numero">
                      <input value={titular.addressNumber} onChange={(e) => setTitular({ ...titular, addressNumber: e.target.value })}
                        placeholder="123" className={inputCls} />
                    </Field>
                    <Field label="Complemento">
                      <input value={titular.addressComplement ?? ''} onChange={(e) => setTitular({ ...titular, addressComplement: e.target.value })}
                        placeholder="Apto, sala..." className={inputCls} />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Rua">
                        <input value={titular.address ?? ''} onChange={(e) => setTitular({ ...titular, address: e.target.value })}
                          placeholder="Rua, Av., Alameda..." className={inputCls} />
                      </Field>
                    </div>
                    <div className="col-span-2">
                      <Field label="Bairro">
                        <input value={titular.neighborhood ?? ''} onChange={(e) => setTitular({ ...titular, neighborhood: e.target.value })}
                          placeholder="Bairro" className={inputCls} />
                      </Field>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('plano')}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={15} /> Voltar
                  </button>
                  <button onClick={() => setStep('metodo')} disabled={loadingBillingProfile || !titularValido()}
                    className="flex-1 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    Continuar <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: METODO */}
            {step === 'metodo' && (
              <motion.div key="metodo" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Escolha a forma de pagamento</p>
                <div className="bg-slate-50 rounded-xl p-3 mb-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Plano</p>
                    <p className="font-bold text-[#081B33] text-sm">{planoSelecionado.nome} · {periodicidade === 'mensal' ? 'Mensal' : 'Trimestral'}</p>
                  </div>
                  {valores.valorDesconto > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#00C2A8]">
                      <span>Desconto ({(valores.percentualDesconto * 100).toFixed(0)}%)</span>
                      <span>- R$ {valores.valorDesconto.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <p className="text-xs font-bold text-[#081B33]">Total</p>
                    <p className="font-extrabold text-[#081B33]">R$ {valores.valorFinal.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['cartao', 'pix'] as MetodoPagamento[]).filter((m) => !regularizationMethod || m === regularizationMethod).map((m) => (
                    <button key={m} type="button" onClick={() => setMetodo(m)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        metodo === m ? 'border-[#00C2A8] bg-[#00C2A8]/5' : 'border-slate-200 hover:border-slate-300'
                      }`}>
                      {m === 'cartao' ? <CreditCard size={22} className={metodo === m ? 'text-[#00C2A8]' : 'text-slate-400'} /> : <QrCode size={22} className={metodo === m ? 'text-[#00C2A8]' : 'text-slate-400'} />}
                      <span className="text-xs font-bold text-[#081B33]">{m === 'cartao' ? 'Cartão de crédito' : 'PIX'}</span>
                      {m === 'pix' && <span className="text-[10px] text-[#00C2A8] font-semibold">Aprovação imediata</span>}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('titular')} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={15} /> Voltar
                  </button>
                  <button onClick={() => setStep(metodo)} className="flex-1 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    Continuar <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: CARTAO */}
            {step === 'cartao' && (
              <motion.div key="cartao" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Dados do cartao de credito</p>
                <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">Plano</p>
                    <p className="font-bold text-[#081B33] text-sm">{planoSelecionado.nome} · {periodicidade === 'mensal' ? 'Mensal' : 'Trimestral'}</p>
                  </div>
                  {valores.valorDesconto > 0 && (
                    <div className="flex items-center justify-between text-xs text-[#00C2A8]">
                      <span>Desconto ({(valores.percentualDesconto * 100).toFixed(0)}%)</span>
                      <span>- R$ {valores.valorDesconto.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <p className="text-xs font-bold text-[#081B33]">Total</p>
                    <p className="font-extrabold text-[#081B33]">R$ {valores.valorFinal.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  <Field label="Nome no cartao">
                    <input autoComplete="cc-name" value={cartao.holderName} onChange={(e) => setCartao({ ...cartao, holderName: e.target.value.toUpperCase() })} placeholder="NOME COMO NO CARTAO" className={inputCls} />
                  </Field>
                  <Field label="Numero do cartao">
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input inputMode="numeric" autoComplete="cc-number" value={cartao.number} onChange={(e) => setCartao({ ...cartao, number: formatCardNumber(e.target.value) })} placeholder="0000 0000 0000 0000" className={`${inputCls} pl-9`} />
                    </div>
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Mes"><input inputMode="numeric" autoComplete="cc-exp-month" value={cartao.expiryMonth} onChange={(e) => setCartao({ ...cartao, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })} placeholder="MM" maxLength={2} className={inputCls} /></Field>
                    <Field label="Ano"><input inputMode="numeric" autoComplete="cc-exp-year" value={cartao.expiryYear} onChange={(e) => setCartao({ ...cartao, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="AAAA" maxLength={4} className={inputCls} /></Field>
                    <Field label="CVV"><input inputMode="numeric" autoComplete="cc-csc" value={cartao.ccv} onChange={(e) => setCartao({ ...cartao, ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="000" maxLength={4} className={inputCls} /></Field>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                  <ShieldCheck size={12} className="text-[#00C2A8]" /> Pagamento processado com seguranca via Asaas.
                </div>
                {erroCartao && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2.5 mb-3">
                    <XCircle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">{erroCartao}</p>
                      <ul className="space-y-1 text-[11px] opacity-90">
                        <li>• Verifique se o número do cartão está correto</li>
                        <li>• Confirme a validade (mês e ano)</li>
                        <li>• Verifique o CVV (3 dígitos no verso)</li>
                        <li>• Certifique-se de que o cartão tem limite disponível</li>
                        <li>• Tente com outro cartão ou forma de pagamento</li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep('metodo')} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={15} /> Voltar
                  </button>
                  <button onClick={() => { setErroCartao(null); mutation.mutate() }} disabled={!cartaoValido() || mutation.isPending}
                    className="flex-1 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    {mutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Processando...</> : <>Confirmar <ArrowRight size={15} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: PIX */}
            {step === 'pix' && (
              <motion.div key="pix" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {mutationPix.isPending ? (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <Loader2 size={32} className="animate-spin text-[#00C2A8]" />
                    <p className="text-sm text-slate-500">Gerando QR Code PIX...</p>
                  </div>
                ) : pixData ? (
                  <>
                    <p className="text-sm text-slate-500 mb-4 text-center">Escaneie o QR Code ou copie a chave PIX</p>
                    <div className="flex justify-center mb-4">
                      <div className="bg-white border-2 border-[#00C2A8]/30 rounded-2xl p-3">
                        <img
                          src={pixData.qrCode ? `data:image/png;base64,${pixData.qrCode}` : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixData.key)}`}
                          alt="QR Code PIX"
                          className="w-44 h-44"
                        />
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-slate-500 mb-1">Chave PIX (copia e cola)</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-[#081B33] flex-1 truncate">{pixData.key}</p>
                        <button onClick={() => { navigator.clipboard.writeText(pixData.key); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                          className="shrink-0 p-1.5 rounded-lg bg-[#00C2A8]/10 hover:bg-[#00C2A8]/20 text-[#00C2A8] transition-all">
                          {copied ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4 text-xs text-amber-700">
                      <Loader2 size={12} className="animate-spin shrink-0" />
                      Aguardando confirmacao do pagamento... Esta tela atualiza automaticamente.
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                      <span>Valor: <strong className="text-[#081B33]">R$ {pixData.value.toFixed(2).replace('.', ',')}</strong></span>
                      <span>Expira: <strong className="text-[#081B33]">{new Date(pixData.expiresAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    </div>
                    <button onClick={() => setStep('metodo')} className="w-full py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-semibold flex items-center justify-center gap-2">
                      <ArrowLeft size={13} /> Trocar forma de pagamento
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 mb-5 text-center">Clique para gerar o QR Code PIX</p>
                    {erroCartao && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2.5 mb-4">
                        <XCircle size={14} className="shrink-0 mt-0.5" /><span>{erroCartao}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setStep('metodo')} className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                        <ArrowLeft size={15} /> Voltar
                      </button>
                      <button onClick={() => { setErroCartao(null); mutationPix.mutate() }}
                        className="flex-1 bg-[#00C2A8] hover:bg-[#00a896] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                        <QrCode size={15} /> Gerar QR Code
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP: SUCESSO */}
            {step === 'sucesso' && resultado && (
              <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00C2A8]/10 border border-[#00C2A8]/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-[#00C2A8]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#081B33] mb-2">Assinatura confirmada!</h3>
                <p className="text-sm text-slate-500 mb-4">
                  {metodo === 'pix' ? 'Pagamento PIX recebido com sucesso.' : 'Pagamento aprovado com sucesso.'} Seu acesso ao plano <strong>{planoSelecionado.nome}</strong> está ativo.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                  <Row label="Plano" value={planoSelecionado.nome} />
                  <Row label="Periodicidade" value={periodicidade === 'trimestral' ? 'Trimestral (3 meses)' : 'Mensal'} />
                  <Row label="Valor mensal" value={`R$ ${planoSelecionado.valor.toFixed(2).replace('.', ',')}`} />
                  {valores.valorDesconto > 0 && (
                    <Row label="Desconto" value={`-R$ ${valores.valorDesconto.toFixed(2).replace('.', ',')}`} />
                  )}
                  <Row label="Valor total pago" value={`R$ ${resultado.value.toFixed(2).replace('.', ',')}`} />
                  {periodicidade === 'trimestral' && (
                    <Row label="Parcelas" value={`3x de R$ ${(resultado.value / 3).toFixed(2).replace('.', ',')}`} />
                  )}
                  <Row label="Próxima cobrança" value={new Date(resultado.nextDueDate).toLocaleDateString('pt-BR')} />
                  <Row label="ID da assinatura" value={resultado.subscriptionId.slice(0, 16) + '...'} mono />
                </div>
                {!obrigatorio && (
                  <button onClick={handleClose}
                    className="w-full bg-[#081B33] hover:bg-[#0f2d4a] text-white font-bold py-3 rounded-xl text-sm">
                    Continuar usando o Kealex
                  </button>
                )}
                {obrigatorio && (
                  <p className="text-xs text-slate-400">Redirecionando para a plataforma...</p>
                )}
              </motion.div>
            )}

          </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-slate-600 mb-1"><span className="block mb-1">{label}</span>{children}</label>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold text-[#081B33] ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
