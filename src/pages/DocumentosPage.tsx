import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText, ExternalLink, Search, Download, Upload } from 'lucide-react'
import { useDocumentos, useCreateDocumento, useUpdateDocumento, useDeleteDocumento } from '../hooks/useDocumentos'
import { useProcessos } from '../hooks/useProcessos'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusDocumentoBadge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import type { Documento, StatusDocumento, TipoDocumento } from '../types'

type FormData = { processoId: string; nome: string; tipo: TipoDocumento; urlArquivo: string; tamanhoBytes: number; status?: StatusDocumento }

const fmtBytes = (b: number) => b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`
const tipoIcon: Record<string, string> = { peticao: '📄', contrato: '📋', comprovante: '🧾', outro: '📁' }

export function DocumentosPage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'cliente'
  
  const { data: documentos, isLoading, error } = useDocumentos()
  const { data: processos } = useProcessos()
  const create = useCreateDocumento()
  const update = useUpdateDocumento()
  const remove = useDeleteDocumento()
  
  const [editing, setEditing] = useState<Documento | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { register, handleSubmit, reset } = useForm<FormData>()

  // Log para debug
  console.log('DocumentosPage render:', { documentos, isLoading, error, user })

  // Tratar erro
  if (error) {
    console.error('Erro ao carregar documentos:', error)
  }

  // Garantir que documentos seja sempre um array
  const documentosList = Array.isArray(documentos) ? documentos : []
  
  const filtered = documentosList.filter((d) => 
    d?.nome && typeof d.nome === 'string' && d.nome.toLowerCase().includes(search.toLowerCase())
  )

  // Simplificar - backend já filtra os dados por tenant
  const displayDocumentos = filtered

  const openCreate = () => { reset({}); setEditing(null); setUploadMode('url'); setSelectedFile(null); setOpen(true) }
  const openEdit = (d: Documento) => { reset(d); setEditing(d); setUploadMode('url'); setSelectedFile(null); setOpen(true) }
  const close = () => setOpen(false)
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }
  
  const onSubmit = (data: FormData) => {
    if (uploadMode === 'file' && selectedFile) {
      // Simular upload - em produção, fazer upload real para CDN
      const fakeUrl = `https://cdn.kealex.com.br/docs/${selectedFile.name}`
      const payload = {
        ...data,
        urlArquivo: fakeUrl,
        tamanhoBytes: selectedFile.size
      }
      if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess: close })
      else create.mutate(payload, { onSuccess: close })
    } else {
      if (editing) update.mutate({ id: editing.id, data }, { onSuccess: close })
      else create.mutate({ ...data, tamanhoBytes: Number(data.tamanhoBytes) }, { onSuccess: close })
    }
  }

  const stats = [
    { label: 'Total', value: displayDocumentos.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <FileText size={18} /> },
    { label: 'Aprovados', value: displayDocumentos.filter((d) => d?.status === 'aprovado').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <FileText size={18} /> },
    { label: 'Pendentes', value: displayDocumentos.filter((d) => d?.status === 'pendente').length, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <FileText size={18} /> },
    { label: 'Rejeitados', value: displayDocumentos.filter((d) => d?.status === 'rejeitado').length, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <FileText size={18} /> },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar
        icon={FileText}
        title="Documentos"
        subtitle={isCliente ? "Acesse os documentos dos seus processos" : "Gestão de documentos processuais"}
        actions={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Documento</Button>}
      />
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
              ) : displayDocumentos.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Nenhum documento encontrado" icon={<FileText size={28} className="text-gray-300" />} /></td></tr>
              ) : (
                <AnimatePresence>
                  {displayDocumentos.map((d, i) => (
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
                          <a href={d.urlArquivo} download className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download"><Download size={14} /></a>
                          <a href={d.urlArquivo} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors" title="Abrir"><ExternalLink size={14} /></a>
                          {!isCliente && (
                            <>
                              <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Editar"><Pencil size={14} /></button>
                              <button onClick={() => remove.mutate(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </DataCard>
      </div>

      {open && !isCliente && (
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
            
            {/* Toggle Upload Mode */}
            {!editing && (
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Método de Upload</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${
                      uploadMode === 'url'
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ExternalLink size={16} className={uploadMode === 'url' ? 'text-indigo-600' : 'text-gray-400'} />
                      <span className="font-semibold text-sm">URL Externa</span>
                    </div>
                    <p className="text-xs text-gray-500">Link de arquivo já hospedado</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${
                      uploadMode === 'file'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Upload size={16} className={uploadMode === 'file' ? 'text-emerald-600' : 'text-gray-400'} />
                      <span className="font-semibold text-sm">Upload de Arquivo</span>
                    </div>
                    <p className="text-xs text-gray-500">Enviar do seu computador</p>
                  </button>
                </div>
              </div>
            )}
            
            {uploadMode === 'url' ? (
              <>
                <Input label="URL do Arquivo" {...register('urlArquivo')} placeholder="https://..." />
                <Input label="Tamanho (bytes)" {...register('tamanhoBytes')} type="number" placeholder="Ex: 204800" />
              </>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Arquivo</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
                {selectedFile && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-900 font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-700">{fmtBytes(selectedFile.size)}</p>
                  </div>
                )}
              </div>
            )}
            
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
