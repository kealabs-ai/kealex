import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import fundoImg from '../assets/fundo_home_kealex.jpg'
import logo from '../assets/logotipo_kealex.png'

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

  const mutation = useMutation({
    mutationFn: ({ email, senha }: FormData) => authApi.login(email, senha),
    onSuccess: (data) => {
      login(data)
      navigate(from === '/entrar' ? '/processos' : from, { replace: true })
    },
    onError: (error: any) => {
      const isTimeout = error.code === 'ECONNABORTED' || error.response?.status === 504
      if (isTimeout) alert('Servidor não está respondendo. Verifique se o backend está rodando.')
    },
  })

  if (user) return <Navigate to="/processos" replace />

  return (
    <div className="min-h-screen flex font-sans">
      {/* ── Painel esquerdo — imagem + copy ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* Imagem de fundo */}
        <img
          src={fundoImg}
          alt="Kealex Platform"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay navy */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#081B33]/90 via-[#081B33]/75 to-[#0f2d4a]/80" />

        {/* Ambient glow */}
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#00C2A8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#F96313]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <img src={logo} alt="Kealex" className="h-9 w-auto object-contain brightness-0 invert" />
          </Link>
        </div>

        {/* Copy central */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#00C2A8]/15 border border-[#00C2A8]/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={13} className="text-[#00C2A8]" />
            <span className="text-xs font-semibold text-[#00C2A8] tracking-wide">Inteligência Artificial Jurídica Brasileira 2026</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
            Gerencie seu escritório.{' '}
            <span className="bg-gradient-to-r from-[#00C2A8] to-[#38bdf8] bg-clip-text text-transparent">
              A IA cuida do resto.
            </span>
          </h1>

          <p className="text-slate-300 text-base leading-relaxed mb-10 max-w-md">
            Da distribuição ao trânsito em julgado — processos, prazos, cobranças e documentos com IA treinada no CPC, CLT e jurisprudência STF/STJ.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Processos ativos', value: '2.4k+' },
              { label: 'Documentos', value: '18k+' },
              { label: 'Advogados', value: '340+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between">
          <p className="text-xs text-slate-500">Kealabs AI © 2026. Todos os direitos reservados.</p>
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck size={12} className="text-[#00C2A8]" /> 100% LGPD
          </span>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F8FAFC]">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Logo mobile */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <img src={logo} alt="Kealex" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-[#081B33] mb-1">Bem-vindo de volta</h2>
            <p className="text-sm text-[#596B82]">Acesse sua plataforma jurídica com IA</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#081B33] uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596B82]" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@escritorio.com.br"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all text-[#081B33] placeholder-slate-400"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#081B33] uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#596B82]" />
                <input
                  {...register('senha')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all text-[#081B33] placeholder-slate-400"
                />
              </div>
              {errors.senha && <p className="text-xs text-red-500">{errors.senha.message}</p>}
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
              className="w-full flex items-center justify-center gap-2 bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-200 mt-2"
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
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Trial CTA */}
          <Link
            to="/#trial"
            className="block text-center py-3 border-2 border-[#081B33] text-[#081B33] font-bold rounded-xl text-sm hover:bg-[#081B33] hover:text-white transition-all"
          >
            Começar Trial Gratuito — 14 dias
          </Link>


          <p className="text-xs text-slate-400 text-center mt-6">
            Kealabs AI © 2026 · <a href="#" className="hover:text-[#00C2A8]">Privacidade</a> · <a href="#" className="hover:text-[#00C2A8]">LGPD</a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
