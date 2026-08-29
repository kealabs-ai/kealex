import { useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, ShieldCheck, UserCheck, AlertTriangle, CreditCard,
  Lock, Eye, RefreshCw, Scale, Mail, ArrowLeft, Ban,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SiteFooter } from '../../components/site/SiteFooter'

const LAST_UPDATE = '15 de julho de 2025'

const SECTIONS = [
  {
    id: 'objeto',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    title: '1. Objeto e Aceitação',
    content: [
      'Estes Termos de Uso ("Termos") regulam o acesso e a utilização da plataforma KeaLex, desenvolvida e operada pela Kealabs AI Ltda. ("Kealabs", "nós" ou "nosso"), inscrita no CNPJ sob o nº XX.XXX.XXX/0001-XX, com sede em Belo Horizonte/MG.',
      'Ao criar uma conta, acessar ou utilizar qualquer funcionalidade da plataforma, o usuário ("Usuário", "você") declara ter lido, compreendido e concordado integralmente com estes Termos e com nossa Política de Privacidade e LGPD.',
      'Caso não concorde com qualquer disposição destes Termos, solicitamos que não utilize a plataforma. O uso continuado após alterações nos Termos implica aceitação das novas condições.',
    ],
  },
  {
    id: 'servicos',
    icon: ShieldCheck,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '2. Descrição dos Serviços',
    content: [
      'O KeaLex é uma plataforma SaaS (Software as a Service) de gestão jurídica com inteligência artificial, oferecendo os seguintes módulos:',
    ],
    list: [
      { label: 'Gestão de Processos', desc: 'Controle de fases processuais, histórico auditável e geração de documentos jurídicos.' },
      { label: 'Controle de Prazos', desc: 'Alertas automáticos de prazos CPC/CLT com calendário integrado e notificações multicanal.' },
      { label: 'Intimações Inteligentes', desc: 'Captura automática de intimações em diários oficiais e tribunais via IA.' },
      { label: 'Gestão Financeira', desc: 'Controle de honorários, cobranças automatizadas via Pix/boleto e relatórios de faturamento.' },
      { label: 'Portal do Cliente', desc: 'Área segura para clientes acompanharem processos e enviarem documentos com criptografia.' },
      { label: 'Kealex AI', desc: 'Assistente jurídico com IA treinada no CPC, CLT e jurisprudência STF/STJ para consultas e minutas.' },
      { label: 'Gestão de Documentos', desc: 'CDN centralizado com controle de acesso por perfil e organização por processo.' },
    ],
  },
  {
    id: 'cadastro',
    icon: UserCheck,
    color: 'bg-blue-50 text-blue-600',
    title: '3. Cadastro e Conta de Usuário',
    content: [
      'Para utilizar o KeaLex, é necessário criar uma conta fornecendo informações verdadeiras, completas e atualizadas. O Usuário é responsável por:',
    ],
    list: [
      { label: 'Veracidade dos dados', desc: 'Fornecer informações corretas no cadastro, incluindo nome, e-mail, CPF/CNPJ e número da OAB quando aplicável.' },
      { label: 'Sigilo das credenciais', desc: 'Manter a confidencialidade de login e senha, sendo responsável por todas as ações realizadas em sua conta.' },
      { label: 'Notificação de incidentes', desc: 'Comunicar imediatamente a Kealabs em caso de acesso não autorizado ou suspeita de comprometimento da conta.' },
      { label: 'Uso pessoal e intransferível', desc: 'A conta é pessoal e intransferível. O compartilhamento de credenciais entre usuários não autorizados é vedado.' },
      { label: 'Capacidade legal', desc: 'Declarar ter capacidade civil plena para contratar, sendo maior de 18 anos ou emancipado legalmente.' },
    ],
  },
  {
    id: 'uso-aceitavel',
    icon: Scale,
    color: 'bg-amber-50 text-amber-600',
    title: '4. Uso Aceitável da Plataforma',
    content: [
      'O KeaLex deve ser utilizado exclusivamente para fins lícitos e em conformidade com a legislação brasileira, o Estatuto da OAB e o Código de Ética e Disciplina da OAB. É expressamente permitido:',
    ],
    list: [
      { label: 'Gestão jurídica profissional', desc: 'Utilizar a plataforma para gerenciar processos, prazos, documentos e cobranças de escritórios de advocacia.' },
      { label: 'Consultas à IA jurídica', desc: 'Utilizar o Kealex AI para pesquisa jurídica, elaboração de minutas e análise de casos, sempre com supervisão do advogado responsável.' },
      { label: 'Colaboração entre usuários', desc: 'Compartilhar acesso com membros autorizados do escritório dentro dos limites do plano contratado.' },
    ],
  },
  {
    id: 'proibicoes',
    icon: Ban,
    color: 'bg-red-50 text-red-500',
    title: '5. Condutas Proibidas',
    content: [
      'É expressamente vedado ao Usuário, sob pena de suspensão imediata da conta e responsabilização civil e criminal:',
    ],
    list: [
      { label: 'Uso ilícito', desc: 'Utilizar a plataforma para fins ilegais, fraudulentos ou que violem direitos de terceiros.' },
      { label: 'Engenharia reversa', desc: 'Descompilar, fazer engenharia reversa, desmontar ou tentar extrair o código-fonte da plataforma.' },
      { label: 'Sobrecarga intencional', desc: 'Realizar ataques de negação de serviço (DoS/DDoS), scraping automatizado ou qualquer ação que sobrecarregue a infraestrutura.' },
      { label: 'Violação de privacidade', desc: 'Inserir dados de terceiros sem autorização ou utilizar a plataforma para coletar dados pessoais de forma ilícita.' },
      { label: 'Revenda não autorizada', desc: 'Revender, sublicenciar ou transferir o acesso à plataforma sem autorização expressa e por escrito da Kealabs.' },
      { label: 'Conteúdo prejudicial', desc: 'Inserir vírus, malware, código malicioso ou qualquer conteúdo que possa prejudicar a plataforma ou outros usuários.' },
    ],
  },
  {
    id: 'pagamento',
    icon: CreditCard,
    color: 'bg-green-50 text-green-600',
    title: '6. Planos, Pagamentos e Cancelamento',
    content: [
      'O KeaLex é oferecido em planos de assinatura mensal ou anual, conforme descrito na página de Preços. As condições financeiras são:',
    ],
    list: [
      { label: 'Período de teste', desc: 'Todos os planos incluem 7 dias de teste gratuito, sem necessidade de cartão de crédito. Ao término, a assinatura é ativada automaticamente mediante confirmação de pagamento.' },
      { label: 'Cobrança', desc: 'As cobranças são realizadas antecipadamente, no início de cada período (mensal ou anual), via cartão de crédito, boleto ou Pix.' },
      { label: 'Reajuste', desc: 'Os valores podem ser reajustados anualmente pelo IPCA, com aviso prévio de 30 dias por e-mail.' },
      { label: 'Cancelamento', desc: 'O cancelamento pode ser realizado a qualquer momento pelo painel da conta. O acesso permanece ativo até o fim do período já pago.' },
      { label: 'Garantia de reembolso', desc: 'Oferecemos reembolso integral nos primeiros 7 dias após a primeira cobrança, sem perguntas, conforme art. 49 do Código de Defesa do Consumidor.' },
      { label: 'Inadimplência', desc: 'Em caso de inadimplência, o acesso será suspenso após 5 dias e os dados mantidos por 30 dias para regularização antes da exclusão definitiva.' },
    ],
  },
  {
    id: 'propriedade-intelectual',
    icon: Lock,
    color: 'bg-purple-50 text-purple-600',
    title: '7. Propriedade Intelectual',
    content: [
      'Todos os direitos de propriedade intelectual relativos à plataforma KeaLex — incluindo software, design, marca, logotipo, algoritmos de IA, documentação e conteúdo — são de titularidade exclusiva da Kealabs AI Ltda., protegidos pela Lei nº 9.610/1998 (Lei de Direitos Autorais) e pela Lei nº 9.279/1996 (Lei de Propriedade Industrial).',
      'O Usuário recebe uma licença limitada, não exclusiva, intransferível e revogável para utilizar a plataforma exclusivamente para os fins previstos nestes Termos.',
      'Os dados inseridos pelo Usuário na plataforma (processos, documentos, informações de clientes) permanecem de propriedade do Usuário. A Kealabs não reivindica propriedade sobre o conteúdo inserido pelos usuários.',
    ],
  },
  {
    id: 'privacidade',
    icon: Eye,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '8. Privacidade e Proteção de Dados',
    content: [
      'O tratamento de dados pessoais no KeaLex é regido pela nossa Política de Privacidade e LGPD, disponível em /lgpd, que integra estes Termos por referência.',
      'Em síntese, nossos compromissos de privacidade são:',
    ],
    list: [
      { label: 'Minimização de dados', desc: 'Coletamos apenas os dados estritamente necessários para a prestação dos serviços (art. 6º, III, LGPD).' },
      { label: 'Finalidade específica', desc: 'Os dados são utilizados exclusivamente para as finalidades informadas, nunca vendidos ou compartilhados com terceiros para fins comerciais.' },
      { label: 'Segurança técnica', desc: 'Criptografia TLS 1.3 em trânsito e AES-256 em repouso, com backups diários e monitoramento 24/7.' },
      { label: 'Direitos do titular', desc: 'Garantimos todos os direitos previstos no art. 18 da LGPD: acesso, correção, portabilidade, eliminação e revogação do consentimento.' },
      { label: 'Sigilo profissional', desc: 'Dados de processos e clientes são tratados com o mesmo nível de sigilo exigido pelo Estatuto da OAB (art. 34, VII).' },
      { label: 'DPO designado', desc: 'Possuímos Encarregado de Proteção de Dados (DPO) disponível em privacidade@kealabs.com.br para atender solicitações dos titulares.' },
    ],
  },
  {
    id: 'responsabilidade',
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-600',
    title: '9. Limitação de Responsabilidade',
    content: [
      'A Kealabs emprega todos os esforços razoáveis para garantir a disponibilidade, segurança e precisão da plataforma. Contudo, o Usuário reconhece que:',
    ],
    list: [
      { label: 'Ferramenta de apoio', desc: 'O Kealex AI é uma ferramenta de apoio à pesquisa jurídica. As respostas geradas pela IA não constituem aconselhamento jurídico e não substituem o julgamento profissional do advogado responsável.' },
      { label: 'Responsabilidade do usuário', desc: 'O Usuário é integralmente responsável pelas decisões tomadas com base nas informações da plataforma e pelo cumprimento das normas da OAB.' },
      { label: 'Disponibilidade', desc: 'A Kealabs não garante disponibilidade ininterrupta, podendo ocorrer interrupções para manutenção, com aviso prévio sempre que possível.' },
      { label: 'Danos indiretos', desc: 'A Kealabs não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes de uso indevido da plataforma pelo Usuário.' },
      { label: 'Limite de indenização', desc: 'Em qualquer hipótese, a responsabilidade máxima da Kealabs fica limitada ao valor pago pelo Usuário nos últimos 3 meses de assinatura.' },
    ],
  },
  {
    id: 'vigencia',
    icon: RefreshCw,
    color: 'bg-slate-100 text-slate-600',
    title: '10. Vigência, Suspensão e Rescisão',
    content: [
      'Estes Termos vigoram por prazo indeterminado a partir da criação da conta. A relação contratual pode ser encerrada nas seguintes situações:',
    ],
    list: [
      { label: 'Cancelamento pelo Usuário', desc: 'A qualquer momento pelo painel da conta, sem necessidade de justificativa, com acesso mantido até o fim do período pago.' },
      { label: 'Cancelamento pela Kealabs', desc: 'Em caso de violação destes Termos, inadimplência superior a 30 dias ou uso fraudulento, com notificação prévia de 15 dias quando possível.' },
      { label: 'Efeitos do encerramento', desc: 'Após o encerramento, os dados do Usuário são mantidos por 30 dias para exportação e, após esse prazo, eliminados conforme nossa Política de Retenção.' },
      { label: 'Exportação de dados', desc: 'O Usuário pode solicitar a exportação completa de seus dados em formato estruturado antes do encerramento da conta, sem custo adicional.' },
    ],
  },
  {
    id: 'foro',
    icon: Scale,
    color: 'bg-indigo-50 text-indigo-600',
    title: '11. Lei Aplicável e Foro',
    content: [
      'Estes Termos são regidos pelas leis da República Federativa do Brasil. As partes elegem o foro da Comarca de Belo Horizonte/MG para dirimir quaisquer controvérsias decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.',
      'Antes de qualquer medida judicial, as partes comprometem-se a buscar solução amigável mediante notificação prévia com prazo de 15 dias para resposta.',
    ],
  },
  {
    id: 'contato',
    icon: Mail,
    color: 'bg-[#00C2A8]/10 text-[#00C2A8]',
    title: '12. Contato e Suporte',
    content: [
      'Para dúvidas sobre estes Termos, solicitações relacionadas à sua conta ou questões de privacidade, entre em contato pelos canais abaixo:',
    ],
    contact: {
      email: 'contato@kealabs.com.br',
      prazo: 'Respondemos em até 3 dias úteis para questões gerais e até 15 dias úteis para solicitações de dados (LGPD).',
      extra: 'Para questões de privacidade e proteção de dados: privacidade@kealabs.com.br',
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
      transition={{ delay: index * 0.04 }}
      className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm scroll-mt-16"
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
        <div className="mt-4 space-y-2">
          <div className="bg-[#00C2A8]/8 border border-[#00C2A8]/20 rounded-xl px-5 py-4 space-y-1.5">
            <p className="text-sm font-semibold text-[#081B33]">
              📧 <a href={`mailto:${section.contact.email}`} className="text-[#00C2A8] hover:underline">{section.contact.email}</a>
            </p>
            {'extra' in section.contact && (
              <p className="text-sm font-semibold text-[#081B33]">
                🔒 <a href="mailto:privacidade@kealabs.com.br" className="text-[#00C2A8] hover:underline">privacidade@kealabs.com.br</a>
              </p>
            )}
            <p className="text-xs text-[#596B82] pt-1">{section.contact.prazo}</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function TermosPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="font-sans antialiased bg-[#F8FAFC]">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#081B33] to-[#0f2d4a] pt-14 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C2A8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900/30 rounded-full blur-3xl" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" aria-hidden="true">
            <defs>
              <pattern id="grid-termos" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00C2A8" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-termos)" />
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
              <FileText size={13} className="text-[#00C2A8]" />
              <span className="text-xs font-bold text-[#00C2A8]">Contrato de Uso · Versão 1.0</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">
              Termos de Uso<br />
              <span className="text-[#00C2A8]">e Política de Privacidade</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed mb-6">
              Condições que regem o uso da plataforma KeaLex. Inclui direitos, obrigações, privacidade e proteção de dados dos usuários.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span>Última atualização: <strong className="text-slate-400">{LAST_UPDATE}</strong></span>
              <span className="w-px h-3 bg-white/10" />
              <Link to="/lgpd" className="text-[#00C2A8] hover:underline flex items-center gap-1">
                <ShieldCheck size={11} /> Ver Política LGPD completa
              </Link>
            </div>
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
          className="bg-amber-50 border border-amber-200 rounded-2xl px-6 py-5 flex items-start gap-4"
        >
          <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#081B33] mb-1">Leia antes de usar</p>
            <p className="text-sm text-[#596B82] leading-relaxed">
              Estes Termos constituem um contrato vinculante entre você e a Kealabs AI Ltda. O uso da plataforma implica aceitação integral. Se tiver dúvidas, entre em contato antes de prosseguir em{' '}
              <a href="mailto:contato@kealabs.com.br" className="text-[#00C2A8] hover:underline font-medium">contato@kealabs.com.br</a>.
            </p>
          </div>
        </motion.div>

        {SECTIONS.map((section, i) => (
          <SectionCard key={section.id} section={section} index={i} />
        ))}

        {/* Alterações */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm"
        >
          <h2 className="text-lg font-bold text-[#081B33] mb-3">13. Alterações nestes Termos</h2>
          <p className="text-sm text-[#596B82] leading-relaxed">
            A Kealabs reserva-se o direito de alterar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail com antecedência mínima de 15 dias. O uso continuado da plataforma após esse prazo implica aceitação das novas condições. A versão vigente sempre estará disponível nesta página com a data de atualização indicada.
          </p>
        </motion.div>

      </main>

      <SiteFooter />
    </div>
  )
}
