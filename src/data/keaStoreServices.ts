import type { LucideIcon } from 'lucide-react'
import { ContactRound, FileBadge2, ScanSearch } from 'lucide-react'

export type KeaStoreCategory = 'Consultas cadastrais' | 'Emissão de certidões'

export interface KeaStoreService {
  id: string
  title: string
  description: string
  category: KeaStoreCategory
  credits: number
  /** R$ por crédito, valor demonstrativo até a tabela comercial ser configurada. */
  estimatedUnitValue: number
  actionLabel: string
  icon: LucideIcon
  destination?: string
}

export const keaStoreCategories: KeaStoreCategory[] = [
  'Consultas cadastrais',
  'Emissão de certidões',
]

export const keaStoreServices: KeaStoreService[] = [
  { id: 'consulta-cpf', title: 'Consulta por CPF', description: 'Consulte informações cadastrais por CPF por meio de provedores externos integrados.', category: 'Consultas cadastrais', credits: 5, estimatedUnitValue: 0.1, actionLabel: 'Consultar CPF', icon: ScanSearch },
  { id: 'consulta-completa-cpf', title: 'Consulta completa de CPF', description: 'Solicite uma consulta ampliada de CPF com dados disponibilizados pelo provedor externo.', category: 'Consultas cadastrais', credits: 20, estimatedUnitValue: 0.1, actionLabel: 'Consultar CPF', icon: ContactRound },
  { id: 'emissao-certidoes', title: 'Emissão de certidões', description: 'Acesse os emissores integrados e acompanhe solicitações de certidões. O custo pode variar conforme o emissor.', category: 'Emissão de certidões', credits: 10, estimatedUnitValue: 0.1, actionLabel: 'Acessar certidões', icon: FileBadge2, destination: '/kea-store/certidoes' },
]

export const creditPackages = [
  { id: 'essencial', name: 'Essencial', credits: 100, price: 10 },
  { id: 'escritorio', name: 'Escritório', credits: 300, price: 30, featured: true },
  { id: 'pro', name: 'Pro', credits: 600, price: 60 },
] as const

