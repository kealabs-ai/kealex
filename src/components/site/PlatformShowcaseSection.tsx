import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Briefcase, Users, CheckCircle2, AlertTriangle, Clock, FileText, Upload, Lock, ChevronRight } from 'lucide-react'

const TABS = [
  { id: 'intimacoes', label: 'Intimações IA', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'trabalhista', label: 'Trabalhista & Família', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'portal', label: 'Portal do Cliente', icon: Users, color: 'text-[#00C2A8]', bg: 'bg-[#00C2A8]/10' },
]

function IntimacoesMock() {
  return (
    <div className="space-y-3">
      {/* Header do painel */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-[#081B33]">Painel de Intimações Inteligentes</p>
          <p className="text-[11px] text-slate-400">Captura automática via IA · Atualizado há 3 min</p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#00C2A8] bg-[#00C2A8]/10 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] animate-pulse" />
          IA Ativa
        </span>
      </div>

      {/* Alerta crítico */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5"
      >
        <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-red-700">⚠️ PRAZO FATAL — Vence em 2 dias</p>
            <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shrink-0">URGENTE</span>
          </div>
          <p className="text-[11px] text-red-600 mt-0.5">Proc. 0012345-67.2024.5.02.0001 · Recurso Ordinário</p>
          <p className="text-[11px] text-slate-500 mt-1">Intimação capturada no DEJT · 14/07/2025 · 2ª Vara do Trabalho SP</p>
        </div>
      </motion.div>

      {/* Intimação normal */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5"
      >
        <Clock size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-amber-700">Prazo em 8 dias úteis</p>
            <span className="text-[10px] bg-amber-400 text-white px-2 py-0.5 rounded-full font-bold shrink-0">ATENÇÃO</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-0.5">Proc. 0098765-43.2024.8.26.0100 · Contestação</p>
          <p className="text-[11px] text-slate-500 mt-1">Capturado no DJe-SP · 15/07/2025 · 3ª Vara de Família</p>
        </div>
      </motion.div>

      {/* Concluído */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-3.5"
      >
        <CheckCircle2 size={16} className="text-[#00C2A8] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-600">Cumprido · Petição protocolada</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Proc. 0011111-22.2024.5.15.0001 · Manifestação</p>
          <p className="text-[11px] text-slate-400 mt-1">Protocolo confirmado · 13/07/2025</p>
        </div>
      </motion.div>

      {/* Notificação WhatsApp simulada */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3"
      >
        <span className="text-lg">📱</span>
        <div>
          <p className="text-[11px] font-bold text-green-700">WhatsApp enviado automaticamente</p>
          <p className="text-[10px] text-green-600">"Dr. Rafael, prazo fatal em 2 dias — Proc. 0012345. Acesse o KeaLex."</p>
        </div>
      </motion.div>
    </div>
  )
}

function TrabalhistaMock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-[#081B33]">Módulo Trabalhista & Família</p>
          <p className="text-[11px] text-slate-400">Campos organizados por rito processual</p>
        </div>
        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">CLT · CPC</span>
      </div>

      {/* Tabs de rito */}
      <div className="flex gap-2 mb-3">
        {['Rito Ordinário', 'Rito Sumaríssimo', 'Divórcio', 'Inventário'].map((r, i) => (
          <span
            key={r}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${i === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
          >
            {r}
          </span>
        ))}
      </div>

      {/* Verbas trabalhistas */}
      <div className="bg-white border border-slate-100 rounded-xl p-3.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Verbas Rescisórias</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Saldo de Salário', value: 'R$ 2.340,00', ok: true },
            { label: 'Aviso Prévio', value: 'R$ 3.120,00', ok: true },
            { label: 'FGTS + Multa 40%', value: 'R$ 8.450,00', ok: true },
            { label: 'Férias + 1/3', value: 'R$ 4.160,00', ok: false },
          ].map((v) => (
            <div key={v.label} className={`rounded-lg p-2 ${v.ok ? 'bg-slate-50' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-[10px] text-slate-400">{v.label}</p>
              <p className={`text-xs font-bold ${v.ok ? 'text-[#081B33]' : 'text-amber-600'}`}>{v.value}</p>
              {!v.ok && <p className="text-[9px] text-amber-500 mt-0.5">⚠ Verificar</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Vínculo empregatício */}
      <div className="bg-white border border-slate-100 rounded-xl p-3.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Vínculo Empregatício</p>
        <div className="space-y-1.5">
          {[
            { k: 'Admissão', v: '03/01/2022' },
            { k: 'Demissão', v: '30/06/2025' },
            { k: 'Tempo de serviço', v: '3 anos e 6 meses' },
            { k: 'Motivo', v: 'Dispensa sem justa causa' },
          ].map((row) => (
            <div key={row.k} className="flex justify-between text-[11px]">
              <span className="text-slate-400">{row.k}</span>
              <span className="font-semibold text-[#081B33]">{row.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PortalMock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-[#081B33]">Portal Seguro do Cliente</p>
          <p className="text-[11px] text-slate-400">Visão do cliente · Link criptografado</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-[#00C2A8] bg-[#00C2A8]/10 px-3 py-1 rounded-full">
          <Lock size={10} /> Criptografado
        </span>
      </div>

      {/* Boas-vindas do cliente */}
      <div className="bg-gradient-to-r from-[#081B33] to-[#0f2d4a] rounded-xl p-4 text-white">
        <p className="text-xs text-slate-400 mb-0.5">Olá,</p>
        <p className="text-sm font-bold">Maria da Silva</p>
        <p className="text-[11px] text-slate-400 mt-1">Processo de Divórcio · Fase: Audiência de Conciliação</p>
        <div className="mt-3 flex gap-2">
          {['Documentos', 'Andamentos', 'Mensagens'].map((tab, i) => (
            <span key={tab} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${i === 0 ? 'bg-[#00C2A8] text-white' : 'bg-white/10 text-slate-300'}`}>
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Upload de documentos */}
      <div className="bg-white border border-slate-100 rounded-xl p-3.5">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Documentos Solicitados</p>
        <div className="space-y-2">
          {[
            { name: 'Certidão de Casamento', status: 'enviado', icon: '✅' },
            { name: 'Comprovante de Renda', status: 'enviado', icon: '✅' },
            { name: 'Escritura do Imóvel', status: 'pendente', icon: '⏳' },
            { name: 'Extrato Bancário (6 meses)', status: 'pendente', icon: '⏳' },
          ].map((doc) => (
            <div key={doc.name} className={`flex items-center justify-between rounded-lg px-3 py-2 ${doc.status === 'enviado' ? 'bg-green-50' : 'bg-amber-50 border border-amber-100'}`}>
              <div className="flex items-center gap-2">
                <FileText size={12} className={doc.status === 'enviado' ? 'text-green-500' : 'text-amber-500'} />
                <span className="text-[11px] font-medium text-[#081B33]">{doc.name}</span>
              </div>
              <span className="text-[10px]">{doc.icon}</span>
            </div>
          ))}
        </div>
        <button className="mt-3 w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#00C2A8]/40 rounded-xl py-2.5 text-[11px] font-bold text-[#00C2A8] hover:bg-[#00C2A8]/5 transition-colors">
          <Upload size={12} /> Enviar documento seguro
        </button>
      </div>
    </div>
  )
}

const MOCKS = { intimacoes: IntimacoesMock, trabalhista: TrabalhistaMock, portal: PortalMock }

export function PlatformShowcaseSection() {
  const [active, setActive] = useState('intimacoes')
  const ActiveMock = MOCKS[active as keyof typeof MOCKS]

  return (
    <section id="plataforma" className="py-20 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-[#00C2A8]/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold text-[#00C2A8] uppercase tracking-widest mb-3">Por dentro do KeaLex</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#081B33] mb-4">
            Veja a plataforma em ação
          </h2>
          <p className="text-[#596B82] max-w-lg mx-auto text-sm">
            Interface pensada para advogados. Sem curva de aprendizado, sem burocracia.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Tabs laterais */}
          <div className="lg:col-span-2 space-y-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = active === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActive(tab.id)}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
                    isActive
                      ? 'border-[#00C2A8] bg-[#00C2A8]/5 shadow-md'
                      : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${tab.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={tab.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isActive ? 'text-[#081B33]' : 'text-slate-600'}`}>{tab.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {tab.id === 'intimacoes' && 'Captura automática de prazos fatais'}
                      {tab.id === 'trabalhista' && 'Verbas, vínculos e ritos organizados'}
                      {tab.id === 'portal' && 'Documentos sigilosos sem WhatsApp'}
                    </p>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-[#00C2A8] shrink-0" />}
                </motion.button>
              )
            })}

            {/* CTA lateral */}
            <div className="mt-4 bg-gradient-to-br from-[#081B33] to-[#0f2d4a] rounded-2xl p-5 text-center">
              <p className="text-white font-bold text-sm mb-1">Quer ver ao vivo?</p>
              <p className="text-slate-400 text-xs mb-3">Teste grátis por 7 dias, sem cartão.</p>
              <a
                href="#trial"
                className="inline-flex items-center gap-1.5 bg-[#F96313] hover:bg-[#e0550f] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                Começar Agora <ChevronRight size={12} />
              </a>
            </div>
          </div>

          {/* Preview da tela */}
          <div className="lg:col-span-3">
            {/* Barra de browser */}
            <div className="bg-slate-100 rounded-t-2xl px-4 py-2.5 flex items-center gap-2 border border-b-0 border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3 bg-white border border-slate-200 rounded-lg px-3 py-1 text-[11px] text-slate-400 font-mono">
                app.kealex.com.br/{active}
              </div>
            </div>

            {/* Conteúdo da tela */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-b-2xl p-5 min-h-[420px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  <ActiveMock />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
