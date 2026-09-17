import { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, CheckCircle2, CreditCard, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Star, Lock, Eye, EyeOff } from 'lucide-react'
import { assinaturaApi, PLANOS_CONFIG, type HolderInfo, type CreditCardData } from '../../api/assinatura'
import logo from '../../assets/logotipo_kealex.png'

function fmtCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function fmtCpf(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function fmtCep(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

function fmtPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const inp = 'w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all bg-white text-[#081B33] placeholder-slate-400'

function F({ label, children }: { label: string; children: ReactNode }) {
  return <div><label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>{children}</div>
}

function Card({ children }: { children: ReactNode }) {
  return <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl shadow-black/30 p-6">{children}</div>
}

const STEPS = ['Conta', 'Plano', 'Titular', 'Pagamento', 'Confirmacao']

function Steps({ cur }: { cur: number }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < cur ? 'bg-[#00C2A8] text-white' : i === cur ? 'bg-white text-[#081B33] ring-4 ring-white/20' : 'bg-white/15 text-white/40'}`}>
              {i < cur ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-[9px] font-semibold hidden sm:block ${i === cur ? 'text-white' : i < cur ? 'text-[#00C2A8]' : 'text-white/40'}`}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`w-8 sm:w-10 h-0.5 mb-4 ${i < cur ? 'bg-[#00C2A8]' : 'bg-white/20'}`} />}
        </div>
      ))}
    </div>
  )
}

type PlanoId = 'starter' | 'professional'

