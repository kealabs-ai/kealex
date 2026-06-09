import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, Globe, Database, Users, Shield, Server, HardDrive, Activity, Key, Mail, Smartphone, Bot } from 'lucide-react'
import { DataCard, StatCard } from '../components/Cards'
import { IATab } from '../components/IATab'
import { AgentesTab } from '../components/AgentesTab'
import { Topbar } from '../components/TopBar'
import { Input, Select, Button, Textarea } from '../components/UI'
import { useState } from 'react'

type Tab = 'geral' | 'cdn' | 'database' | 'ia' | 'agentes' | 'usuarios' | 'seguranca' | 'notificacoes'

export function AdminPage() {
  const [searchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as Tab) ?? 'geral'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar 
        title="Configurações do Sistema" 
        subtitle="Gerencie todas as configurações da plataforma" 
        icon={Settings} 
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'ia' && <IATab />}
          {activeTab === 'agentes' && <AgentesTab />}
          {activeTab === 'geral' && <GeralTab />}
          {activeTab === 'cdn' && <CdnTab />}
          {activeTab === 'database' && <DatabaseTab />}
          {activeTab === 'usuarios' && <UsuariosTab />}
          {activeTab === 'seguranca' && <SegurancaTab />}
          {activeTab === 'notificacoes' && <NotificacoesTab />}
        </motion.div>
      </div>
    </div>
  )
}

