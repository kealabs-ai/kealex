import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, AlertTriangle, ShieldAlert, ServerCrash, WifiOff } from 'lucide-react'
import { Button } from '../components/UI'

type ErrorType = '403' | '500' | '503' | 'offline'

interface ErrorConfig {
  code: string
  title: string
  description: string
  suggestions: string[]
  icon: JSX.Element
  gradient: string
}

const errorConfigs: Record<ErrorType, ErrorConfig> = {
  '403': {
    code: '403',
    title: 'Acesso negado',
    description: 'Você não tem permissão para acessar esta página.',
    suggestions: [
      'Verifique se você está logado com a conta correta',
      'Entre em contato com o administrador para solicitar acesso',
      'Volte para a página inicial',
    ],
    icon: <ShieldAlert size={32} className="text-white" />,
    gradient: 'from-red-400 to-rose-500',
  },
  '500': {
    code: '500',
    title: 'Erro interno do servidor',
    description: 'Algo deu errado no servidor. Estamos trabalhando para resolver.',
    suggestions: [
      'Tente novamente em alguns instantes',
      'Recarregue a página',
      'Se o problema persistir, entre em contato com o suporte',
    ],
    icon: <ServerCrash size={32} className="text-white" />,
    gradient: 'from-orange-400 to-red-500',
  },
  '503': {
    code: '503',
    title: 'Serviço indisponível',
    description: 'O servidor está temporariamente indisponível. Manutenção em andamento.',
    suggestions: [
      'Aguarde alguns minutos e tente novamente',
      'O serviço estará disponível em breve',
      'Acompanhe atualizações no status do sistema',
    ],
    icon: <AlertTriangle size={32} className="text-white" />,
    gradient: 'from-amber-400 to-orange-500',
  },
  offline: {
    code: 'OFFLINE',
    title: 'Sem conexão',
    description: 'Você está offline. Verifique sua conexão com a internet.',
    suggestions: [
      'Verifique seu WiFi ou dados móveis',
      'Tente recarregar a página quando estiver online',
      'Algumas funcionalidades podem não estar disponíveis',
    ],
    icon: <WifiOff size={32} className="text-white" />,
    gradient: 'from-gray-400 to-slate-500',
  },
}

export function ErrorPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = (searchParams.get('type') as ErrorType) || '500'
  const config = errorConfigs[type] || errorConfigs['500']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Código do erro */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl font-black bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent"
            >
              {config.code}
            </motion.div>
            
            {/* Ícone */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -right-6"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                {config.icon}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Título e descrição */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {config.title}
          </h1>
          <p className="text-lg text-gray-600">
            {config.description}
          </p>
        </motion.div>

        {/* Sugestões */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 mb-3">O que você pode fazer:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Ações */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            icon={<ArrowLeft size={16} />}
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
          <Button
            icon={<Home size={16} />}
            onClick={() => navigate('/processos')}
          >
            Ir para Início
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-xs text-gray-400"
        >
          Código do erro: {config.code} • Precisa de ajuda? suporte@kealex.com.br
        </motion.p>
      </motion.div>
    </div>
  )
}