export function AssinaturaPage() {
  const [params] = useSearchParams()
  const planoParam = (params.get('plano') ?? 'professional') as PlanoId
  const [step, setStep] = useState(0)
  const [planoId, setPlanoId] = useState<PlanoId>(planoParam)
  const [conta, setConta] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [showSenha, setShowSenha] = useState(false)
  const tokenRef = useRef('')
  const [titular, setTitular] = useState<HolderInfo>({
    name: '',
    email: '',
    cpfCnpj: '',
    postalCode: '',
    addressNumber: '',
    addressComplement: '',
    phone: '',
    mobilePhone: '',
  })
  const [cartao, setCartao] = useState<CreditCardData>({ holderName: '', number: '', expiryMonth: '', expiryYear: '', ccv: '' })
  const [resultado, setResultado] = useState<{ subscriptionId: string; nextDueDate: string; value: number } | null>(null)
  const [apiError, setApiError] = useState('')
  const plano = PLANOS_CONFIG.find((p) => p.id === planoId) ?? PLANOS_CONFIG[1]

  const contaOk = conta.nome.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(conta.email) && conta.senha.length >= 6 && conta.senha === conta.confirmar
  const titularOk = titular.name && titular.email && titular.cpfCnpj.replace(/\D/g, '').length === 11 && titular.postalCode.replace(/\D/g, '').length === 8 && titular.addressNumber
  const cartaoOk = cartao.holderName && cartao.number.replace(/\s/g, '').length === 16 && cartao.expiryMonth && cartao.expiryYear && cartao.ccv.length >= 3

  const preReg = useMutation({
    mutationFn: () => assinaturaApi.preRegister({ nome: conta.nome, email: conta.email, senha: conta.senha }),
    onSuccess: (data) => {
      tokenRef.current = data.token
      setTitular((p) => ({ ...p, name: conta.nome, email: conta.email }))
      setCartao((p) => ({ ...p, holderName: conta.nome.toUpperCase() }))
      setApiError('')
      setStep(1)
    },
    onError: (err: any) => setApiError(err.response?.data?.detail ?? 'Erro ao criar conta.'),
  })

  const pagar = useMutation({
    mutationFn: async () => {
      setApiError('')
      const prev = localStorage.getItem('kealex_token')
      localStorage.setItem('kealex_token', tokenRef.current)
      try {
        const { customerId } = await assinaturaApi.criarClienteAsaas(titular)
        return await assinaturaApi.assinar({
          plano: planoId,
          asaasCustomerId: customerId,
          creditCard: cartao,
          holderInfo: titular,
        })
      } finally {
        if (prev) {
          localStorage.setItem('kealex_token', prev)
        } else {
          localStorage.removeItem('kealex_token')
        }
      }
    },
    onSuccess: (data) => {
      setResultado({
        subscriptionId: data.subscriptionId,
        nextDueDate: data.nextDueDate,
        value: data.value,
      })
      setStep(4)
    },
    onError: (err: any) => setApiError(err.response?.data?.detail ?? 'Erro ao processar pagamento.'),
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#081B33]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#00C2A8]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F96313]/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00C2A8]/5 rounded-full blur-3xl" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
      </div>

      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/"><img src={logo} alt="Kealex" className="h-8 w-auto object-contain brightness-0 invert" /></Link>
        <div className="flex items-center gap-1.5 text-xs text-white/50"><Lock size={12} className="text-[#00C2A8]" />Pagamento seguro via Asaas</div>
      </header>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <Steps cur={0} />
              <h1 className="text-2xl font-extrabold text-white text-center mb-1">Crie sua conta</h1>
              <p className="text-sm text-white/50 text-center mb-6">Seus dados ficam salvos para acessar a plataforma apos o pagamento</p>
              <Card>
                <div className="space-y-4">
                  <F label="Nome completo"><input value={conta.nome} onChange={(e) => setConta({ ...conta, nome: e.target.value })} placeholder="Dr. Rafael Mendes" className={inp} /></F>
                  <F label="E-mail profissional"><input type="email" value={conta.email} onChange={(e) => setConta({ ...conta, email: e.target.value })} placeholder="rafael@escritorio.com.br" className={inp} /></F>
                  <F label="Senha">
                    <div className="relative">
                      <input type={showSenha ? 'text' : 'password'} value={conta.senha} onChange={(e) => setConta({ ...conta, senha: e.target.value })} placeholder="Minimo 6 caracteres" className={`${inp} pr-10`} />
                      <button type="button" onClick={() => setShowSenha((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showSenha ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </F>
                  <F label="Confirmar senha"><input type="password" value={conta.confirmar} onChange={(e) => setConta({ ...conta, confirmar: e.target.value })} placeholder="Repita a senha" className={inp} /></F>
                  {conta.confirmar && conta.senha !== conta.confirmar && <p className="text-xs text-red-500">As senhas nao coincidem</p>}
                  {apiError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{apiError}</p>}
                </div>
              </Card>
              <button onClick={() => preReg.mutate()} disabled={!contaOk || preReg.isPending} className="w-full mt-4 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-lg shadow-orange-900/30">
                {preReg.isPending ? <><Loader2 size={15} className="animate-spin" />Criando conta...</> : <>Continuar <ArrowRight size={15} /></>}
              </button>
              <p className="text-center text-xs text-white/30 mt-3">Ja tem conta? <Link to="/entrar" className="text-[#00C2A8] hover:underline">Entrar</Link></p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <Steps cur={1} />
              <h1 className="text-2xl font-extrabold text-white text-center mb-1">Escolha seu plano</h1>
              <p className="text-sm text-white/50 text-center mb-6">7 dias gratis. Cancele quando quiser.</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {PLANOS_CONFIG.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPlanoId(p.id)} className={`relative text-left p-5 rounded-2xl border-2 transition-all ${planoId === p.id ? 'border-[#00C2A8] bg-[#00C2A8]/10 shadow-lg shadow-[#00C2A8]/10' : 'border-white/20 bg-white/5 hover:border-white/40'}`}>
                    {p.destaque && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F96313] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap"><Star size={9} fill="currentColor" />Mais Popular</span>}
                    <div className="flex items-start justify-between mb-3">
                      <div><p className="font-bold text-white">{p.nome}</p><p className="text-xs text-white/50 mt-0.5">{p.descricao}</p></div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${planoId === p.id ? 'border-[#00C2A8] bg-[#00C2A8]' : 'border-white/30'}`}>{planoId === p.id && <Check size={11} className="text-white" />}</div>
                    </div>
                    <p className="text-2xl font-extrabold text-white">R$ {p.valor.toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-white/40">/mes</span></p>
                    <ul className="mt-3 space-y-1.5">{p.recursos.map((r) => <li key={r} className="flex items-center gap-2 text-xs text-white/60"><CheckCircle2 size={11} className="text-[#00C2A8] shrink-0" />{r}</li>)}</ul>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3.5 border border-white/20 text-white/70 font-semibold rounded-xl hover:bg-white/5 flex items-center justify-center gap-2 text-sm"><ArrowLeft size={15} />Voltar</button>
                <button onClick={() => setStep(2)} className="flex-[2] bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-900/30">Continuar com {plano.nome} <ArrowRight size={15} /></button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <Steps cur={2} />
              <h1 className="text-2xl font-extrabold text-white text-center mb-1">Dados do titular</h1>
              <p className="text-sm text-white/50 text-center mb-6">Informacoes do responsavel pelo pagamento</p>
              <Card>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2"><F label="Nome completo"><input value={titular.name} onChange={(e) => setTitular({ ...titular, name: e.target.value })} placeholder="Como aparece no cartao" className={inp} /></F></div>
                  <F label="E-mail"><input type="email" value={titular.email} onChange={(e) => setTitular({ ...titular, email: e.target.value })} placeholder="email@exemplo.com" className={inp} /></F>
                  <F label="CPF"><input value={titular.cpfCnpj} onChange={(e) => setTitular({ ...titular, cpfCnpj: fmtCpf(e.target.value) })} placeholder="000.000.000-00" className={inp} /></F>
                  <F label="CEP"><input value={titular.postalCode} onChange={(e) => setTitular({ ...titular, postalCode: fmtCep(e.target.value) })} placeholder="00000-000" className={inp} /></F>
                  <F label="Numero"><input value={titular.addressNumber} onChange={(e) => setTitular({ ...titular, addressNumber: e.target.value })} placeholder="123" className={inp} /></F>
                  <div className="sm:col-span-2"><F label="Complemento (opcional)"><input value={titular.addressComplement ?? ''} onChange={(e) => setTitular({ ...titular, addressComplement: e.target.value })} placeholder="Apto, sala..." className={inp} /></F></div>
                  <F label="Telefone"><input value={titular.phone ?? ''} onChange={(e) => setTitular({ ...titular, phone: fmtPhone(e.target.value) })} placeholder="(11) 3333-4444" className={inp} /></F>
                  <F label="Celular"><input value={titular.mobilePhone ?? ''} onChange={(e) => setTitular({ ...titular, mobilePhone: fmtPhone(e.target.value) })} placeholder="(11) 99999-9999" className={inp} /></F>
                </div>
              </Card>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 border border-white/20 text-white/70 font-semibold rounded-xl hover:bg-white/5 flex items-center justify-center gap-2 text-sm"><ArrowLeft size={15} />Voltar</button>
                <button onClick={() => setStep(3)} disabled={!titularOk} className="flex-[2] bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-900/30">Continuar <ArrowRight size={15} /></button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <Steps cur={3} />
              <h1 className="text-2xl font-extrabold text-white text-center mb-1">Pagamento</h1>
              <p className="text-sm text-white/50 text-center mb-6">Finalize a assinatura com cartao de credito</p>

              <Card>
                <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-slate-200">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Plano selecionado</p>
                    <p className="font-bold text-[#081B33] text-sm">{plano.nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-[#081B33]">R$ {plano.valor.toFixed(2).replace('.', ',')}</p>
                    <p className="text-xs text-slate-400">/mes</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <F label="Nome no cartao"><input value={cartao.holderName} onChange={(e) => setCartao({ ...cartao, holderName: e.target.value.toUpperCase() })} placeholder="NOME COMO NO CARTAO" className={inp} /></F>
                  <F label="Numero do cartao">
                    <div className="relative">
                      <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input value={cartao.number} onChange={(e) => setCartao({ ...cartao, number: fmtCard(e.target.value) })} placeholder="0000 0000 0000 0000" className={`${inp} pl-9`} />
                    </div>
                  </F>
                  <div className="grid grid-cols-3 gap-3">
                    <F label="Mes"><input value={cartao.expiryMonth} onChange={(e) => setCartao({ ...cartao, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })} placeholder="MM" maxLength={2} className={inp} /></F>
                    <F label="Ano"><input value={cartao.expiryYear} onChange={(e) => setCartao({ ...cartao, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="AAAA" maxLength={4} className={inp} /></F>
                    <F label="CVV"><input value={cartao.ccv} onChange={(e) => setCartao({ ...cartao, ccv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="000" maxLength={4} className={inp} /></F>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 mt-4">
                  <ShieldCheck size={12} className="text-[#00C2A8]" />
                  <span>Pagamento processado com seguranca via Asaas.</span>
                </div>

                {apiError && <p className="mt-4 text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{apiError}</p>}
              </Card>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 border border-white/20 text-white/70 font-semibold rounded-xl hover:bg-white/5 flex items-center justify-center gap-2 text-sm"><ArrowLeft size={15} />Voltar</button>
                <button onClick={() => pagar.mutate()} disabled={!cartaoOk || pagar.isPending} className="flex-[2] bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-900/30">
                  {pagar.isPending ? <><Loader2 size={15} className="animate-spin" />Processando...</> : <>Confirmar assinatura <ArrowRight size={15} /></>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && resultado && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="text-center">
              <Steps cur={4} />
              <div className="w-16 h-16 rounded-2xl bg-[#00C2A8]/10 border border-[#00C2A8]/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-[#00C2A8]" />
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">Assinatura ativada!</h1>
              <p className="text-sm text-white/60 mb-6">Seu plano {plano.nome} ja esta ativo. A primeira cobranca sera em {new Date(resultado.nextDueDate).toLocaleDateString('pt-BR')}.</p>

              <Card>
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Plano</span><span className="font-semibold text-[#081B33]">{plano.nome}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Valor</span><span className="font-semibold text-[#081B33]">R$ {resultado.value.toFixed(2).replace('.', ',')} /mes</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Proxima cobranca</span><span className="font-semibold text-[#081B33]">{new Date(resultado.nextDueDate).toLocaleDateString('pt-BR')}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-slate-500">ID da assinatura</span><span className="font-mono text-xs font-semibold text-[#081B33]">{resultado.subscriptionId.slice(0, 16)}...</span></div>
                </div>
              </Card>

              <div className="mt-5 flex gap-3">
                <Link to="/entrar" className="flex-1 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-orange-900/30">Entrar agora <ArrowRight size={15} /></Link>
                <Link to="/" className="flex-1 border border-white/20 text-white/80 font-semibold rounded-xl hover:bg-white/5 flex items-center justify-center gap-2 text-sm">Voltar ao inicio</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

