import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react'
import { Button } from '../components/UI'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Ilustração 404 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 0.95, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-9xl font-black bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              404
            </motion.div>
            
            {/* Ícone flutuante */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 -right-8"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <FileQuestion size={32} className="text-white" />
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
            Página não encontrada
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Ops! A página que você está procurando não existe.
          </p>
          <p className="text-sm text-gray-500">
            Ela pode ter sido movida, removida ou o link está incorreto.
          </p>
        </motion.div>

        {/* Sugestões */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
              <Search size={20} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">O que você pode fazer:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verificar se o endereço está correto</li>
                <li>• Voltar para a página anterior</li>
                <li>• Acessar a página inicial</li>
                <li>• Usar a busca para encontrar o que precisa</li>
              </ul>
            </div>
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
          Precisa de ajuda? Entre em contato com o suporte
        </motion.p>
      </motion.div>
    </div>
  )
}
