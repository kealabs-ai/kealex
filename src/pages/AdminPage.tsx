import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Cloud, Bot, Users, Key, Bell, Shield, Save, RefreshCw, CheckCircle } from 'lucide-react'
import { Button, Input, Select, Textarea } from '../components/UI'
import { DataCard } from '../components/Cards'

type Tab = 'geral' | 'cdn' | 'database' | 'ia' | 'usuarios' | 'seguranca' | 'notificacoes'

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'geral', label: 'Geral', icon: Settings },
  { id: 'cdn', label: 'CDN & Arquivos', icon: Cloud },
  { id: 'database', label: 'Banco de Dados', icon: Database },
  { id: 'ia', label: 'Agentes IA', icon: Bot },
  { id: 'usuarios', label: 'Usuários', icon: Users },
  { id: 'seguranca', label: 'Segurança', icon: Shield },
  { id: 'notificacoes', label: 'Notificações', icon: Bell },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('geral')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie todas as configurações da plataforma</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-sm text-emerald-600"
            >
              <CheckCircle size={14} /> Salvo com sucesso
            </motion.div>
          )}
          <Button icon={<Save size={15} />} onClick={handleSave} loading={loading}>
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* sidebar tabs */}
        <div className="w-56 shrink-0">
          <DataCard className="p-2">
            <div className="space-y-0.5">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </DataCard>
        </div>

        {/* content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'geral' && <GeralTab />}
            {activeTab === 'cdn' && <CDNTab />}
            {activeTab === 'database' && <DatabaseTab />}
            {activeTab === 'ia' && <IATab />}
            {activeTab === 'usuarios' && <UsuariosTab />}
            {activeTab === 'seguranca' && <SegurancaTab />}
            {activeTab === 'notificacoes' && <NotificacoesTab />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function GeralTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configurações Gerais</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nome da Plataforma" defaultValue="Kealex" />
            <Input label="URL Base" defaultValue="https://kealex.com.br" />
          </div>
          <Input label="Email de Suporte" type="email" defaultValue="suporte@kealex.com.br" />
          <Textarea label="Descrição da Plataforma" rows={3} defaultValue="Plataforma jurídica SaaS para gestão de processos, documentos e honorários." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Fuso Horário">
              <option>America/Sao_Paulo (UTC-3)</option>
              <option>America/Manaus (UTC-4)</option>
              <option>America/Rio_Branco (UTC-5)</option>
            </Select>
            <Select label="Idioma Padrão">
              <option>Português (Brasil)</option>
              <option>English (US)</option>
              <option>Español</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Manutenção</h3>
        <label className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-900">Modo Manutenção</p>
            <p className="text-xs text-amber-700">Desabilita acesso de usuários não-admin</p>
          </div>
        </label>
      </div>
    </DataCard>
  )
}

function CDNTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">CDN & Armazenamento de Arquivos</h2>
        <div className="space-y-4">
          <Select label="Provider de Armazenamento">
            <option>AWS S3</option>
            <option>Google Cloud Storage</option>
            <option>Azure Blob Storage</option>
            <option>Cloudflare R2</option>
            <option>Local (Servidor)</option>
          </Select>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 mb-2">AWS S3 Configuration</p>
            <div className="space-y-3">
              <Input label="Bucket Name" placeholder="kealex-documents-prod" />
              <Input label="Region" placeholder="us-east-1" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Access Key ID" placeholder="AKIA..." type="password" />
                <Input label="Secret Access Key" placeholder="••••••••" type="password" />
              </div>
              <Input label="CDN URL (CloudFront)" placeholder="https://d123abc.cloudfront.net" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Tamanho Máximo (MB)" type="number" defaultValue="50" />
            <Select label="Tipos de Arquivo Permitidos">
              <option>PDF, DOCX, XLSX, PNG, JPG</option>
              <option>Todos os tipos</option>
              <option>Apenas documentos</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Política de Retenção
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Mover para arquivo morto após 2 anos
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Deletar automaticamente após 5 anos
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Estatísticas de Uso</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Armazenamento Usado', value: '24.3 GB', color: 'bg-blue-50 text-blue-700' },
            { label: 'Total de Arquivos', value: '1,847', color: 'bg-purple-50 text-purple-700' },
            { label: 'Transferência (mês)', value: '156 GB', color: 'bg-emerald-50 text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-xl ${s.color}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DataCard>
  )
}

function DatabaseTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração do Banco de Dados</h2>
        <div className="space-y-4">
          <Select label="Tipo de Banco">
            <option>PostgreSQL</option>
            <option>MySQL</option>
            <option>MongoDB</option>
            <option>SQL Server</option>
          </Select>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <p className="text-xs font-semibold text-gray-700 mb-3">Connection String</p>
            <Input
              placeholder="postgresql://user:password@host:5432/kealex_db"
              type="password"
              defaultValue="postgresql://admin:••••••••@db.kealex.com:5432/kealex_prod"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Pool Size (Conexões)" type="number" defaultValue="20" />
            <Input label="Timeout (segundos)" type="number" defaultValue="30" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Opções Avançadas
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                SSL/TLS habilitado
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Query logging
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Read replicas habilitadas
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Backup & Recuperação</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Frequência de Backup">
              <option>Diário (3:00 AM)</option>
              <option>A cada 12 horas</option>
              <option>A cada 6 horas</option>
              <option>Manual apenas</option>
            </Select>
            <Input label="Retenção (dias)" type="number" defaultValue="30" />
          </div>
          <Button variant="secondary" icon={<RefreshCw size={14} />} size="sm">
            Executar Backup Agora
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status da Conexão</h3>
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-sm font-medium text-emerald-900">Conectado</p>
            <p className="text-xs text-emerald-700">Latência: 12ms • Pool: 8/20 conexões ativas</p>
          </div>
        </div>
      </div>
    </DataCard>
  )
}

function IATab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração de Agentes IA</h2>
        <div className="space-y-4">
          <Select label="Provider de IA">
            <option>OpenAI (GPT-4)</option>
            <option>Anthropic (Claude)</option>
            <option>Google (Gemini)</option>
            <option>AWS Bedrock</option>
            <option>Azure OpenAI</option>
          </Select>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
            <p className="text-xs font-semibold text-indigo-900 mb-3">OpenAI Configuration</p>
            <div className="space-y-3">
              <Input label="API Key" placeholder="sk-proj-..." type="password" />
              <Select label="Modelo Padrão">
                <option>gpt-4o</option>
                <option>gpt-4o-mini</option>
                <option>gpt-4-turbo</option>
                <option>gpt-3.5-turbo</option>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Max Tokens" type="number" defaultValue="4096" />
                <Input label="Temperature" type="number" step="0.1" defaultValue="0.7" />
              </div>
            </div>
          </div>

          <Textarea
            label="System Prompt Customizado"
            rows={4}
            placeholder="Você é um assistente jurídico especializado..."
            defaultValue="Você é o Kealex AI, um advogado assistente inteligente especializado em direito brasileiro..."
          />

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Funcionalidades Habilitadas
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Chat com histórico de contexto
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Análise de documentos (OCR + IA)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Geração automática de petições
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Sugestões de jurisprudência
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Uso da API (mês atual)</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Requisições', value: '12,847', color: 'bg-blue-50 text-blue-700' },
            { label: 'Tokens Usados', value: '2.4M', color: 'bg-purple-50 text-purple-700' },
            { label: 'Custo Estimado', value: '$48.20', color: 'bg-emerald-50 text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className={`p-4 rounded-xl ${s.color}`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </DataCard>
  )
}

function UsuariosTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Políticas de Usuários</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Máx. Tentativas de Login" type="number" defaultValue="5" />
            <Input label="Bloqueio Temporário (min)" type="number" defaultValue="15" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Requisitos de Senha
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Mínimo 8 caracteres
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Letras maiúsculas e minúsculas
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Números obrigatórios
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Caracteres especiais obrigatórios
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiração de Senha (dias)" type="number" defaultValue="90" />
            <Input label="Sessão Inativa (minutos)" type="number" defaultValue="30" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Registro de Novos Usuários
            </label>
            <Select>
              <option>Apenas por convite (Admin)</option>
              <option>Auto-registro habilitado</option>
              <option>Auto-registro com aprovação</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Limites por Role</h3>
        <div className="space-y-3">
          {[
            { role: 'Admin', processos: 'Ilimitado', storage: 'Ilimitado' },
            { role: 'Advogado', processos: '100', storage: '50 GB' },
            { role: 'Cliente', processos: '10', storage: '5 GB' },
          ].map((r) => (
            <div key={r.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-sm font-medium text-gray-700">{r.role}</span>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>Processos: <strong className="text-gray-700">{r.processos}</strong></span>
                <span>Storage: <strong className="text-gray-700">{r.storage}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DataCard>
  )
}

function SegurancaTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Segurança & Compliance</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Autenticação
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Autenticação de dois fatores (2FA) obrigatória
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Login com Google OAuth
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Login com Microsoft Azure AD
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="JWT Secret Key" type="password" defaultValue="••••••••••••••••" />
            <Input label="Token Expiration (horas)" type="number" defaultValue="8" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Logs & Auditoria
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Registrar todas as ações de usuários
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Registrar acessos a documentos sensíveis
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Alertar sobre atividades suspeitas
              </label>
            </div>
          </div>

          <Textarea
            label="IPs Bloqueados (um por linha)"
            rows={3}
            placeholder="192.168.1.100&#10;10.0.0.50"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Compliance LGPD</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
            Consentimento explícito para coleta de dados
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
            Direito ao esquecimento habilitado
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
            Exportação de dados pessoais disponível
          </label>
        </div>
      </div>
    </DataCard>
  )
}

function NotificacoesTab() {
  return (
    <DataCard className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração de Notificações</h2>
        <div className="space-y-4">
          <Select label="Provider de Email">
            <option>AWS SES</option>
            <option>SendGrid</option>
            <option>Mailgun</option>
            <option>SMTP Customizado</option>
          </Select>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900 mb-3">AWS SES Configuration</p>
            <div className="space-y-3">
              <Input label="Region" defaultValue="us-east-1" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Access Key" type="password" placeholder="AKIA..." />
                <Input label="Secret Key" type="password" placeholder="••••••••" />
              </div>
              <Input label="Email Remetente" defaultValue="noreply@kealex.com.br" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
              Notificações Automáticas
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Prazos vencendo (3 dias antes)
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Honorários vencidos
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" defaultChecked />
                Novos documentos aprovados
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded accent-indigo-600" />
                Relatório semanal de atividades
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Notificações Push">
              <option>Habilitadas</option>
              <option>Desabilitadas</option>
              <option>Apenas urgentes</option>
            </Select>
            <Select label="Notificações SMS">
              <option>Desabilitadas</option>
              <option>Apenas urgentes</option>
              <option>Todas</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Templates de Email</h3>
        <div className="space-y-2">
          {[
            'Boas-vindas',
            'Recuperação de senha',
            'Prazo vencendo',
            'Honorário vencido',
            'Novo documento',
          ].map((t) => (
            <button
              key={t}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm text-gray-700 transition-colors"
            >
              <span>{t}</span>
              <span className="text-xs text-indigo-600 font-medium">Editar →</span>
            </button>
          ))}
        </div>
      </div>
    </DataCard>
  )
}
