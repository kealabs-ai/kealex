import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, X, Loader2, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

const PERFIS = [
  { value: 'advogado',    label: 'Advogado Autônomo' },
  { value: 'escritorio',  label: 'Escritório de Advocacia' },
  { value: 'corporativo', label: 'Departamento Jurídico' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function TrialModal({ open, onClose }: Props) {
  const [done, setDone]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro]       = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false)
  const [form, setForm]       = useState({ nome: '', email: '', whatsapp: '', perfil: 'advogado', senha: '', confirmarSenha: '' })

  const { login } = useAuth()
  const navigate  = useNavigate()

  const maskWhatsapp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d.replace(/(\d{0,2})/, '($1')
    if (d.length <= 7) return d.replace(/(\d{2})(\d{0,5})/, '($1) $2')
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  const handleClose = () => {
    if (loading) return
    setDone(false)
    setErro('')
    setShowSenha(false)
    setShowConfirmarSenha(false)
    setForm({ nome: '', email: '', whatsapp: '', perfil: 'advogado', senha: '', confirmarSenha: '' })
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro('')

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const user = await authApi.register({
        ...form,
        confirmarSenha: undefined,
      } as any)
      login(user)
      setDone(true)
    } catch (err: any) {
      setErro(err.response?.data?.detail ?? 'Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleEntrar = () => {
    handleClose()
    navigate('/processos')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {!done ? (
              <>
                <div className="bg-[#081B33] px-7 py-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Começar Teste Grátis de 7 Dias</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Sem cartão de crédito · Cancele quando quiser</p>
                  </div>
                  <button onClick={handleClose} className="text-slate-400 hover:text-white mt-0.5">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-7 space-y-4">
                  {[
                    { label: 'Nome completo',       key: 'nome',  type: 'text',  placeholder: 'Dr. Rafael Mendes' },
                    { label: 'E-mail profissional', key: 'email', type: 'email', placeholder: 'rafael@escritorio.com.br' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        required
                        disabled={loading}
                        value={(form as any)[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all disabled:opacity-50"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      required
                      disabled={loading}
                      value={form.whatsapp}
                      onChange={(e) => setForm({ ...form, whatsapp: maskWhatsapp(e.target.value) })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Senha</label>
                    <div className="relative">
                      <input
                        type={showSenha ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                        disabled={loading}
                        value={form.senha}
                        onChange={(e) => setForm({ ...form, senha: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSenha(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmar senha</label>
                    <div className="relative">
                      <input
                        type={showConfirmarSenha ? 'text' : 'password'}
                        placeholder="Repita sua senha"
                        required
                        minLength={6}
                        disabled={loading}
                        value={form.confirmarSenha}
                        onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                        className="w-full px-4 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmarSenha(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmarSenha ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Perfil</label>
                    <select
                      value={form.perfil}
                      disabled={loading}
                      onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#00C2A8] transition-all bg-white disabled:opacity-50"
                    >
                      {PERFIS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>

                  {erro && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      {erro}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 size={16} className="animate-spin" /> Criando sua conta...</>
                      : <>Começar Teste Grátis de 7 Dias <ArrowRight size={16} /></>
                    }
                  </button>

                  <p className="text-xs text-slate-400 text-center">
                    Ao continuar, você concorda com os <a href="/termos" className="underline">Termos de Uso</a> e <a href="/lgpd" className="underline">Política de Privacidade</a> (LGPD).
                  </p>
                </form>
              </>
            ) : (
              <div className="p-10 text-center">
                <CheckCircle2 size={48} className="text-[#00C2A8] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#081B33] mb-2">
                  Tudo certo, {form.nome.split(' ')[0]}!
                </h3>
                <p className="text-sm text-[#596B82] mb-6">
                  Sua conta foi criada com sucesso. Seu trial de <strong>7 dias</strong> começa agora.
                </p>
                <button
                  onClick={handleEntrar}
                  className="w-full bg-[#F96313] hover:bg-[#e0550f] text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  Acessar a plataforma <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
