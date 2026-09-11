import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Topbar } from '../components/TopBar'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Globe, Database, Users, Shield, Server, HardDrive, Activity, Key, Mail, Smartphone, CheckCircle, RefreshCw, Search, Plus, Pencil, Trash2, Eye, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useConfigDatabase, useSaveConfigDatabase, useDatabaseEnv } from '../hooks/useConfiguracoes'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '../hooks/useUsuarios'
import { IATab } from '../components/IATab'
import { AgentesTab } from '../components/AgentesTab'
import { AgentesDebugPanel } from '../components/AgentesDebugPanel'
import { Modal } from '../components/Modal'
import { StatCard, DataCard, SkeletonRow } from '../components/Cards'
import { Button, Input, Select, Textarea } from '../components/UI'
import type { Role, Usuario } from '../types'

type Tab = 'geral' | 'cdn' | 'database' | 'ia' | 'agentes' | 'debug' | 'usuarios' | 'seguranca' | 'notificacoes'
type FormUsuario = { nome: string; email: string; senha?: string; role: Role; ativo: boolean }
type UsuariosTabState = { editing: Usuario | null; viewing: Usuario | null; confirmDelete: Usuario | null; open: boolean }

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
          {activeTab === 'debug' && <AgentesDebugPanel />}
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
  const { data: dbConfig, isLoading } = useConfigDatabase()
  const { data: dbEnv, isLoading: envLoading, refetch: refetchEnv } = useDatabaseEnv()
  const saveConfig = useSaveConfigDatabase()
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    tipo: 'postgresql',
    pool_size: 10,
    timeout_segundos: 30,
    ssl_enabled: true,
    query_logging: false,
    read_replicas: false,
    backup_frequencia: 'diario',
    backup_retencao: 30,
  })

  // Carregar configuração do backend
  useEffect(() => {
    if (dbConfig) {
      setConfig({
        tipo: dbConfig.tipo || 'postgresql',
        pool_size: dbConfig.pool_size || 10,
        timeout_segundos: dbConfig.timeout_segundos || 30,
        ssl_enabled: dbConfig.ssl_enabled ?? true,
        query_logging: dbConfig.query_logging ?? false,
        read_replicas: dbConfig.read_replicas ?? false,
        backup_frequencia: dbConfig.backup_frequencia || 'diario',
        backup_retencao: dbConfig.backup_retencao || 30,
      })
    }
  }, [dbConfig])

  const handleSave = async () => {
    try {
      await saveConfig.mutateAsync(config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Erro ao salvar configuração:', error)
    }
  }

  if (isLoading) {
    return (
      <DataCard className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </DataCard>
    )
  }

  // Extrair informações da connection string (se existir)
  const connectionInfo = dbConfig?.connection_string ? {
    host: dbConfig.connection_string.match(/(?:@|:\/\/)([^:\/]+)/)?.[1] || 'N/A',
    port: dbConfig.connection_string.match(/:([0-9]+)\//)?.[1] || 'N/A',
    database: dbConfig.connection_string.match(/\/([^?]+)/)?.[1] || 'N/A'
  } : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Pool Size"
          value={String(config.pool_size)}
          icon={<Database size={20} />}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCard
          label="Timeout"
          value={`${config.timeout_segundos}s`}
          icon={<Activity size={20} />}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        />
        <StatCard
          label="SSL"
          value={config.ssl_enabled ? 'Ativo' : 'Inativo'}
          icon={<Shield size={20} />}
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
      </div>

      {/* Informações da Conexão */}
      <DataCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Variáveis de Ambiente (Easypanel)</h2>
          <button
            onClick={() => refetchEnv()}
            disabled={envLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={envLoading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
        
        {envLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : dbEnv ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Host</label>
                <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{dbEnv.host || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Porta</label>
                <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{dbEnv.port || 'N/A'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Database</label>
                <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{dbEnv.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usuário</label>
                <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{dbEnv.user || 'N/A'}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Senha</label>
              <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">{dbEnv.password ? '•'.repeat(dbEnv.password.length) : 'N/A'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Connection String</label>
              <p className="mt-1 text-xs font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded-lg break-all">{dbEnv.connection_string || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">Não foi possível carregar as variáveis de ambiente</p>
        )}
      </DataCard>

      {/* Informações da Conexão */}
      <DataCard className="p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Informações da Conexão</h2>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tipo de Banco</label>
              <p className="mt-1 text-sm font-medium text-gray-900">{config.tipo}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">SSL</label>
              <p className="mt-1 text-sm font-medium text-gray-900">{config.ssl_enabled ? '✅ Habilitado' : '❌ Desabilitado'}</p>
            </div>
          </div>

          {connectionInfo && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Host</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{connectionInfo.host}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Porta</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{connectionInfo.port}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Database</label>
                  <p className="mt-1 text-sm font-mono text-gray-900">{connectionInfo.database}</p>
                </div>
              </div>
            </>
          )}

          {dbConfig?.updated_at && (
            <div className="pt-3 border-t">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Última Atualização</label>
              <p className="mt-1 text-sm text-gray-700">{new Date(dbConfig.updated_at).toLocaleString('pt-BR')}</p>
            </div>
          )}
        </div>
      </DataCard>

      {/* Configurações de Performance */}
      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Configurações de Performance</h2>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Pool Size"
            type="number"
            value={config.pool_size}
            onChange={(e) => setConfig({ ...config, pool_size: parseInt(e.target.value) })}
          />
          <Input
            label="Timeout (segundos)"
            type="number"
            value={config.timeout_segundos}
            onChange={(e) => setConfig({ ...config, timeout_segundos: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">SSL Habilitado</p>
              <p className="text-xs text-gray-500">Conexões criptografadas com TLS/SSL</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig({ ...config, ssl_enabled: !config.ssl_enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.ssl_enabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.ssl_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Query Logging</p>
              <p className="text-xs text-gray-500">Registrar todas as queries executadas</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig({ ...config, query_logging: !config.query_logging })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.query_logging ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.query_logging ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-gray-900">Read Replicas</p>
              <p className="text-xs text-gray-500">Usar réplicas para leitura (distribuir carga)</p>
            </div>
            <button
              type="button"
              onClick={() => setConfig({ ...config, read_replicas: !config.read_replicas })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.read_replicas ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.read_replicas ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </label>
        </div>
      </DataCard>

      {/* Backup */}
      <DataCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Backup Automático</h2>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Frequência"
            value={config.backup_frequencia}
            onChange={(e) => setConfig({ ...config, backup_frequencia: e.target.value })}
          >
            <option value="horario">A cada hora</option>
            <option value="diario">Diariamente às 03:00</option>
            <option value="semanal">Semanalmente (Domingo)</option>
            <option value="mensal">Mensalmente (Dia 1)</option>
          </Select>

          <Input
            label="Retenção (dias)"
            type="number"
            value={config.backup_retencao}
            onChange={(e) => setConfig({ ...config, backup_retencao: parseInt(e.target.value) })}
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 font-medium mb-2">Status do Backup</p>
          <p className="text-xs text-blue-700">Último backup: {dbConfig?.updated_at ? new Date(dbConfig.updated_at).toLocaleString('pt-BR') : 'N/A'}</p>
          <p className="text-xs text-blue-700">Próximo backup: {config.backup_frequencia === 'diario' ? 'Amanhã às 03:00' : 'Conforme configurado'}</p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="secondary">Executar Backup Manual</Button>
          <Button variant="secondary">Ver Logs</Button>
        </div>
      </DataCard>

      {/* Botão Salvar */}
      <DataCard className="p-6">
        <div className="flex items-center justify-between">
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle size={16} />
              <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
            </div>
          )}
          <Button onClick={handleSave} loading={saveConfig.isPending} className="ml-auto">
            Salvar Configurações
          </Button>
        </div>
      </DataCard>
    </div>
  )
}

// ============ USUÁRIOS ============
function UsuariosTab() {
  const { data: usuarios, isLoading } = useUsuarios()
  const create = useCreateUsuario()
  const update = useUpdateUsuario()
  const remove = useDeleteUsuario()
  const [state, setState] = useState<UsuariosTabState>({ editing: null, viewing: null, confirmDelete: null, open: false })
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormUsuario>()

  const openCreate = () => { reset({ role: 'advogado', ativo: true }); setState({ editing: null, viewing: null, confirmDelete: null, open: true }) }
  const openEdit = (u: Usuario) => { reset({ nome: u.nome, email: u.email, role: u.role, ativo: u.ativo }); setState({ editing: u, viewing: null, confirmDelete: null, open: true }) }
  const close = () => setState(s => ({ ...s, open: false }))
  const toggleAtivo = (u: Usuario) => update.mutate({ id: u.id, data: { ativo: !u.ativo } })

  const onSubmit = (data: FormUsuario) => {
    if (state.editing) update.mutate({ id: state.editing.id, data }, { onSuccess: close })
    else create.mutate(data as any, { onSuccess: close })
  }

  const filtered = usuarios?.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const roleColors: Record<Role, string> = {
    admin:    'linear-gradient(135deg,#8b5cf6,#6366f1)',
    advogado: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
    cliente:  'linear-gradient(135deg,#10b981,#059669)',
  }

  const roleLabel: Record<Role, string> = { admin: 'Admin', advogado: 'Advogado', cliente: 'Cliente' }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: usuarios?.length ?? 0,                                    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
          { label: 'Admins',    value: usuarios?.filter(u => u.role === 'admin').length ?? 0,    gradient: roleColors.admin },
          { label: 'Advogados', value: usuarios?.filter(u => u.role === 'advogado').length ?? 0, gradient: roleColors.advogado },
          { label: 'Clientes',  value: usuarios?.filter(u => u.role === 'cliente').length ?? 0,  gradient: roleColors.cliente },
        ].map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={<Users size={18} />} gradient={s.gradient} delay={i * 0.07} />
        ))}
      </div>

      <DataCard delay={0.15}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
            />
          </div>
          <Button icon={<Plus size={14} />} onClick={openCreate}>Novo Usuário</Button>
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Usuário', 'Email', 'Role', 'Status', 'Ações'].map((h) => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide ${h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}>
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Users size={32} className="mb-2 opacity-20" />
                  <p className="text-sm">Nenhum usuário encontrado</p>
                </div>
              </td></tr>
            ) : (
              <AnimatePresence>
                {filtered.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ background: roleColors[u.role] }}>
                          {u.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-semibold text-gray-800">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: roleColors[u.role] }}>
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        u.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        <button title="Ver detalhes" onClick={() => setState(s => ({ ...s, viewing: u }))} style={{ padding: 7, borderRadius: 8, background: '#ecfeff', color: '#0891b2', border: 'none', cursor: 'pointer', display: 'flex' }}><Eye size={14} /></button>
                        <button title={u.ativo ? 'Desativar' : 'Ativar'} onClick={() => toggleAtivo(u)} style={{ padding: 7, borderRadius: 8, background: u.ativo ? '#d1fae5' : '#f3f4f6', color: u.ativo ? '#059669' : '#9ca3af', border: 'none', cursor: 'pointer', display: 'flex' }}>
                          {u.ativo ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button title="Editar" onClick={() => openEdit(u)} style={{ padding: 7, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex' }}><Pencil size={14} /></button>
                        <button title="Excluir" onClick={() => setState(s => ({ ...s, confirmDelete: u }))} style={{ padding: 7, borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </DataCard>

      {state.viewing && (
        <Modal title="Detalhes do Usuário" subtitle={state.viewing.email} onClose={() => setState(s => ({ ...s, viewing: null }))} size="sm">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: roleColors[state.viewing.role] }}>
                {state.viewing.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{state.viewing.nome}</p>
                <p className="text-sm text-gray-500">{state.viewing.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Role</p>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ background: roleColors[state.viewing.role] }}>{roleLabel[state.viewing.role]}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Status</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${state.viewing.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{state.viewing.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setState(s => ({ ...s, viewing: null }))}>Fechar</Button>
              <Button icon={<Pencil size={14} />} onClick={() => { const v = state.viewing!; setState(s => ({ ...s, viewing: null })); openEdit(v) }}>Editar</Button>
            </div>
          </div>
        </Modal>
      )}

      {state.confirmDelete && (
        <Modal title="Confirmar Exclusão" onClose={() => setState(s => ({ ...s, confirmDelete: null }))} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">Tem certeza que deseja excluir <strong>{state.confirmDelete.nome}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setState(s => ({ ...s, confirmDelete: null }))}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(state.confirmDelete!.id, { onSuccess: () => setState(s => ({ ...s, confirmDelete: null })) })}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal */}
      {state.open && (
        <Modal title={state.editing ? 'Editar Usuário' : 'Novo Usuário'} subtitle={state.editing ? `Editando: ${state.editing.email}` : 'Preencha os dados do novo usuário'} onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" {...register('nome', { required: true })} placeholder="Nome completo" />
              <Input label="Email" {...register('email', { required: true })} type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={state.editing ? 'Nova Senha (opcional)' : 'Senha'}
                {...register('senha', { required: !state.editing })}
                type="password"
                placeholder="••••••••"
              />
              <Select label="Role" {...register('role', { required: true })}>
                <option value="admin">Admin</option>
                <option value="advogado">Advogado</option>
                <option value="cliente">Cliente</option>
              </Select>
            </div>
            <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input {...register('ativo')} type="checkbox" defaultChecked className="w-4 h-4 rounded accent-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Usuário ativo</span>
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <Button type="submit" loading={create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
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
