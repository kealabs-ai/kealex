type Variant = 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'purple' | 'cyan'

const variants: Record<Variant, string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red:    'bg-red-50 text-red-700 ring-1 ring-red-200',
  yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  gray:   'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  cyan:   'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
}

const dots: Record<Variant, string> = {
  green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-amber-500',
  blue: 'bg-blue-500', gray: 'bg-gray-400', purple: 'bg-purple-500', cyan: 'bg-cyan-500',
}

export function Badge({ label, variant }: { label: string; variant: Variant }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[variant]}`} />
      {label}
    </span>
  )
}

export const statusProcessoBadge = (s: string) => {
  const m: Record<string, Variant> = { ativo: 'green', arquivado: 'gray', encerrado: 'red' }
  return <Badge label={s} variant={m[s] ?? 'gray'} />
}
export const statusDocumentoBadge = (s: string) => {
  const m: Record<string, Variant> = { pendente: 'yellow', aprovado: 'green', rejeitado: 'red' }
  return <Badge label={s} variant={m[s] ?? 'gray'} />
}
export const statusHonorarioBadge = (s: string) => {
  const m: Record<string, Variant> = { pendente: 'yellow', pago: 'green', vencido: 'red', cancelado: 'gray' }
  return <Badge label={s} variant={m[s] ?? 'gray'} />
}
export const statusPrazoBadge = (s: string) => {
  const m: Record<string, Variant> = { pendente: 'yellow', concluido: 'green', vencido: 'red' }
  return <Badge label={s} variant={m[s] ?? 'gray'} />
}
export const roleBadge = (r: string) => {
  const m: Record<string, Variant> = { admin: 'purple', advogado: 'blue', cliente: 'cyan' }
  return <Badge label={r} variant={m[r] ?? 'gray'} />
}
