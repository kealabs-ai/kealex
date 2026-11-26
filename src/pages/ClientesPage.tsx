import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, UserCheck, Search, Phone, Mail, AlertTriangle } from 'lucide-react'
import { useClientes, useCreateCliente, useUpdateCliente, useDeleteCliente } from '../hooks/useClientes'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { Button } from '../components/UI'
import { ClienteFormModal, type ClienteFormData } from '../components/ClienteFormModal'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { useToast } from '../components/Toast'
import type { Cliente } from '../types'

export function ClientesPage() {
  const { data: clientes, isLoading, error } = useClientes()
  const create = useCreateCliente()
  const update = useUpdateCliente()
  const remove = useDeleteCliente()
  const { error: showError } = useToast()
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Cliente | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  if (error) console.error('Erro ao carregar clientes')

  // Garantir que seja array
  const clientesList = Array.isArray(clientes) ? clientes : []

  const openCreate = () => { setEditing(null); setOpen(true) }
  const openEdit = (c: Cliente) => { setEditing(c); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: ClienteFormData) => {
    const clean = (value: string | null | undefined) => (value ?? '').trim()
    const clientData: ClienteFormData = {
      nome: clean(data.nome), email: clean(data.email), telefone: clean(data.telefone),
      cpfCnpj: clean(data.cpfCnpj), cep: clean(data.cep), endereco: clean(data.endereco),
      cidade: clean(data.cidade), estado: clean(data.estado).toUpperCase(),
      observacoes: clean(data.observacoes), rg: clean(data.rg), orgaoExpedidor: clean(data.orgaoExpedidor),
      nacionalidade: clean(data.nacionalidade), estadoCivil: clean(data.estadoCivil), profissao: clean(data.profissao),
      dataNascimento: clean(data.dataNascimento), razaoSocial: clean(data.razaoSocial), nomeFantasia: clean(data.nomeFantasia),
      inscricaoEstadual: clean(data.inscricaoEstadual), inscricaoMunicipal: clean(data.inscricaoMunicipal),
      representanteLegal: clean(data.representanteLegal), whatsapp: clean(data.whatsapp),
    }
    const options = { onSuccess: close, onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
      showError(typeof detail === 'string' ? detail : 'Não foi possível salvar as informações do cliente.')
    } }
    if (editing) update.mutate({ id: editing.id, data: clientData }, options)
    else create.mutate(clientData, options)
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
    <div className="kea-process-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content">
        <PageBanner
          title="Clientes"
          description="Gerencie sua carteira de clientes e mantenha os dados organizados."
          action={<Button icon={<Plus size={15} />} onClick={openCreate}>Novo Cliente</Button>}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        <DataCard delay={0.2}>
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all"
              />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                {['Cliente', 'Email', 'Telefone', 'CPF/CNPJ', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">{h}</th>
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
                        className="border-b border-gray-200 dark:border-slate-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {initials}
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-white">{c.nome}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                            <Mail size={13} className="text-gray-400 dark:text-slate-500" />{c.email}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {c.telefone
                            ? <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400"><Phone size={13} className="text-gray-400 dark:text-slate-500" />{c.telefone}</div>
                            : <span className="text-gray-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400 font-mono text-xs">{c.cpfCnpj ?? <span className="text-gray-300 dark:text-slate-600">—</span>}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex gap-1.5 justify-end">
                            <button onClick={() => openEdit(c)} aria-label={`Editar ${c.nome}`} style={{ padding: 7, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex' }} title="Editar"><Pencil size={14} /></button>
                            <button onClick={() => setConfirmDelete(c)} aria-label={`Excluir ${c.nome}`} style={{ padding: 7, borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex' }} title="Excluir"><Trash2 size={14} /></button>
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

      {confirmDelete && (
        <Modal title="Confirmar Exclusão" onClose={() => setConfirmDelete(null)} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
              <AlertTriangle size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">Tem certeza que deseja excluir <strong>{confirmDelete.nome}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}

      {open && <ClienteFormModal
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
        subtitle={editing ? `Editando: ${editing.nome}` : 'Cadastre um novo cliente'}
        initialData={editing ?? undefined}
        onClose={close}
        onSubmit={onSubmit}
        loading={create.isPending || update.isPending}
      />}\n    </div>
  )
}
