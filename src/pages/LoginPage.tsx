import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useToast } from '../components/Toast'
import logo from '../assets/logotipo_kealex.png'
import background from '../assets/bg_login_kealex.png'

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe sua senha').min(6, 'Mínimo 6 caracteres'),
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
    <main className="login-page" style={{ backgroundImage: `url("${background}")` }}>
      <motion.section
        className="login-card"
        aria-labelledby="login-title"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="login-logo-link" aria-label="KEALEX — página inicial">
          <img src={logo} alt="KEALEX" className="login-logo" />
        </Link>

        <header className="login-heading">
          <h1 id="login-title">Bem-vindo(a)</h1>
          <p>Acesse sua conta para continuar.</p>
        </header>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="login-form" noValidate>
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="login-input-wrap">
              <Mail size={19} aria-hidden="true" />
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && <p id="email-error" className="login-field-error" role="alert">{errors.email.message}</p>}
          </div>

          <div className="login-field">
            <label htmlFor="senha">Senha</label>
            <div className="login-input-wrap">
              <Lock size={19} aria-hidden="true" />
              <input
                {...register('senha')}
                id="senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                autoComplete="current-password"
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? 'senha-error' : undefined}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {errors.senha && <p id="senha-error" className="login-field-error" role="alert">{errors.senha.message}</p>}
          </div>

          <div className="login-recovery-row">
            <a href="mailto:suporte@kealabs.com.br?subject=Recupera%C3%A7%C3%A3o%20de%20senha">Esqueceu sua senha?</a>
          </div>

          {mutation.isError && (
            <motion.p className="login-error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              E-mail ou senha inválidos. Confira seus dados e tente novamente.
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={mutation.isPending}
            whileTap={{ scale: 0.99 }}
            className="login-submit"
          >
            {mutation.isPending ? (
              <><span className="login-spinner" aria-hidden="true" />Entrando...</>
            ) : (
              <>Entrar <ArrowRight size={21} aria-hidden="true" /></>
            )}
          </motion.button>
        </form>

        <footer className="login-footer">
          <span>Não tem uma conta?</span>{' '}
          <a href="mailto:contato@kealabs.com.br">Fale com o nosso time</a>
        </footer>
      </motion.section>
    </main>
  )
}
