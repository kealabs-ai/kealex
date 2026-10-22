import { useForm } from 'react-hook-form'
import { useCallback, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast'
import { Modal } from '../components/Modal'
import { TrialModal } from '../components/site/TrialModal'
import logo from '../assets/logotipo_kealex.png'
import background from '../assets/kealex_background_2560x1440.png'

const schema = z.object({
  email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(1, 'Informe sua senha').min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const { error: toastError } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [trialOpen, setTrialOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  })

  const openResetModal = () => {
    setResetEmail(getValues('email'))
    resetPasswordMutation.reset()
    setResetModalOpen(true)
  }
  const closeResetModal = useCallback(() => setResetModalOpen(false), [])

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
      navigate(trialExpired || blockedPaidPlan ? '/trial-expirado' : (from ?? (data.role === 'escritorio' ? '/equipe' : '/processos')), { replace: true })
    },
    onError: (error: any) => {
      const isTimeout = error.code === 'ECONNABORTED' || error.response?.status === 504
      if (isTimeout) toastError('Servidor não está respondendo. Verifique se o backend está rodando.')
    },
  })

  if (user) return <Navigate to={user.role === 'escritorio' ? '/equipe' : '/processos'} replace />

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
            <button type="button" onClick={openResetModal}>Esqueceu sua senha?</button>
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
          <button type="button" onClick={() => setTrialOpen(true)}>Crie sua conta grátis por 7 dias</button>
        </footer>
      </motion.section>
      <TrialModal open={trialOpen} onClose={() => setTrialOpen(false)} />
      {resetModalOpen && <Modal
        title="Recuperar senha"
        subtitle="Informe o e-mail associado à sua conta."
        onClose={closeResetModal}
        size="sm"
      >
        {resetPasswordMutation.isSuccess ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <p className="m-0 text-sm">Se houver uma conta associada a esse e-mail, enviaremos instruções para redefinir sua senha.</p>
            </div>
            <button type="button" className="login-submit" onClick={closeResetModal}>Voltar ao login</button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              resetPasswordMutation.mutate(resetEmail.trim())
            }}
          >
            <label className="login-field">
              <span>E-mail</span>
              <span className="login-input-wrap">
                <Mail size={18} aria-hidden="true" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  required
                  disabled={resetPasswordMutation.isPending}
                />
              </span>
            </label>
            {resetPasswordMutation.isError && (
              <p className="login-error" role="alert">Não foi possível solicitar a redefinição agora. Confira o e-mail e tente novamente.</p>
            )}
            <button type="submit" className="login-submit" disabled={resetPasswordMutation.isPending || !resetEmail.trim()}>
              {resetPasswordMutation.isPending
                ? <><Loader2 size={17} className="animate-spin" /> Enviando...</>
                : <>Enviar instruções <ArrowRight size={18} /></>}
            </button>
          </form>
        )}
      </Modal>}
    </main>
  )
}
