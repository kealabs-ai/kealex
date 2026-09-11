import { motion } from 'framer-motion'
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logotipo_kealex.png'

const PLANOS = [
  { nome: 'Starter', preco: 'R$ 197/mês', destaque: false },
  { nome: 'Professional', preco: 'R$ 397/mês', destaque: true },
  { nome: 'Enterprise', preco: 'Sob consulta', destaque: false },
]

export function TrialExpiradoPage() {
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div
        className="w-full max-w-lg text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <Link to="/">
          <img src={logo} alt="Kealex" className="h-8 w-auto object-contain mx-auto mb-8" />
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <Lock size={24} className="text-amber-500" />
          </div>

          <h1 className="text-2xl font-extrabold text-[#081B33] mb-2">
            Seu trial de 7 dias encerrou
          </h1>
          <p className="text-sm text-[#596B82] mb-6">
            Para continuar usando o Kealex, escolha um plano abaixo. Seus dados estão salvos e prontos para uso.
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {PLANOS.map((p) => (
              <div
                key={p.nome}
                className={`rounded-xl border p-3 text-center ${
                  p.destaque
                    ? 'border-[#00C2A8] bg-[#00C2A8]/5 ring-1 ring-[#00C2A8]'
                    : 'border-slate-200'
                }`}
              >
                {p.destaque && (
                  <span className="text-[10px] font-bold text-[#00C2A8] uppercase tracking-wide block mb-1">
                    Popular
                  </span>
                )}
                <p className="text-sm font-bold text-[#081B33]">{p.nome}</p>
                <p className="text-xs text-[#596B82] mt-0.5">{p.preco}</p>
              </div>
            ))}
          </div>

          <a
            href="/#precos"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#F96313] hover:bg-[#e0550f] text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-orange-100 text-sm"
          >
            Ver planos e assinar <ArrowRight size={16} />
          </a>

          <div className="flex items-center gap-2 justify-center mt-4 text-xs text-[#596B82]">
            <CheckCircle2 size={13} className="text-[#00C2A8]" />
            Garantia de 7 dias após a assinatura · Cancele quando quiser
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          Sair da conta
        </button>
      </motion.div>
    </div>
  )
}
