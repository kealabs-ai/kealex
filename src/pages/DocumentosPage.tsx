import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText, ExternalLink, Search } from 'lucide-react'
import { useDocumentos, useCreateDocumento, useUpdateDocumento, useDeleteDocumento } from '../hooks/useDocumentos'
import { useProcessos } from '../hooks/useProcessos'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusDocumentoBadge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import type { Documento, StatusDocumento, TipoDocumento } from '../types'

type FormData = { processoId: string; nome: string; tipo: TipoDocumento; urlArquivo: string; tamanhoBytes: number; status?: StatusDocumento }

const fmtBytes = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`

const tipoIcon: Record<string, string> = { peticao: '📄', contrato: '📋', comprovante: '🧾', outro: '📁' }

export function DocumentosPage() {
  const { data: documentos, isLoading } = useDocumentos()
  const { data: processos } = useProcessos()
  const create = useCreateDocumento()
  const update = useUpdateDocumento()
  const remove = useDeleteDocumento()
  const [editing, setEditing] = useState<Documento | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { register, handleSubmit, reset } = useForm<FormData>()

  const openCreate = () => { reset({}); setEditing(null); setOpen(true) }
  const openEdit = (d: Documento) => { reset(d); setEditing(d); setOpen(true) }
  const close = () => setOpen(false)
  const onSubmit = (data: FormData) => {
    if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
    else create.mutate({ ...data, tamanhoBytes: Number(data.tamanhoBytes) }, { onSuccess: close })
  }

  const filtered = documentos?.filter((d) => d.nome.toLowerCase().includes(search.toLowerCase())) ?? []

  const stats = [
    { label: 'Total', value: documentos?.length ?? 0, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <FileText size={18} /> },
    { label: 'Aprovados', value: documentos?.filter((d) => d.status === 'aprovado').length ?? 0, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <FileText size={18} /> },
    { label: 'Pendentes', value: documentos?.filter((d) => d.status === 'pendente').length ?? 0, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <FileText size={18} /> },
    { label: 'Rejeitados', value: documentos?.filter((d) => d.status === 'rejeitado').length ?? 0, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <FileText size={18} /> },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestão de documentos processuais</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Documento</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      <DataCard delay={0.2}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar documento..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Nome', 'Tipo', 'Tamanho', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5}><EmptyState message="Nenhum documento encontrado" icon={<FileText size={28} className="text-gray-300" />} /></td></tr>
            ) : (
              <AnimatePresence>
                {filtered.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{tipoIcon[d.tipo] ?? '📁'}</span>
                        <span className="font-semibold text-gray-800">{d.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 capitalize">{d.tipo}</td>
                    <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">{fmtBytes(d.tamanhoBytes)}</td>
                    <td className="px-4 py-3.5">{statusDocumentoBadge(d.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={d.urlArquivo} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"><ExternalLink size={14} /></a>
                        <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => remove.mutate(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </DataCard>

      {open && (
        <Modal title={editing ? 'Editar Documento' : 'Novo Documento'} subtitle="Adicione um documento ao processo" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select label="Processo" {...register('processoId')}>
              <option value="">Selecione...</option>
              {processos?.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" {...register('nome')} placeholder="Ex: Petição Inicial" />
              <Select label="Tipo" {...register('tipo')}>
                {['peticao', 'contrato', 'comprovante', 'outro'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <Input label="URL do Arquivo" {...register('urlArquivo')} placeholder="https://..." />
            <Input label="Tamanho (bytes)" {...register('tamanhoBytes')} type="number" placeholder="Ex: 204800" />
            {editing && (
              <Select label="Status" {...register('status')}>
                {['pendente', 'aprovado', 'rejeitado'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
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
