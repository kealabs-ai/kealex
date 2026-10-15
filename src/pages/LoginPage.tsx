import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Scale, FolderKanban, CalendarCheck, FileText } from 'lucide-react'
import { useToast } from '../components/Toast'
import logo from '../assets/logotipo_kealex.png'
import { TrialModal } from '../components/site/TrialModal'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname ?? '/processos'
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const { error: toastError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [trialOpen, setTrialOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: ({ email, senha }: FormData) => authApi.login(email, senha),
    onSuccess: (data) => {
      login(data)
      const trialExpired = data.plano === 'trial' && !!data.trialExpiresAt
        && Date.parse(data.trialExpiresAt) <= Date.now()
      if (
        (data.plano === 'pending' || data.subscriptionStatus?.toLowerCase() === 'pending')
        && (data.plano !== 'trial' || trialExpired)
      ) {
        return navigate('/pagamento-pendente', { replace: true })
      }
      const blockedPaidPlan = data.plano !== 'trial'
        && (data.tenantAtivo === false || Boolean(data.subscriptionStatus && data.subscriptionStatus.toLowerCase() !== 'active'))
      navigate(trialExpired || blockedPaidPlan ? '/trial-expirado' : (from === '/entrar' ? '/processos' : from), { replace: true })
    },
    onError: (error: any) => {
      const isTimeout = error.code === 'ECONNABORTED' || error.response?.status === 504
      if (isTimeout) toastError('Servidor não está respondendo. Verifique se o backend está rodando.')
    },
  })

  if (user) return <Navigate to="/processos" replace />

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#070514] font-sans">
      {/* Painel institucional */}
      <aside className="hidden lg:flex lg:w-[48%] xl:w-1/2 flex-col justify-between bg-[#081B33] px-12 py-10 xl:px-16 xl:py-12">
        <div>
          <Link to="/">
            <img src={logo} alt="Kealex" className="h-10 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-[#00C2A8] mb-5">
            <span className="h-px w-8 bg-[#00C2A8]" />
            Gestão jurídica em um só lugar
          </div>
          <h1 className="text-4xl xl:text-[3.25rem] font-bold text-white leading-tight tracking-tight mb-5">
            Mais clareza para cuidar de cada caso.
          </h1>
          <p className="text-[#C3CFDC] text-base leading-relaxed max-w-lg">
            Organize processos, prazos, documentos e clientes em uma plataforma feita para a rotina do seu escritório.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Processos organizados', icon: FolderKanban },
              { label: 'Prazos acompanhados', icon: CalendarCheck },
              { label: 'Documentos centralizados', icon: FileText },
              { label: 'Acesso protegido', icon: ShieldCheck },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <Icon size={17} strokeWidth={1.8} className="text-[#00C2A8]" />
                <span className="text-sm text-[#E2E8F0]">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex items-center gap-2 text-xs text-[#93A4B8]">
          <Scale size={14} className="text-[#00C2A8]" />
          <span>Kealabs AI © 2026 · Todos os direitos reservados</span>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 sm:px-10">
        <motion.div
          className="w-full max-w-[420px]"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Logo mobile */}
          <div className="lg:hidden mb-10">
            <Link to="/">
              <img src={logo} alt="Kealex" className="h-8 w-auto object-contain dark:brightness-0 dark:invert" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#007A6A] dark:text-[#00C2A8] mb-2">Acesso à plataforma</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#081B33] dark:text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-sm leading-6 text-[#596B82] dark:text-slate-400">Entre com os dados da sua conta para continuar.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-[#081B33] dark:text-slate-200">E-mail</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596B82]" />
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="seu@escritorio.com.br"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-[#D6E0E9] dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#008F7D] dark:focus:border-[#00C2A8] focus:ring-4 focus:ring-[#00C2A8]/15 transition-colors text-[#081B33] dark:text-white placeholder-slate-400"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="senha" className="block text-sm font-semibold text-[#081B33] dark:text-slate-200">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596B82]" />
                <input
                  {...register('senha')}
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3.5 bg-white dark:bg-slate-900 border border-[#D6E0E9] dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-[#008F7D] dark:focus:border-[#00C2A8] focus:ring-4 focus:ring-[#00C2A8]/15 transition-colors text-[#081B33] dark:text-white placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#596B82] dark:text-slate-400 hover:text-[#081B33] dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-red-500" role="alert">{errors.senha.message}</p>}
            </div>

            {mutation.isError && (
              <motion.div
                className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-red-600">Email ou senha inválidos.</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={mutation.isPending}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-[#081B33] hover:bg-[#102B49] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00C2A8]/30 disabled:opacity-60 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors mt-2"
            >
              {mutation.isPending ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>Acessar Plataforma <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 dark:text-slate-500">ou</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Trial CTA */}
          <button
            type="button"
            onClick={() => setTrialOpen(true)}
            className="w-full block text-center py-3.5 border border-[#B8C8D8] dark:border-slate-700 text-[#081B33] dark:text-slate-200 font-semibold rounded-xl text-sm hover:border-[#008F7D] dark:hover:border-[#00C2A8] hover:bg-[#00C2A8]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00C2A8]/20 transition-colors"
          >
            Começar Trial Gratuito — 7 dias
          </button>

          <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />


          <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-6">
            Kealabs AI © 2026 · <Link to="/privacidade" className="hover:text-[#007A6A] dark:hover:text-[#00C2A8] transition-colors">Privacidade</Link> · <Link to="/lgpd" className="hover:text-[#007A6A] dark:hover:text-[#00C2A8] transition-colors">LGPD</Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
