import { useState } from 'react'
import { Mail, MessageCircle, Globe } from 'lucide-react'

export function ContactSection() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', empresa: '', assunto: '', mensagem: '', consentimento: false })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (status === 'sending') return; setStatus('sending')
    try {
      const response = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, origem: 'landing_contato' }) })
      if (!response.ok) throw new Error('Falha ao enviar')
      setStatus('success')
    } catch { setStatus('error') }
  }
  const field = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#081B33] outline-none transition focus:border-[#00a991] focus:ring-2 focus:ring-[#00C2A8]/15'
  return <section id="contato" className="bg-[#F8FAFC] py-20" aria-labelledby="contact-title">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-2xl text-center"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#008f7d]">Contato</p><h2 id="contact-title" className="text-3xl font-extrabold text-[#081B33] sm:text-4xl">Vamos transformar sua rotina jurídica?</h2><p className="mt-3 text-[#596B82]">Entre em contato com a equipe Kealex e descubra como a tecnologia pode apoiar seu escritório.</p></header>
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <aside className="space-y-4 rounded-2xl bg-[#081B33] p-7 text-white"><p className="text-lg font-bold">Fale com a Kealex</p><p className="text-sm leading-6 text-slate-300">Nossa equipe pode ajudar você a conhecer a plataforma e encontrar o melhor caminho para seu escritório.</p>
          <a className="flex items-center gap-3 rounded-xl bg-white/5 p-4 hover:bg-white/10" href="mailto:contato@kealabs.com.br"><Mail className="text-[#00D3B4]" size={19}/><span><span className="block text-xs text-slate-400">E-mail comercial</span>contato@kealabs.com.br</span></a>
          <a className="flex items-center gap-3 rounded-xl bg-white/5 p-4 hover:bg-white/10" href="https://www.kealex.com.br" target="_blank" rel="noreferrer"><Globe className="text-[#00D3B4]" size={19}/><span><span className="block text-xs text-slate-400">Site</span>www.kealex.com.br</span></a>
          <a className="inline-flex items-center gap-2 rounded-xl bg-[#00a991] px-4 py-3 text-sm font-bold text-white hover:bg-[#008f7d]" href="mailto:contato@kealabs.com.br?subject=Contato%20Kealex"><MessageCircle size={17}/>Falar com a equipe</a>
        </aside>
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#081B33]">Nome completo *<input className={`${field} mt-1.5`} required autoComplete="name" value={form.nome} onChange={e => update('nome', e.target.value)}/></label>
          <label className="text-sm font-semibold text-[#081B33]">E-mail *<input className={`${field} mt-1.5`} required type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)}/></label>
          <label className="text-sm font-semibold text-[#081B33]">Telefone ou WhatsApp *<input className={`${field} mt-1.5`} required type="tel" autoComplete="tel" value={form.telefone} onChange={e => update('telefone', e.target.value)}/></label>
          <label className="text-sm font-semibold text-[#081B33]">Escritório ou empresa<input className={`${field} mt-1.5`} value={form.empresa} onChange={e => update('empresa', e.target.value)}/></label>
          <label className="text-sm font-semibold text-[#081B33] sm:col-span-2">Assunto *<input className={`${field} mt-1.5`} required value={form.assunto} onChange={e => update('assunto', e.target.value)}/></label>
          <label className="text-sm font-semibold text-[#081B33] sm:col-span-2">Mensagem *<textarea className={`${field} mt-1.5 min-h-28 resize-y`} required value={form.mensagem} onChange={e => update('mensagem', e.target.value)}/></label>
          <label className="flex items-start gap-2 text-xs leading-5 text-slate-600 sm:col-span-2"><input className="mt-1 accent-[#00a991]" type="checkbox" required checked={form.consentimento} onChange={e => update('consentimento', e.target.checked)}/>Autorizo o uso dos dados para que a Kealex responda a esta solicitação, conforme a <a className="text-[#008f7d] underline" href="/lgpd">Política de Privacidade</a>.</label>
          <button disabled={status === 'sending'} className="rounded-xl bg-[#F96313] px-5 py-3 text-sm font-bold text-white hover:bg-[#e0550f] disabled:opacity-60 sm:col-span-2">{status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}</button>
          {status === 'success' && <p role="status" className="text-sm font-medium text-emerald-700 sm:col-span-2">Mensagem enviada. Obrigado pelo contato.</p>}{status === 'error' && <p role="alert" className="text-sm font-medium text-red-700 sm:col-span-2">Não foi possível enviar agora. Tente novamente ou escreva para contato@kealabs.com.br.</p>}
        </form>
      </div>
    </div>
  </section>
}
