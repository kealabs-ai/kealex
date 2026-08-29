import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Bell, Trash2, Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../../components/site/SiteFooter'

const LAST_UPDATE = '15 de julho de 2025'

const SECTIONS = [
  {
    id: 'introducao',
    icon: ShieldCheck,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '1. Introdução e Compromisso',
    content: [
      'A Kealabs AI Ltda. ("KeaLex", "nós" ou "nosso") está comprometida com a proteção dos dados pessoais de seus usuários, em plena conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais normas aplicáveis.',
      'Esta Política de Privacidade e Proteção de Dados descreve como coletamos, utilizamos, armazenamos, compartilhamos e protegemos as informações pessoais dos advogados, escritórios e clientes que utilizam a plataforma KeaLex.',
      'Ao utilizar nossos serviços, você declara ter lido, compreendido e concordado com os termos desta política. Caso não concorde, solicitamos que não utilize a plataforma.',
    ],
  },
  {
    id: 'dados-coletados',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    title: '2. Dados Pessoais que Coletamos',
    content: [
      'Coletamos apenas os dados estritamente necessários para a prestação dos nossos serviços (princípio da minimização de dados — art. 6º, III, LGPD):',
    ],
    list: [
      { label: 'Dados de identificação', desc: 'Nome completo, CPF/CNPJ, número da OAB, endereço profissional e data de nascimento.' },
      { label: 'Dados de contato', desc: 'E-mail profissional, número de telefone/WhatsApp e endereço de correspondência.' },
      { label: 'Dados de acesso', desc: 'Login, senha (armazenada com hash bcrypt), endereço IP, dispositivo e logs de sessão.' },
      { label: 'Dados processuais', desc: 'Informações sobre processos jurídicos, prazos, intimações e documentos inseridos na plataforma.' },
      { label: 'Dados financeiros', desc: 'Informações de honorários, cobranças e faturamento — nunca armazenamos dados de cartão de crédito.' },
      { label: 'Dados de uso', desc: 'Métricas de utilização da plataforma para melhoria contínua do serviço (analytics anonimizados).' },
    ],
  },
  {
    id: 'finalidade',
    icon: Eye,
    color: 'bg-amber-50 text-amber-600',
    title: '3. Finalidade e Base Legal do Tratamento',
    content: [
      'Tratamos seus dados pessoais com base nas seguintes hipóteses legais previstas no art. 7º da LGPD:',
    ],
    list: [
      { label: 'Execução de contrato', desc: 'Para fornecer os serviços contratados, incluindo gestão de processos, prazos, documentos e cobranças.' },
      { label: 'Legítimo interesse', desc: 'Para melhorar a plataforma, prevenir fraudes, garantir a segurança e enviar comunicações relevantes sobre o serviço.' },
      { label: 'Cumprimento de obrigação legal', desc: 'Para atender exigências fiscais, contábeis e regulatórias aplicáveis à nossa atividade.' },
      { label: 'Consentimento', desc: 'Para envio de comunicações de marketing, novidades e materiais educativos — sempre com opção de descadastro.' },
    ],
  },
  {
    id: 'compartilhamento',
    icon: UserCheck,
    color: 'bg-blue-50 text-blue-600',
    title: '4. Compartilhamento de Dados',
    content: [
      'Não vendemos, alugamos ou comercializamos seus dados pessoais. O compartilhamento ocorre apenas nas seguintes situações:',
    ],
    list: [
      { label: 'Parceiros de infraestrutura', desc: 'Amazon Web Services (AWS) para hospedagem segura dos dados, com contrato de processamento (DPA) e certificações ISO 27001.' },
      { label: 'Processadores de pagamento', desc: 'Asaas Pagamentos para geração de boletos e Pix — sujeitos à LGPD e regulamentação do Banco Central.' },
      { label: 'Inteligência Artificial', desc: 'Modelos de IA (OpenAI) para funcionalidades do Kealex AI — dados são processados sem retenção para treinamento de modelos.' },
      { label: 'Autoridades competentes', desc: 'Quando exigido por lei, ordem judicial ou autoridade regulatória competente.' },
    ],
  },
  {
    id: 'seguranca',
    icon: Lock,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '5. Segurança e Proteção dos Dados',
    content: [
      'Adotamos medidas técnicas e organizacionais rigorosas para proteger seus dados contra acesso não autorizado, perda, alteração ou divulgação indevida:',
    ],
    list: [
      { label: 'Criptografia em trânsito', desc: 'Todas as comunicações utilizam TLS 1.3, garantindo que os dados não possam ser interceptados.' },
      { label: 'Criptografia em repouso', desc: 'Dados armazenados com AES-256, o padrão utilizado por instituições financeiras e governos.' },
      { label: 'Controle de acesso', desc: 'Autenticação multifator (MFA), permissões granulares por perfil e log de auditoria completo.' },
      { label: 'Backups automáticos', desc: 'Cópias de segurança diárias com retenção de 90 dias e capacidade de restauração em minutos.' },
      { label: 'Monitoramento contínuo', desc: 'Sistemas de detecção de intrusão (IDS) e monitoramento 24/7 da infraestrutura.' },
      { label: 'Isolamento de dados', desc: 'Arquitetura multi-tenant com isolamento completo entre escritórios — seus dados são invisíveis para outros clientes.' },
    ],
  },
  {
    id: 'direitos',
    icon: UserCheck,
    color: 'bg-green-50 text-green-600',
    title: '6. Seus Direitos como Titular dos Dados',
    content: [
      'A LGPD garante a você, como titular dos dados, os seguintes direitos (art. 18), que podem ser exercidos a qualquer momento:',
    ],
    list: [
      { label: 'Confirmação e acesso', desc: 'Confirmar se tratamos seus dados e obter uma cópia completa das informações que possuímos sobre você.' },
      { label: 'Correção', desc: 'Solicitar a atualização ou correção de dados incompletos, inexatos ou desatualizados.' },
      { label: 'Anonimização ou eliminação', desc: 'Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.' },
      { label: 'Portabilidade', desc: 'Receber seus dados em formato estruturado e interoperável para transferência a outro fornecedor.' },
      { label: 'Revogação do consentimento', desc: 'Retirar o consentimento a qualquer momento, sem prejuízo do tratamento realizado anteriormente.' },
      { label: 'Oposição', desc: 'Opor-se ao tratamento realizado com base em legítimo interesse, quando houver fundamento legal para tal.' },
    ],
  },
  {
    id: 'retencao',
    icon: Trash2,
    color: 'bg-rose-50 text-rose-500',
    title: '7. Retenção e Exclusão dos Dados',
    content: [
      'Mantemos seus dados pelo tempo necessário para cumprir as finalidades descritas nesta política, observando os seguintes critérios:',
      'Dados de conta ativa: mantidos durante toda a vigência do contrato de serviço. Após o encerramento da conta, os dados são mantidos por até 5 anos para cumprimento de obrigações legais e fiscais (Código Civil, art. 206), sendo então eliminados de forma segura.',
      'Dados processuais: por se tratar de informações com relevância jurídica, podem ser mantidos por até 10 anos após o encerramento do processo, conforme prazos prescricionais do direito brasileiro.',
      'Logs de acesso: mantidos por 6 meses, conforme exigência do Marco Civil da Internet (Lei nº 12.965/2014).',
    ],
  },
  {
    id: 'cookies',
    icon: Bell,
    color: 'bg-purple-50 text-purple-600',
    title: '8. Cookies e Tecnologias de Rastreamento',
    content: [
      'Utilizamos cookies e tecnologias similares para melhorar sua experiência na plataforma. Os cookies são classificados em:',
    ],
    list: [
      { label: 'Essenciais', desc: 'Necessários para o funcionamento básico da plataforma (autenticação, segurança). Não podem ser desativados.' },
      { label: 'Analíticos', desc: 'Coletam dados anonimizados sobre o uso da plataforma para melhorias (Google Analytics com IP anonimizado).' },
      { label: 'Funcionais', desc: 'Lembram suas preferências de interface (tema, idioma, configurações de exibição).' },
    ],
  },
  {
    id: 'dpo',
    icon: Mail,
    color: 'bg-slate-100 text-slate-600',
    title: '9. Encarregado de Dados (DPO) e Contato',
    content: [
      'Designamos um Encarregado de Proteção de Dados (DPO) conforme exigência do art. 41 da LGPD, responsável por atender solicitações dos titulares e comunicar-se com a Autoridade Nacional de Proteção de Dados (ANPD).',
      'Para exercer seus direitos, esclarecer dúvidas ou reportar incidentes de segurança, entre em contato:',
    ],
    contact: {
      email: 'privacidade@kealabs.com.br',
      prazo: 'Respondemos em até 15 dias úteis, conforme art. 18, §3º da LGPD.',
    },
  },
]

