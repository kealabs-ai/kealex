import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, UserCheck, Search, Phone, Mail } from 'lucide-react'
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '../hooks/useClientes'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button, Input, Textarea } from '../components/UI'
import { TopBar } from '../components/TopBar'
import type { Cliente } from '../types'

type FormData = {
  nome: string; email: string; telefone?: string
  cpfCnpj?: string; endereco?: string; observacoes?: string
}

export function ClientesPage() {
  const { data: clientes, isLoading } = useClientes()
  const create = useCreateCliente()
  const update = useUpdateCliente()
  const remove = useDeleteCliente()
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  // Garantir que seja array
  const clientesList = Array.isArray(clientes) ? clientes : []

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (c: Cliente) => { reset(c); setEditing(c); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate(data as any, { onSuccess: close })
  }

  const filtered = clientesList.filter((c) =>
    (c?.nome && c.nome.toLowerCase().includes(search.toLowerCase())) ||
    (c?.email && c.email.toLowerCase().includes(search.toLowerCase()))
  )

  const stats = [
    { label: 'Total', value: clientesList.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <UserCheck size={18} /> },
    { label: 'Com telefone', value: clientesList.filter((c) => c?.telefone).length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <Phone size={18} /> },
    { label: 'Com CPF/CNPJ', value: clientesList.filter((c) => c?.cpfCnpj).length, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <UserCheck size={18} /> },
    { label: 'Com endereço', value: clientesList.filter((c) => c?.endereco).length, gradient: 'linear-gradient(135deg,#3b82f6,#06b6d4)', icon: <UserCheck size={18} /> },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar
        icon={UserCheck}
        title="Clientes"
        subtitle="Gerencie sua carteira de clientes"
        actions={<Button icon={<Plus size={15} />} onClick={openCreate}>Novo Cliente</Button>}
      />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        <DataCard delay={0.2}>
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Cliente', 'Email', 'Telefone', 'CPF/CNPJ', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Nenhum cliente encontrado" icon={<UserCheck size={28} className="text-gray-300" />} /></td></tr>
              ) : (
                <AnimatePresence>
                  {filtered.map((c, i) => {
                    const initials = c.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')
                    return (
                      <motion.tr
                        key={c.id}
                        className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-gray-800">{c.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Mail size={13} className="text-gray-400" />{c.email}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {c.telefone
                            ? <div className="flex items-center gap-1.5 text-gray-500"><Phone size={13} className="text-gray-400" />{c.telefone}</div>
                            : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{c.cpfCnpj ?? <span className="text-gray-300">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                            <button onClick={() => remove.mutate(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
      </div>

      {open && (
        <Modal
          title={editing ? 'Editar Cliente' : 'Novo Cliente'}
          subtitle={editing ? `Editando: ${editing.nome}` : 'Cadastre um novo cliente'}
          onClose={close}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" {...register('nome')} placeholder="Nome completo" />
              <Input label="Email" {...register('email')} type="email" placeholder="email@exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telefone" {...register('telefone')} placeholder="(11) 99999-9999" />
              <Input label="CPF / CNPJ" {...register('cpfCnpj')} placeholder="000.000.000-00" />
            </div>
            <Input label="Endereço" {...register('endereco')} placeholder="Rua, número, cidade..." />
            <Textarea label="Observações" {...register('observacoes')} rows={3} placeholder="Informações adicionais..." />
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
