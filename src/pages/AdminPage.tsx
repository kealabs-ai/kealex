import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Cloud, Bot, Users, Bell, Shield } from 'lucide-react'
import { DataCard } from '../components/Cards'
import { IATab } from '../components/IATab'
import { Topbar } from '../components/TopBar'

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
  const [activeTab, setActiveTab] = useState<Tab>('ia')

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Topbar 
        title="Configurações do Sistema" 
        subtitle="Gerencie todas as configurações da plataforma" 
        icon={Settings} 
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="flex gap-6">
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

          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'ia' && <IATab />}
              {activeTab === 'geral' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
              {activeTab === 'cdn' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">CDN & Arquivos</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
              {activeTab === 'database' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Banco de Dados</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
              {activeTab === 'usuarios' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Configurações de Usuários</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
              {activeTab === 'seguranca' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Segurança</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
              {activeTab === 'notificacoes' && (
                <DataCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Notificações</h2>
                  <p className="text-gray-600">Em desenvolvimento...</p>
                </DataCard>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