function SectionCard({ section, index }: { section: typeof SECTIONS[0]; index: number }) {
  const Icon = section.icon
  return (
    <motion.div
      id={section.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm scroll-mt-24"
    >
      <div className="flex items-start gap-4 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.color}`}>
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold text-[#081B33] leading-snug pt-1">{section.title}</h2>
      </div>

      <div className="space-y-3 text-sm text-[#596B82] leading-relaxed">
        {section.content.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      {'list' in section && section.list && (
        <ul className="mt-4 space-y-3">
          {section.list.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00C2A8] shrink-0 mt-2" />
              <span className="text-sm text-[#596B82] leading-relaxed">
                <strong className="text-[#081B33] font-semibold">{item.label}:</strong>{' '}{item.desc}
              </span>
            </li>
          ))}
        </ul>
      )}

      {'contact' in section && section.contact && (
        <div className="mt-4 bg-[#00C2A8]/8 border border-[#00C2A8]/20 rounded-xl px-5 py-4 space-y-1">
          <p className="text-sm font-semibold text-[#081B33]">
            📧 <a href={`mailto:${section.contact.email}`} className="text-[#00C2A8] hover:underline">{section.contact.email}</a>
          </p>
          <p className="text-xs text-[#596B82]">{section.contact.prazo}</p>
        </div>
      )}
    </motion.div>
  )
}

