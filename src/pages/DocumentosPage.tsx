import axios from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText, Search, Download, AlertTriangle } from 'lucide-react'
import { useDocumentos, useCreateDocumento, useUpdateDocumento, useDeleteDocumento } from '../hooks/useDocumentos'
import { useProcessos } from '../hooks/useProcessos'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState, StatCard } from '../components/Cards'
import { statusDocumentoBadge } from '../components/Badge'
import { Button, Input, Select } from '../components/UI'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { useAuth } from '../context/useAuth'
import { useToast } from '../components/Toast'
import { documentosApi } from '../api/documentos'
import { canReplayUploadAfterListFailure, documentUploadFailureMessage, documentUploadRecoveryId, validateDocumentUpload } from '../utils/documentUploadValidation'
import { saveAs } from 'file-saver'
import type { Documento, StatusDocumento, TipoDocumento } from '../types'

type FormData = { processoId: string; nome: string; tipo: TipoDocumento; status?: StatusDocumento }

const MAX_DOCUMENT_UPLOAD_BYTES = Number(import.meta.env.KEALEX_MAX_UPLOAD_BYTES)
const fmtBytes = (b: number) => b < 1024
  ? `${b} B`
  : b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / 1024 / 1024).toFixed(1)} MB`
async function sha256File(file: File): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null
  try {
    const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer())
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

const tipoIcon: Record<string, string> = { peticao: '📄', contrato: '📋', comprovante: '🧾', outro: '📁' }

function normalizeStoredFileName(name: string): string {
  return Array.from(name)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return code > 0x1f && code !== 0x7f
    })
    .join('')
    .trim()
}

export function DocumentosPage() {
  const { user } = useAuth()
  const isCliente = user?.role === 'cliente'
  
  const { data: documentos, isLoading, isFetching, isError: documentosError, refetch } = useDocumentos(!isCliente)
  const { data: processos } = useProcessos(!isCliente)
  const create = useCreateDocumento()
  const update = useUpdateDocumento()
  const remove = useDeleteDocumento()
  const { error: toastError, success: toastSuccess } = useToast()
  
  const [editing, setEditing] = useState<Documento | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Documento | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadIdentity, setUploadIdentity] = useState<{ file: File; processId: string; key: string } | null>(null)
  const [uploadRecoveryId, setUploadRecoveryId] = useState<string | null>(null)
  const [isCleaningUploadRecovery, setIsCleaningUploadRecovery] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>()
  const isSavingDocument = isUploading || create.isPending || update.isPending

  const cleanupUploadRecovery = async () => {
    if (!uploadRecoveryId) return
    setIsCleaningUploadRecovery(true)
    try {
      await documentosApi.deleteStoredFile(uploadRecoveryId)
      setUploadRecoveryId(null)
      setUploadIdentity(null)
      toastSuccess('A limpeza foi concluida. Reenvie o documento para continuar.')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setUploadRecoveryId(null)
        setUploadIdentity(null)
        toastSuccess('O arquivo temporario ja foi removido. Reenvie o documento para continuar.')
      } else {
        toastError('A limpeza ainda esta indisponivel. Tente novamente usando o identificador exibido abaixo.')
      }
    } finally {
      setIsCleaningUploadRecovery(false)
    }
  }

  // Log para debug removido — não expor dados em produção

  // Garantir que documentos seja sempre um array
  const documentosList = Array.isArray(documentos) ? documentos : []
  
  const filtered = documentosList.filter((d) => 
    d?.nome && typeof d.nome === 'string' && d.nome.toLowerCase().includes(search.toLowerCase())
  )

  // Simplificar - backend já filtra os dados por tenant
  const displayDocumentos = filtered

  const openCreate = () => { reset({}); setEditing(null); setSelectedFile(null); setOpen(true) }
  const openEdit = (d: Documento) => { reset(d); setEditing(d); setSelectedFile(null); setOpen(true) }
  const close = () => {
    if (isSavingDocument) return
    setOpen(false)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const issue = validateDocumentUpload(file.name, file.size, MAX_DOCUMENT_UPLOAD_BYTES)
    if (issue === 'unsupported-type') {
      setSelectedFile(null)
      e.target.value = ''
      toastError('Formato não permitido. Selecione um arquivo PDF, DOC ou DOCX.')
      return
    }
    if (issue === 'empty-file') {
      setSelectedFile(null)
      e.target.value = ''
      toastError('O arquivo selecionado esta vazio.')
      return
    }
    if (issue === 'invalid-limit') {
      setSelectedFile(null)
      e.target.value = ''
      toastError('O limite de upload nao esta configurado corretamente. Contate o suporte.')
      return
    }
    if (issue === 'too-large') {
      setSelectedFile(null)
      e.target.value = ''
      toastError(`O arquivo excede o limite configurado de ${fmtBytes(MAX_DOCUMENT_UPLOAD_BYTES)}.`)
      return
    }

    setSelectedFile(file)
  }
  
  const onSubmit = async (data: FormData) => {
    if (!editing) {
      if (!selectedFile) {
        toastError('Selecione um arquivo para enviar.')
        return
      }
      if (!data.processoId) {
        toastError('Selecione o processo ao qual este documento será vinculado.')
        return
      }
      let storedFileId: string | undefined
      setIsUploading(true)
      try {
        const previousAttempt = uploadIdentity
        const matchingAttempt = previousAttempt?.file === selectedFile && previousAttempt.processId === data.processoId
          ? previousAttempt
          : null
        const hasMatchingIdempotencyKey = matchingAttempt !== null
        const idempotencyKey = matchingAttempt?.key ?? crypto.randomUUID()
        const storedFiles = await documentosApi.listStoredFiles(data.processoId).catch((error: unknown) => {
          const isAxiosError = axios.isAxiosError(error)
          const status = isAxiosError ? error.response?.status : undefined
          const isNetworkFailure = isAxiosError && !error.response
          if (!canReplayUploadAfterListFailure(status, hasMatchingIdempotencyKey, isNetworkFailure)) throw error
          return []
        })
        const normalizedFileName = normalizeStoredFileName(selectedFile.name)
        const recoveryCandidates = storedFiles.filter((candidate) => candidate.processId === data.processoId
          && candidate.name === normalizedFileName
          && candidate.size === selectedFile.size)
        const fileHash = recoveryCandidates.length ? await sha256File(selectedFile) : null
        let storedFile = fileHash
          ? recoveryCandidates.find((candidate) => candidate.sha256.toLowerCase() === fileHash)
          : undefined
        if (storedFile) {
          const candidateId = storedFile.id
          const linked = (await documentosApi.byProcesso(data.processoId))
            .some((documento) => documento.urlArquivo === `/v1/lex/arquivos/${candidateId}`)
          if (linked) storedFile = undefined
        }
        if (!storedFile) {
          setUploadIdentity({ file: selectedFile, processId: data.processoId, key: idempotencyKey })
          storedFile = await documentosApi.uploadStoredFile(selectedFile, data.processoId, idempotencyKey)
        }
        storedFileId = storedFile.id
        const urlArquivo = `/v1/lex/arquivos/${storedFile.id}`
        const alreadyLinked = (await documentosApi.byProcesso(data.processoId))
          .some((documento) => documento.urlArquivo === urlArquivo)
        if (!alreadyLinked) {
          await create.mutateAsync({
            processoId: data.processoId,
            nome: (data.nome || '').trim() || selectedFile.name,
            tipo: data.tipo,
            urlArquivo,
            tamanhoBytes: storedFile.size,
          })
        }
        toastSuccess('Documento enviado e vinculado ao processo.')
        setSelectedFile(null)
        setUploadIdentity(null)
        close()
      } catch (error) {
        if (storedFileId) {
          try {
            const linkedUrl = `/v1/lex/arquivos/${storedFileId}`
            const linked = (await documentosApi.byProcesso(data.processoId))
              .some((documento) => documento.urlArquivo === linkedUrl)
            if (linked) {
              toastSuccess('Documento enviado e vinculado ao processo.')
              setSelectedFile(null)
              setUploadIdentity(null)
              close()
              return
            }
          } catch {
            // A resposta do cadastro pode ter se perdido; preserve o arquivo para reconciliação na próxima tentativa.
          }
          toastError('Não foi possível confirmar o vínculo. O arquivo foi preservado; tente novamente para retomar o envio.')
          return
        }
        const recoveryId = axios.isAxiosError(error)
          ? documentUploadRecoveryId(error.response?.data)
          : null
        if (recoveryId) {
          try {
            await documentosApi.deleteStoredFile(recoveryId)
            setUploadIdentity(null)
            toastError('O envio falhou, mas o arquivo orfao foi limpo. Tente enviar novamente.')
          } catch (cleanupError) {
            if (axios.isAxiosError(cleanupError) && cleanupError.response?.status === 404) {
              setUploadIdentity(null)
              toastError('O envio falhou; o arquivo temporario ja foi removido. Tente enviar novamente.')
            } else {
              setUploadRecoveryId(recoveryId)
              toastError('O envio falhou e a limpeza esta pendente. Use o painel de recuperacao abaixo.')
            }
          }
          return
        }
        const status = axios.isAxiosError(error) ? error.response?.status : undefined
        toastError(documentUploadFailureMessage(status))
      } finally {
        setIsUploading(false)
      }
      return
    }

    update.mutate({ id: editing.id, data }, {
      onSuccess: close,
      onError: () => toastError('Não foi possível atualizar o documento. Tente novamente.'),
    })
  }

  const downloadDocumento = async (documento: Documento) => {
    const storedFile = documentosApi.isStoredFile(documento.urlArquivo)
    if (!storedFile) {
      toastError('Este documento nao esta disponivel no armazenamento privado.')
      return
    }
    try {
      const file = await documentosApi.downloadStoredFile(storedFile[1], documento.nome)
      saveAs(file.data, file.name)
    } catch {
      toastError('Não foi possível baixar este documento.')
    }
  }

  const stats = [
    { label: 'Total', value: displayDocumentos.length, gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', icon: <FileText size={18} /> },
    { label: 'Aprovados', value: displayDocumentos.filter((d) => d?.status === 'aprovado').length, gradient: 'linear-gradient(135deg,#10b981,#059669)', icon: <FileText size={18} /> },
    { label: 'Pendentes', value: displayDocumentos.filter((d) => d?.status === 'pendente').length, gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: <FileText size={18} /> },
    { label: 'Rejeitados', value: displayDocumentos.filter((d) => d?.status === 'rejeitado').length, gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', icon: <FileText size={18} /> },
  ]

  if (isCliente) {
    return (
      <div className="kea-process-page">
        <TopBar title="" hideModuleBar />
        <div className="kea-process-content">
          <PageBanner title="Documentos" description="A consulta individual ainda não está disponível." />
          <section role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            O acesso depende de um vínculo seguro entre seu login e o cadastro de cliente. Entre em contato com o escritório para consultar seus documentos enquanto esse vínculo é configurado.
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="kea-process-page">
      <TopBar title="" hideModuleBar />
      <div className="kea-process-content">
        <PageBanner
          title="Documentos"
          description={isCliente ? "Acesse os documentos dos seus processos." : "Organize e acompanhe os documentos processuais do escritório."}
          action={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Documento</Button>}
        />
        {uploadRecoveryId && (
          <section role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">A limpeza do upload ficou pendente.</p>
              <p>Identificador de recuperacao: <code className="select-all">{uploadRecoveryId}</code></p>
            </div>
            <Button type="button" variant="secondary" loading={isCleaningUploadRecovery} disabled={isCleaningUploadRecovery} onClick={() => void cleanupUploadRecovery()}>
              Tentar limpeza
            </Button>
          </section>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
        </div>

        <DataCard delay={0.2}>
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar documento..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-50 dark:focus:ring-indigo-950 transition-all" />
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                {['Nome', 'Tipo', 'Tamanho', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
              ) : documentosError ? (
                <tr>
                  <td colSpan={5}>
                    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                      <p className="text-sm text-red-700 dark:text-red-300">Nao foi possivel carregar os documentos. Tente novamente.</p>
                      <Button type="button" variant="secondary" size="sm" loading={isFetching} disabled={isFetching} onClick={() => void refetch()}>
                        Tentar novamente
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : displayDocumentos.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Nenhum documento encontrado" icon={<FileText size={28} className="text-gray-300" />} /></td></tr>
              ) : (
                <AnimatePresence>
                  {displayDocumentos.map((d, i) => {
                    const storedFile = documentosApi.isStoredFile(d.urlArquivo)
                    const fileUnavailable = !storedFile
                    return (
                    <motion.tr
                      key={d.id}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors group"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{tipoIcon[d.tipo] ?? '📁'}</span>
                          <span>
                            <span className="font-semibold text-gray-800 dark:text-white">{d.nome}</span>
                            {fileUnavailable && <span className="mt-1 block text-xs font-medium text-amber-700 dark:text-amber-300">Arquivo não disponível</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400 capitalize">{d.tipo}</td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-slate-400 font-mono text-xs">{fileUnavailable ? '—' : fmtBytes(d.tamanhoBytes)}</td>
                      <td className="px-4 py-3.5">{statusDocumentoBadge(d.status)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 justify-end">
                          {!fileUnavailable && <button onClick={() => void downloadDocumento(d)} aria-label={`Baixar ${d.nome}`} style={{ padding: 7, borderRadius: 8, background: '#d1fae5', color: '#059669', display: 'flex', border: 'none', cursor: 'pointer' }} title="Download"><Download size={14} /></button>}
                          {!isCliente && (
                            <>
                              <button onClick={() => openEdit(d)} aria-label={`Editar ${d.nome}`} style={{ padding: 7, borderRadius: 8, background: '#eef2ff', color: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex' }} title="Editar"><Pencil size={14} /></button>
                              <button onClick={() => setConfirmDelete(d)} aria-label={`Excluir ${d.nome}`} style={{ padding: 7, borderRadius: 8, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex' }} title="Excluir"><Trash2 size={14} /></button>
                            </>
                          )}
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
              <p className="text-sm text-red-700">Excluir o documento <strong>{confirmDelete.nome}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(confirmDelete.id, {
                onSuccess: () => setConfirmDelete(null),
                onError: () => toastError('Não foi possível excluir o documento. Tente novamente.'),
              })}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}

      {open && !isCliente && (
        <Modal title={editing ? 'Editar Documento' : 'Novo Documento'} subtitle="Adicione um documento ao processo" onClose={close}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Select label="Processo" disabled={Boolean(editing)} {...register('processoId')}>
              <option value="">Selecione...</option>
              {Array.isArray(processos) && processos.map((p) => <option key={p.id} value={p.id}>{p.titulo}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" {...register('nome')} placeholder="Ex: Petição Inicial" />
              <Select label="Tipo" {...register('tipo')}>
                {['peticao', 'contrato', 'comprovante', 'outro'].map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            
            {!editing && (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide">Arquivo</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  aria-label={`Selecionar arquivo PDF, DOC ou DOCX de até ${fmtBytes(MAX_DOCUMENT_UPLOAD_BYTES)}`}
                  onChange={handleFileChange}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {selectedFile && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="text-sm text-emerald-900 font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-700">{fmtBytes(selectedFile.size)}</p>
                  </div>
                )}
              </div>
            )}
            {editing && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">O arquivo original sera mantido. Para substituir o conteudo, envie um novo documento pelo fluxo de upload privado.</p>}
            {editing && (
              <Select label="Status" {...register('status')}>
                {['pendente', 'aprovado', 'rejeitado'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="secondary" type="button" disabled={isSavingDocument} onClick={close}>Cancelar</Button>
              <Button type="submit" disabled={isUploading || Boolean(uploadRecoveryId)} loading={isUploading || create.isPending || update.isPending}>Salvar</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