// ============ GERAL ============
function GeralTab() {
  const [config, setConfig] = useState({
    nome_plataforma: 'Kealex',
    url_base: 'https://app.kealex.com.br',
    email_suporte: 'suporte@kealex.com.br',
    timezone: 'America/Sao_Paulo',
    idioma: 'pt-BR',
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Uptime"
          value="99.9%"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="Usuários Ativos"
          value="1,247"
          icon={<Users size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="Versão"
          value="v2.1.0"
          icon={<Server size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Informações da Plataforma</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome da Plataforma"
            value={config.nome_plataforma}
            onChange={(e) => setConfig({ ...config, nome_plataforma: e.target.value })}
          />
          <Input
            label="URL Base"
            value={config.url_base}
            onChange={(e) => setConfig({ ...config, url_base: e.target.value })}
          />
        </div>

        <Input
          label="Email de Suporte"
          type="email"
          value={config.email_suporte}
          onChange={(e) => setConfig({ ...config, email_suporte: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Timezone"
            value={config.timezone}
            onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
          >
            <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
            <option value="America/Manaus">Manaus (GMT-4)</option>
            <option value="America/Noronha">Fernando de Noronha (GMT-2)</option>
          </Select>

          <Select
            label="Idioma Padrão"
            value={config.idioma}
            onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es-ES">Español</option>
          </Select>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ CDN & ARQUIVOS ============
function CdnTab() {
  const [config, setConfig] = useState({
    provider: 's3',
    bucket: 'kealex-prod',
    region: 'us-east-1',
    max_file_size: '50',
    allowed_extensions: '.pdf,.docx,.jpg,.png',
    bunny_api_key: '',
    bunny_storage_zone: '',
    bunny_cdn_url: '',
    pandavideo_api_key: '',
    pandavideo_folder_id: '',
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Armazenamento Usado"
          value="127 GB"
          icon={<HardDrive size={20} />}
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
        <StatCard
          label="Arquivos Totais"
          value="8,432"
          icon={<Globe size={20} />}
          gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
        />
        <StatCard
          label="Transferência (mês)"
          value="2.4 TB"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração de CDN</h2>

        <Select
          label="Provider"
          value={config.provider}
          onChange={(e) => setConfig({ ...config, provider: e.target.value })}
        >
          <option value="s3">Amazon S3</option>
          <option value="cloudflare">Cloudflare R2</option>
          <option value="azure">Azure Blob Storage</option>
          <option value="bunny">Bunny.net Storage</option>
        </Select>

        {config.provider === 'bunny' ? (
          <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-orange-900">Bunny.net — Configuração</p>
              <a
                href="https://panel.bunny.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-700 hover:underline"
              >
                Acessar Painel →
              </a>
            </div>
            <Input
              label="API Key"
              type="password"
              placeholder="••••••••-••••-••••-••••-••••••••••••"
              value={config.bunny_api_key}
              onChange={(e) => setConfig({ ...config, bunny_api_key: e.target.value })}
            />
            <Input
              label="Storage Zone Name"
              placeholder="kealex-storage"
              value={config.bunny_storage_zone}
              onChange={(e) => setConfig({ ...config, bunny_storage_zone: e.target.value })}
            />
            <Input
              label="CDN URL"
              placeholder="https://kealex.b-cdn.net"
              value={config.bunny_cdn_url}
              onChange={(e) => setConfig({ ...config, bunny_cdn_url: e.target.value })}
            />
            <p className="text-xs text-orange-700">
              💡 Obtenha suas credenciais em{' '}
              <a href="https://panel.bunny.net/storage" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                panel.bunny.net/storage
              </a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Bucket / Container"
              value={config.bucket}
              onChange={(e) => setConfig({ ...config, bucket: e.target.value })}
            />
            <Input
              label="Região"
              value={config.region}
              onChange={(e) => setConfig({ ...config, region: e.target.value })}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tamanho Máximo (MB)"
            type="number"
            value={config.max_file_size}
            onChange={(e) => setConfig({ ...config, max_file_size: e.target.value })}
          />
          <Input
            label="Extensões Permitidas"
            value={config.allowed_extensions}
            onChange={(e) => setConfig({ ...config, allowed_extensions: e.target.value })}
            placeholder=".pdf,.docx,.jpg"
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>

      {/* Panda Video */}
      <DataCard className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Panda Video — Streaming de Vídeos</h2>
          <a
            href="https://dashboard.pandavideo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 hover:underline"
          >
            Acessar Dashboard →
          </a>
        </div>

        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <p className="text-sm font-semibold text-purple-900">Credenciais da API</p>
          </div>
          
          <Input
            label="API Key"
            type="password"
            placeholder="••••••••-••••-••••-••••-••••••••••••"
            value={config.pandavideo_api_key}
            onChange={(e) => setConfig({ ...config, pandavideo_api_key: e.target.value })}
          />
          
          <Input
            label="Folder ID (Opcional)"
            placeholder="abc123def456"
            value={config.pandavideo_folder_id}
            onChange={(e) => setConfig({ ...config, pandavideo_folder_id: e.target.value })}
          />

          <p className="text-xs text-purple-700">
            💡 Configure sua API Key em{' '}
            <a href="https://dashboard.pandavideo.com/settings/api" target="_blank" rel="noopener noreferrer" className="underline font-medium">
              dashboard.pandavideo.com/settings/api
            </a>
          </p>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-medium mb-2">Recursos Disponíveis</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>✓ Upload de vídeos com processamento automático</li>
            <li>✓ Player responsivo com marca d'água</li>
            <li>✓ Analytics de visualizações e engajamento</li>
            <li>✓ Proteção contra download e pirataria</li>
          </ul>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ BANCO DE DADOS ============
function DatabaseTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Conexões Ativas"
          value="42"
          icon={<Database size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="Tamanho do Banco"
          value="3.2 GB"
          icon={<HardDrive size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="Queries/seg"
          value="127"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração do Banco de Dados</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Host" value="localhost" disabled />
          <Input label="Porta" value="5432" disabled />
        </div>

        <Input label="Database" value="kealex_prod" disabled />

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-medium mb-2">Backup Automático</p>
          <p className="text-xs text-blue-700">Último backup: Hoje às 03:00</p>
          <p className="text-xs text-blue-700">Próximo backup: Amanhã às 03:00</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary">Executar Backup Manual</Button>
          <Button variant="secondary">Ver Logs</Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ USUÁRIOS ============
function UsuariosTab() {
  const [config, setConfig] = useState({
    registro_publico: false,
    aprovacao_manual: true,
    senha_min_length: '8',
    sessao_timeout: '60',
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total de Usuários"
          value="1,247"
          icon={<Users size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="Admins"
          value="8"
          icon={<Shield size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="Novos (30d)"
          value="142"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Políticas de Usuários</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Registro Público</p>
              <p className="text-xs text-gray-500">Permitir que novos usuários se cadastrem</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, registro_publico: !config.registro_publico })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.registro_publico ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.registro_publico ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Aprovação Manual</p>
              <p className="text-xs text-gray-500">Novos usuários precisam de aprovação do admin</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, aprovacao_manual: !config.aprovacao_manual })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.aprovacao_manual ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.aprovacao_manual ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tamanho Mínimo da Senha"
            type="number"
            value={config.senha_min_length}
            onChange={(e) => setConfig({ ...config, senha_min_length: e.target.value })}
          />
          <Input
            label="Timeout de Sessão (min)"
            type="number"
            value={config.sessao_timeout}
            onChange={(e) => setConfig({ ...config, sessao_timeout: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ SEGURANÇA ============
function SegurancaTab() {
  const [config, setConfig] = useState({
    two_factor: true,
    ip_whitelist: false,
    rate_limit: '100',
    jwt_expiration: '24',
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Tentativas Bloqueadas"
          value="23"
          icon={<Shield size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="2FA Ativo"
          value="87%"
          icon={<Key size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="Sessões Ativas"
          value="342"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configurações de Segurança</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Autenticação de Dois Fatores</p>
              <p className="text-xs text-gray-500">Exigir 2FA para todos os usuários</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, two_factor: !config.two_factor })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.two_factor ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.two_factor ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900">Whitelist de IPs</p>
              <p className="text-xs text-gray-500">Restringir acesso a IPs específicos</p>
            </div>
            <button
              onClick={() => setConfig({ ...config, ip_whitelist: !config.ip_whitelist })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.ip_whitelist ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.ip_whitelist ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Rate Limit (req/min)"
            type="number"
            value={config.rate_limit}
            onChange={(e) => setConfig({ ...config, rate_limit: e.target.value })}
          />
          <Input
            label="Expiração JWT (horas)"
            type="number"
            value={config.jwt_expiration}
            onChange={(e) => setConfig({ ...config, jwt_expiration: e.target.value })}
          />
        </div>

        <Textarea
          label="IPs Permitidos (um por linha)"
          rows={4}
          placeholder="192.168.1.1&#10;10.0.0.1"
          disabled={!config.ip_whitelist}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ NOTIFICAÇÕES ============
function NotificacoesTab() {
  const [config, setConfig] = useState({
    email_enabled: true,
    sms_enabled: false,
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_user: 'noreply@kealex.com.br',
    sms_provider: 'twilio',
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Emails Enviados (30d)"
          value="12,847"
          icon={<Mail size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="SMS Enviados (30d)"
          value="342"
          icon={<Smartphone size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="Taxa de Entrega"
          value="98.7%"
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração de Email (SMTP)</h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Notificações por Email</p>
            <p className="text-xs text-gray-500">Enviar emails automáticos do sistema</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, email_enabled: !config.email_enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.email_enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.email_enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SMTP Host"
            value={config.smtp_host}
            onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
            disabled={!config.email_enabled}
          />
          <Input
            label="SMTP Port"
            value={config.smtp_port}
            onChange={(e) => setConfig({ ...config, smtp_port: e.target.value })}
            disabled={!config.email_enabled}
          />
        </div>

        <Input
          label="SMTP User"
          value={config.smtp_user}
          onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
          disabled={!config.email_enabled}
        />

        <Input
          label="SMTP Password"
          type="password"
          placeholder="••••••••"
          disabled={!config.email_enabled}
        />
      </DataCard>

      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configuração de SMS</h2>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
          <div>
            <p className="text-sm font-medium text-gray-900">Notificações por SMS</p>
            <p className="text-xs text-gray-500">Enviar SMS para alertas críticos</p>
          </div>
          <button
            onClick={() => setConfig({ ...config, sms_enabled: !config.sms_enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.sms_enabled ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              config.sms_enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <Select
          label="Provider SMS"
          value={config.sms_provider}
          onChange={(e) => setConfig({ ...config, sms_provider: e.target.value })}
          disabled={!config.sms_enabled}
        >
          <option value="twilio">Twilio</option>
          <option value="aws-sns">AWS SNS</option>
          <option value="zenvia">Zenvia</option>
        </Select>

        <Input
          label="API Key"
          type="password"
          placeholder="••••••••"
          disabled={!config.sms_enabled}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Configurações</Button>
        </div>
      </DataCard>
    </div>
  )
}