export function LGPDPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="font-sans antialiased bg-[#F8FAFC]">

      {/* Hero da página */}
      <section className="relative bg-gradient-to-br from-[#081B33] to-[#0f2d4a] pt-14 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C2A8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/30 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
            <defs>
              <pattern id="grid-lgpd" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-lgpd)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#00C2A8] text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={15} /> Voltar ao site
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-[#00C2A8]/15 border border-[#00C2A8]/30 rounded-full px-4 py-1.5 mb-5">
              <ShieldCheck size={13} className="text-[#00C2A8]" />
              <span className="text-xs font-bold text-[#00C2A8]">Lei nº 13.709/2018 — LGPD</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
              Política de Privacidade<br />
              <span className="text-[#00C2A8]">e Proteção de Dados</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed mb-6">
              Transparência total sobre como tratamos seus dados. Desenvolvida para advogados que lidam com informações sensíveis de clientes e processos.
            </p>
            <p className="text-xs text-slate-500">
              Última atualização: <strong className="text-slate-400">{LAST_UPDATE}</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Índice rápido */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="shrink-0 text-[11px] font-semibold text-slate-500 hover:text-[#00C2A8] px-3 py-1.5 rounded-lg hover:bg-[#00C2A8]/8 transition-all whitespace-nowrap"
              >
                {s.title.split('. ')[1]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-5">
        {/* Aviso de destaque */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#00C2A8]/8 border border-[#00C2A8]/25 rounded-2xl px-6 py-5 flex items-start gap-4"
        >
          <ShieldCheck size={22} className="text-[#00C2A8] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#081B33] mb-1">Nosso compromisso com o sigilo profissional</p>
            <p className="text-sm text-[#596B82] leading-relaxed">
              O KeaLex foi desenvolvido especificamente para advogados, que por dever ético e legal (Estatuto da OAB, art. 34) precisam garantir o sigilo absoluto das informações de seus clientes. Nossa arquitetura de segurança foi projetada para atender esse padrão elevado de proteção.
            </p>
          </div>
        </motion.div>

        {SECTIONS.map((section, i) => (
          <SectionCard key={section.id} section={section} index={i} />
        ))}

        {/* Alterações na política */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm"
        >
          <h2 className="text-lg font-bold text-[#081B33] mb-3">10. Alterações nesta Política</h2>
          <p className="text-sm text-[#596B82] leading-relaxed">
            Podemos atualizar esta política periodicamente para refletir mudanças em nossas práticas ou na legislação. Quando houver alterações relevantes, notificaremos os usuários por e-mail com antecedência mínima de 15 dias. A data da última atualização sempre estará indicada no topo desta página.
          </p>
        </motion.div>


      </main>

      <SiteFooter />
    </div>
  )
}
