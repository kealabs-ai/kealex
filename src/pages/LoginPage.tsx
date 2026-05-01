import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Scale, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'

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
      navigate(from === '/login' ? '/processos' : from, { replace: true })
    },
  })

  if (user) return <Navigate to="/processos" replace />

  return (
    <div className="min-h-screen flex">
      {/* left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* animated bg orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <Scale size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">Kealex</span>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5 mb-6">
              <Sparkles size={13} className="text-indigo-400" />
              <span className="text-xs text-indigo-300 font-medium">Plataforma Jurídica SaaS</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Gerencie seus<br />
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                processos jurídicos
              </span>
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Controle processos, documentos, prazos e honorários em um único lugar com segurança e eficiência.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-4 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[
              { label: 'Processos', value: '2.4k+' },
              { label: 'Documentos', value: '18k+' },
              { label: 'Advogados', value: '340+' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <p className="relative z-10 text-xs text-gray-600">© 2025 Kealex. Todos os direitos reservados.</p>
      </div>

      {/* right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <Scale size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Kealex</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Bem-vindo de volta</h2>
          <p className="text-sm text-gray-500 mb-8">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('senha')}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
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
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-3 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 transition-all shadow-lg shadow-indigo-200 mt-2"
            >
              {mutation.isPending ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <>Entrar <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Credenciais de teste</p>
            <div className="space-y-1">
              {[
                { role: 'Admin', email: 'admin@keahub.com', senha: 'admin123' },
                { role: 'Advogado', email: 'adv@keahub.com', senha: 'adv123' },
                { role: 'Cliente', email: 'cliente@keahub.com', senha: 'cli123' },
              ].map(({ role, email, senha }) => (
                <div key={role} className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-700 w-16">{role}</span>
                  <span className="font-mono">{email}</span>
                  <span className="font-mono text-gray-400">{senha}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
