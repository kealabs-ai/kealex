import { useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, CreditCard, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { assinaturaApi, PLANOS_CONFIG, type AssinarPayload, type HolderInfo, type CreditCardData } from '../api/assinatura'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { useTrial } from '../hooks/useTrial'

interface Props {
  open: boolean
  onClose: () => void
  planoInicial?: 'starter' | 'professional'
}

type Step = 'plano' | 'titular' | 'cartao' | 'sucesso'

const STEP_LABELS: Record<Step, string> = {
  plano: 'Escolha o plano',
  titular: 'Dados do titular',
  cartao: 'Pagamento',
  sucesso: 'Confirmacao',
}

const STEPS: Step[] = ['plano', 'titular', 'cartao', 'sucesso']

function formatCardNumber(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function AssinaturaModal({ open, onClose, planoInicial }: Props) {
  const { user, updateUser, logout } = useAuth()
  const { error: toastError } = useToast()
  const { isTrial, daysLeft } = useTrial()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>(planoInicial ? 'titular' : 'plano')
  const [planoId, setPlanoId] = useState<'starter' | 'professional'>(planoInicial ?? 'professional')

  const [titular, setTitular] = useState<HolderInfo>({
    name: user?.nome ?? '',
    email: user?.email ?? '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
    phone: '',
    mobilePhone: '',
  })

  const [cartao, setCartao] = useState<CreditCardData>({
    holderName: user?.nome ?? '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  })

  const [resultado, setResultado] = useState<{ subscriptionId: string; nextDueDate: string; value: number } | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const { customerId } = await assinaturaApi.criarClienteAsaas(titular)
      const payload: AssinarPayload = {
        plano: planoId,
        asaasCustomerId: customerId,
        creditCard: cartao,
        holderInfo: titular,
      }
      return assinaturaApi.assinar(payload)
    },
    onSuccess: (data) => {
      setResultado({ subscriptionId: data.subscriptionId, nextDueDate: data.nextDueDate, value: data.value })
      updateUser({ plano: planoId as any })
      setStep('sucesso')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.detail ?? 'Erro ao processar assinatura. Verifique os dados e tente novamente.'
      toastError(msg)
    },
  })

  const planoSelecionado = PLANOS_CONFIG.find((p) => p.id === planoId)!
  const stepIndex = STEPS.indexOf(step)

  function handleClose() {
    if (mutation.isPending) return
    setStep(planoInicial ? 'titular' : 'plano')
    setResultado(null)
    onClose()

    if (isTrial && daysLeft !== null && daysLeft > 0) return

    logout()
    navigate('/entrar', { replace: true })
  }

  function titularValido() {
    return titular.name && titular.email && titular.cpfCnpj.replace(/\D/g, '').length === 11
      && titular.postalCode.replace(/\D/g, '').length === 8 && titular.addressNumber
  }

  function cartaoValido() {
    return cartao.holderName && cartao.number.replace(/\s/g, '').length === 16
      && cartao.expiryMonth && cartao.expiryYear && cartao.ccv.length >= 3
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
            <button onClick={handleClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
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

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* STEP: PLANO */}
            {step === 'plano' && (
              <motion.div key="plano" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Escolha o plano ideal para voce</p>
                <div className="space-y-3 mb-6">
                  {PLANOS_CONFIG.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlanoId(p.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
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
                <button
                  onClick={() => setStep('titular')}
                  className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm"
                >
                  Continuar <ArrowRight size={15} />
                </button>
              </motion.div>
            )}

            {/* STEP: TITULAR */}
            {step === 'titular' && (
              <motion.div key="titular" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Dados do titular do cartao</p>
                <div className="space-y-3 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Field label="Nome completo">
                        <input value={titular.name} onChange={(e) => setTitular({ ...titular, name: e.target.value })}
                          placeholder="Nome como no cartao" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="E-mail">
                      <input type="email" value={titular.email} onChange={(e) => setTitular({ ...titular, email: e.target.value })}
                        placeholder="email@exemplo.com" className={inputCls} />
                    </Field>
                    <Field label="CPF">
                      <input value={titular.cpfCnpj} onChange={(e) => setTitular({ ...titular, cpfCnpj: formatCpf(e.target.value) })}
                        placeholder="000.000.000-00" className={inputCls} />
                    </Field>
                    <Field label="CEP">
                      <input value={titular.postalCode} onChange={(e) => setTitular({ ...titular, postalCode: formatCep(e.target.value) })}
                        placeholder="00000-000" className={inputCls} />
                    </Field>
                    <Field label="Numero">
                      <input value={titular.addressNumber} onChange={(e) => setTitular({ ...titular, addressNumber: e.target.value })}
                        placeholder="123" className={inputCls} />
                    </Field>
                    <Field label="Complemento">
                      <input value={titular.addressComplement ?? ''} onChange={(e) => setTitular({ ...titular, addressComplement: e.target.value })}
                        placeholder="Apto, sala..." className={inputCls} />
                    </Field>
                    <Field label="Telefone">
                      <input value={titular.phone ?? ''} onChange={(e) => setTitular({ ...titular, phone: formatPhone(e.target.value) })}
                        placeholder="(11) 3333-4444" className={inputCls} />
                    </Field>
                    <Field label="Celular">
                      <input value={titular.mobilePhone ?? ''} onChange={(e) => setTitular({ ...titular, mobilePhone: formatPhone(e.target.value) })}
                        placeholder="(11) 99999-9999" className={inputCls} />
                    </Field>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep('plano')}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={15} /> Voltar
                  </button>
                  <button onClick={() => setStep('cartao')} disabled={!titularValido()}
                    className="flex-1 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    Continuar <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: CARTAO */}
            {step === 'cartao' && (
              <motion.div key="cartao" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-slate-500 mb-4">Dados do cartao de credito</p>

                {/* Resumo do plano */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Plano selecionado</p>
                    <p className="font-bold text-[#081B33] text-sm">{planoSelecionado.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#081B33]">R$ {planoSelecionado.valor.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-slate-400">/mes</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <Field label="Nome no cartao">
                    <input value={cartao.holderName} onChange={(e) => setCartao({ ...cartao, holderName: e.target.value.toUpperCase() })}
                      placeholder="NOME COMO NO CARTAO" className={inputCls} />
                  </Field>
                  <Field label="Numero do cartao">
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={cartao.number} onChange={(e) => setCartao({ ...cartao, number: formatCardNumber(e.target.value) })}
                        placeholder="0000 0000 0000 0000" className={`${inputCls} pl-9`} />
                    </div>
                  </Field>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Mes">
                      <input value={cartao.expiryMonth} onChange={(e) => setCartao({ ...cartao, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                        placeholder="MM" maxLength={2} className={inputCls} />
                    </Field>
                    <Field label="Ano">
                      <input value={cartao.expiryYear} onChange={(e) => setCartao({ ...cartao, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="AAAA" maxLength={4} className={inputCls} />
                    </Field>
                    <Field label="CVV">
                      <input value={cartao.ccv} onChange={(e) => setCartao({ ...cartao, ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="000" maxLength={4} className={inputCls} />
                    </Field>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                  <ShieldCheck size={12} className="text-[#00C2A8]" />
                  Pagamento processado com seguranca via Asaas. Seus dados nao sao armazenados.
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStep('titular')}
                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 text-sm">
                    <ArrowLeft size={15} /> Voltar
                  </button>
                  <button onClick={() => mutation.mutate()} disabled={!cartaoValido() || mutation.isPending}
                    className="flex-1 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                    {mutation.isPending ? <><Loader2 size={15} className="animate-spin" /> Processando...</> : <>Confirmar assinatura <ArrowRight size={15} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP: SUCESSO */}
            {step === 'sucesso' && resultado && (
              <motion.div key="sucesso" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-[#00C2A8]/10 border border-[#00C2A8]/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-[#00C2A8]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#081B33] mb-2">Assinatura ativada!</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Seu plano <strong>{planoSelecionado.nome}</strong> esta ativo.
                  {isTrial && daysLeft !== null && daysLeft > 0
                    ? ` A primeira cobranca sera em ${new Date(resultado.nextDueDate).toLocaleDateString('pt-BR')}.`
                    : ' Obrigado pela confianca!'}
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2">
                  <Row label="Plano" value={planoSelecionado.nome} />
                  <Row label="Valor" value={`R$ ${resultado.value.toFixed(2).replace('.', ',')} /mes`} />
                  <Row label="Proxima cobranca" value={new Date(resultado.nextDueDate).toLocaleDateString('pt-BR')} />
                  <Row label="ID da assinatura" value={resultado.subscriptionId.slice(0, 16) + '...'} mono />
                </div>
                <button onClick={handleClose}
                  className="w-full bg-[#081B33] hover:bg-[#0f2d4a] text-white font-bold py-3 rounded-xl text-sm">
                  Continuar usando o Kealex
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {children}
    </div>
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
