import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, Search, ShieldCheck } from 'lucide-react'
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '../hooks/useUsuarios'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { roleBadge, Badge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import type { Role, Usuario } from '../types'

type FormData = { nome: string; email: string; senha?: string; role: Role; ativo?: boolean }

const roleColors: Record<Role, string> = {
  admin: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
  advogado: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
  cliente: 'linear-gradient(135deg,#10b981,#059669)',
}

export function UsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios()
  const create = useCreateUsuario()
  const update = useUpdateUsuario()
  const remove = useDeleteUsuario()
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const openCreate = () => { reset({ role: 'cliente' }); setEditing(null); setOpen(true) }
  const openEdit = (u: Usuario) => { reset(u); setEditing(u); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data as any, { onSuccess: close })
  }

  const filtered = usuarios?.filter((u) =>
    u.nome.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const stats = [
    { label: 'Total', value: usuarios?.length ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <Users size={18} /> },
    { label: 'Admins', value: usuarios?.filter((u) => u.role === 'admin').length ?? 0, gradient: roleColors.admin, icon: <ShieldCheck size={18} /> },
    { label: 'Advogados', value: usuarios?.filter((u) => u.role === 'advogado').length ?? 0, gradient: roleColors.advogado, icon: <Users size={18} /> },
    { label: 'Clientes', value: usuarios?.filter((u) => u.role === 'cliente').length ?? 0, gradient: roleColors.cliente, icon: <Users size={18} /> },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerenciamento de usuários e permissões</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Usuário</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      <DataCard delay={0.2}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou email..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Usuário', 'Email', 'Role', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><EmptyState message="Nenhum usuário encontrado" icon={<Users size={28} className="text-gray-300" />} /></td></tr>
            ) : (
              <AnimatePresence>
                {filtered.map((u, i) => {
                  const initials = u.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')
                  return (
                    <motion.tr
                      key={u.id}
                      className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ background: roleColors[u.role] }}
                          >
                            {initials}
                          </div>
                          <span className="font-semibold text-gray-800">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3.5">{roleBadge(u.role)}</td>
                      <td className="px-4 py-3.5">
                        <Badge label={u.ativo ? 'Ativo' : 'Inativo'} variant={u.ativo ? 'green' : 'red'} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                          <button onClick={() => remove.mutate(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </DataCard>

      {open && (
        <Modal title={editing ? 'Editar Usuário' : 'Novo Usuário'} subtitle="Defina as permissões de acesso" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" {...register('nome')} placeholder="Nome completo" />
              <Input label="Email" {...register('email')} type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label={editing ? 'Nova Senha (opcional)' : 'Senha'} {...register('senha')} type="password" placeholder="••••••••" />
              <Select label="Role" {...register('role')}>
                {['admin', 'advogado', 'cliente'].map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </div>
            {editing && (
              <label className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input {...register('ativo')} type="checkbox" className="w-4 h-4 rounded accent-indigo-600" />
                <span className="text-sm font-medium text-gray-700">Usuário ativo</span>
              </label>
            )}
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
