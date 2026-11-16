import { useState, type FormEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowUpRight, Download, ExternalLink, FileCheck2, FileText, RefreshCw, ShieldCheck, Upload, Eye } from 'lucide-react'
import { api } from '../api/client'
import { KEA_CREDITS_QUERY_KEY } from '../api/keaCredits'
import { PageBanner } from '../components/PageBanner'

type Provider = { id: string; name: string; type: string; integrationMode: string; portalUrl: string; apiAvailable: boolean }
type Availability = { available: boolean; integrationMode: string; apiAvailable?: boolean; message: string; portalUrl: string }
type Field = { name: string; label: string; type: string; required: boolean; options?: string[] }
type RequestRow = { id: string; protocol: string; provider: string; certificateType: string; subjectIdentifierMasked: string; status: string; portalUrl: string; createdAt: string | null; documentAvailable: boolean; documentSource?: string; validationStatus?: string; expiresAt?: string | null; message?: string; consultaKey?: string | null }
type PendingCndQuery = { requestId: string; key: string; document: string }
type PageResult = { items: RequestRow[]; page: number; pageSize: number; total: number }

const labels: Record<string, string> = { MANUAL_ACTION_REQUIRED: 'Ação manual necessária', INTEGRATION_UNAVAILABLE: 'Integração indisponível', PENDING: 'Pendente', PROCESSING: 'Em processamento', ISSUED: 'Certidão emitida', NOT_ISSUED: 'Não emitida', FAILED: 'Falhou', EXPIRED: 'Expirada', CANCELLED: 'Cancelada', AWAITING_PAYMENT: 'Aguardando pagamento' }
const ufOptions = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

export function CertificatesPage() {
  const { provider: providerId } = useParams<{ provider: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [historyPage, setHistoryPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [fields, setFields] = useState<{ providerId?: string; values: Record<string, string> }>({ values: {} })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [pendingCndQuery, setPendingCndQuery] = useState<PendingCndQuery | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const providersQuery = useQuery({ queryKey: ['certificate-providers'], queryFn: async () => (await api.get<Provider[]>('/api/v1/certificates/providers')).data })
  const availabilityQuery = useQuery({ queryKey: ['certificate-availability', providerId], enabled: Boolean(providerId), queryFn: async () => (await api.get<Availability>(`/api/v1/certificates/providers/${providerId}/availability`)).data })
  const requirementsQuery = useQuery({ queryKey: ['certificate-requirements', providerId], enabled: Boolean(providerId), queryFn: async () => (await api.get<{ fields: Field[] }>(`/api/v1/certificates/providers/${providerId}/requirements`)).data })
  const historyQuery = useQuery({ queryKey: ['certificate-requests', providerId, historyPage, statusFilter, sortOrder], queryFn: async () => (await api.get<PageResult>('/api/v1/certificates/requests', { params: { page: historyPage, page_size: 10, provider: providerId || undefined, status: statusFilter || undefined, sort_by: 'created_at', sort_order: sortOrder } })).data })
  const providers = providersQuery.data || []
  const requirements = requirementsQuery.data?.fields || []
  const history = historyQuery.data?.items || []
  const historyTotal = historyQuery.data?.total || 0
  const selected = providers.find((item) => item.id === providerId)
  const fieldValues = fields.providerId === providerId ? fields.values : {}

  function getErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError(error) && typeof error.response?.data?.detail === 'string') return error.response.data.detail
    return fallback
  }

  async function pollCnd(pending: PendingCndQuery, attempts = 40): Promise<RequestRow | null> {
    let key = pending.key
    let latest: RequestRow | null = null
    try {
      for (let attempt = 0; attempt < attempts; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 700))
        const { data } = await api.post<RequestRow>(`/api/v1/certificates/requests/${pending.requestId}/continue`, { fields: { document: pending.document }, key }, { timeout: 25000 })
        latest = data
        if (data.status !== 'PROCESSING' || !data.consultaKey) {
          setPendingCndQuery(null)
          await queryClient.invalidateQueries({ queryKey: ['certificate-requests'] })
          return data
        }
        key = data.consultaKey
        setPendingCndQuery({ ...pending, key })
      }
      return latest
    } catch (error) {
      setPendingCndQuery({ ...pending, key })
      throw error
    }
  }

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
      if (!providerId || pendingCndQuery) return
    setBusy(true); setMessage('')
    try {
      const requestFields = { ...fieldValues }
      const { data: created } = await api.post<RequestRow>('/api/v1/certificates/requests', { provider: providerId, fields: requestFields }, { timeout: selected?.apiAvailable ? 65000 : 30000 })
      let data = created
      if (created.status === 'PROCESSING' && created.consultaKey && requestFields.document) {
        const pending = { requestId: created.id, key: created.consultaKey, document: requestFields.document }
        setPendingCndQuery(pending)
        data = await pollCnd(pending) || created
      }
      setMessage(`${data.message || (data.status === 'PROCESSING' ? 'A consulta continua em processamento.' : selected?.apiAvailable ? 'Consulta enviada à Receita Federal.' : 'Solicitação registrada. Abra o portal oficial para concluir a emissão.')} Protocolo ${data.protocol}.`)
      setFields({ providerId, values: {} })
      setHistoryPage(1)
      await queryClient.invalidateQueries({ queryKey: ['certificate-requests'] })
    } catch (error: unknown) { setMessage(getErrorMessage(error, 'Não foi possível registrar a solicitação.')) }
    finally { await queryClient.invalidateQueries({ queryKey: KEA_CREDITS_QUERY_KEY }); setBusy(false) }
  }

  async function continuePendingCnd() {
    if (!pendingCndQuery) return
    setBusy(true)
    try {
      const result = await pollCnd(pendingCndQuery)
      if (result) setMessage(`${result.message || 'A consulta continua em processamento.'} Protocolo ${result.protocol}.`)
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Não foi possível consultar novamente a Receita Federal. A chave temporária continua apenas nesta tela.'))
    } finally { await queryClient.invalidateQueries({ queryKey: KEA_CREDITS_QUERY_KEY }); setBusy(false) }
  }

  async function attachPdf(requestId: string, file?: File) {
    if (!file) return
    const body = new FormData(); body.append('file', file)
    setBusy(true); setMessage('')
    try { await api.post(`/api/v1/certificates/requests/${requestId}/document`, body); setMessage('PDF anexado ao histórico. O arquivo está marcado como upload do usuário e ainda não foi validado pelo emissor.'); await queryClient.invalidateQueries({ queryKey: ['certificate-requests'] }) }
    catch (error: unknown) { setMessage(getErrorMessage(error, 'Não foi possível anexar o PDF.')) }
    finally { setBusy(false) }
  }

  async function openDocument(row: RequestRow, download = false) {
    try {
      const { data } = await api.get(`/api/v1/certificates/${row.id}/${download ? 'download' : 'document'}`, { responseType: 'blob' })
      const url = URL.createObjectURL(data)
      if (download) { const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${row.provider}-${row.id}.pdf`; anchor.click(); URL.revokeObjectURL(url) }
      else setPreviewUrl(url)
    } catch { setMessage('Não foi possível abrir o documento.') }
  }

  return <div className="min-h-full bg-gray-50 p-5 md:p-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <PageBanner section="Certidões" title={selected?.name || 'Emitir Certidões'} description={selected ? selected.type : 'Solicite certidões pelos portais oficiais e acompanhe os documentos anexados.'} />

      {message && <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">{message}{pendingCndQuery && <button type="button" disabled={busy} onClick={() => void continuePendingCnd()} className="ml-3 rounded-lg bg-sky-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? 'Consultando…' : 'Consultar resultado'}</button>}</div>}
      {providersQuery.isError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Não foi possível carregar os emissores.</div>}
      {requirementsQuery.isError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Não foi possível carregar os requisitos deste emissor.</div>}
      {historyQuery.isError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Não foi possível carregar o histórico de certidões.</div>}

      {!selected ? <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Emissores de certidões">
        {providers.map((item) => <article key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-800"><FileCheck2 size={21} /></span>
          <h2 className="mt-4 font-bold text-slate-900 dark:text-white">{item.name}</h2><p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{item.type}</p>
          <p className="mt-3 text-xs text-amber-700">{item.apiAvailable ? 'Emissão automatizada disponível pela API oficial.' : 'Emissão automatizada indisponível; use o portal oficial.'}</p>
          <button className="mt-4 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white" onClick={() => navigate(`/kea-store/certidoes/${item.id}`)}>Acessar emissor <ArrowUpRight className="ml-2 inline" size={15} /></button>
        </article>)}
      </section> : <>
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <form onSubmit={submitRequest} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-bold text-slate-900 dark:text-white">Dados para solicitação</h2>
            <p className="mt-1 text-sm text-slate-500">Informe apenas os dados exigidos pelo emissor. Eles são usados para validar o formulário e não são gravados no histórico.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {requirements.map((field) => <label key={field.name} className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}{field.required && <span className="sr-only"> obrigatório</span>}
                {field.type === 'uf' ? <select required={field.required} value={fieldValues[field.name] || ''} onChange={(event) => setFields({ providerId, values: { ...fieldValues, [field.name]: event.target.value } })} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-800"><option value="">Selecione</option>{(field.options || ufOptions).map((uf) => <option key={uf}>{uf}</option>)}</select> : <input required={field.required} type={field.type === 'date' ? 'date' : 'text'} autoComplete="off" value={fieldValues[field.name] || ''} onChange={(event) => setFields({ providerId, values: { ...fieldValues, [field.name]: event.target.value } })} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-600 dark:bg-slate-800" />}
              </label>)}
            </div>
            <button disabled={busy || Boolean(pendingCndQuery)} className="mt-5 rounded-xl bg-[#087E96] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? (selected?.apiAvailable ? 'Consultando Receita Federal…' : 'Registrando…') : pendingCndQuery ? 'Consulta em andamento' : (selected?.apiAvailable ? 'Emitir certidão' : 'Registrar solicitação')}</button>
          </form>
          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100"><ShieldCheck size={18} /> {selected?.apiAvailable ? 'Integração com a API oficial' : 'Integração via portal oficial'}</div>
            <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">{availabilityQuery.data?.message || 'A emissão automatizada não está habilitada. A emissão deve ser concluída no portal oficial.'}</p>
            <p className="mt-2 text-xs text-amber-900 dark:text-amber-200">{selected?.apiAvailable ? 'A consulta pode gerar cobrança conforme o contrato Serpro.' : 'Custas e taxas, quando aplicáveis, são definidas pelo emissor e devem ser confirmadas no portal.'}</p>
            <a href={availabilityQuery.data?.portalUrl || selected.portalUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white">Abrir portal oficial <ExternalLink size={15} /></a>
          </aside>
        </section>
      </>}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5 dark:border-slate-700"><div><h2 className="font-bold text-slate-900 dark:text-white">Histórico de solicitações</h2><p className="mt-1 text-sm text-slate-500">Somente solicitações da sua conta e organização.</p></div><div className="flex items-center gap-2"><label className="text-xs text-slate-600">Status <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setHistoryPage(1) }} className="ml-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5"><option value="">Todos</option><option value="PENDING">Pendente</option><option value="PROCESSING">Em processamento</option><option value="MANUAL_ACTION_REQUIRED">Ação manual</option><option value="ISSUED">Certidão emitida</option><option value="NOT_ISSUED">Não emitida</option><option value="FAILED">Falhou</option></select></label><button type="button" onClick={() => setSortOrder((current) => current === 'desc' ? 'asc' : 'desc')} className="rounded-lg border px-2.5 py-1.5 text-xs">Data {sortOrder === 'desc' ? '↓' : '↑'}</button><button type="button" onClick={() => void historyQuery.refetch()} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Atualizar histórico"><RefreshCw size={17} /></button></div></div>
        {history.length === 0 ? <p className="p-6 text-sm text-slate-500">Nenhuma solicitação encontrada.</p> : <><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800"><tr>{['Protocolo', 'Emissor e tipo', 'Documento', 'Data', 'Status', 'Ações'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{history.map((row) => <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800"><td className="px-4 py-3 font-mono text-xs">{row.protocol.slice(0, 12)}</td><td className="px-4 py-3"><div className="font-medium">{providers.find((item) => item.id === row.provider)?.name || row.provider}</div><div className="text-xs text-slate-500">{row.certificateType}</div></td><td className="px-4 py-3">{row.subjectIdentifierMasked}</td><td className="px-4 py-3">{row.createdAt ? new Date(row.createdAt).toLocaleDateString('pt-BR') : '—'}</td><td className="px-4 py-3"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{labels[row.status] || row.status}</span>{row.documentSource === 'user_upload' && <div className="mt-1 text-[11px] text-slate-500">Upload sem validação oficial</div>}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><a href={row.portalUrl} target="_blank" rel="noreferrer" title="Abrir portal oficial" className="rounded-lg border p-2 text-slate-600"><ExternalLink size={15} /></a>{row.documentAvailable ? <><button onClick={() => void openDocument(row)} title="Visualizar PDF" className="rounded-lg border p-2"><Eye size={15} /></button><button onClick={() => void openDocument(row, true)} title="Baixar PDF" className="rounded-lg border p-2"><Download size={15} /></button><label title="Substituir PDF" className="cursor-pointer rounded-lg border p-2"><Upload size={15} /><input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => void attachPdf(row.id, event.target.files?.[0])} /></label></> : <label title="Anexar PDF obtido no portal" className="cursor-pointer rounded-lg border p-2"><FileText size={15} /><input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(event) => void attachPdf(row.id, event.target.files?.[0])} /></label>}</div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500"><span>{historyTotal} solicitação(ões)</span><div className="flex gap-2"><button disabled={historyPage <= 1} onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Anterior</button><span className="px-2 py-1.5">Página {historyPage} de {Math.max(1, Math.ceil(historyTotal / 10))}</span><button disabled={historyPage >= Math.ceil(historyTotal / 10)} onClick={() => setHistoryPage((page) => page + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Próxima</button></div></div></>}
      </section>
      {previewUrl && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-3" role="dialog" aria-modal="true" aria-label="Visualização do PDF"><div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white"><div className="flex items-center justify-between border-b p-3"><strong>PDF anexado</strong><button onClick={() => { URL.revokeObjectURL(previewUrl); setPreviewUrl('') }} className="rounded-lg px-3 py-1.5 text-sm">Fechar</button></div><iframe title="Certidão em PDF" src={previewUrl} className="min-h-0 flex-1" /></div></div>}
      <div className="text-xs text-slate-500"><Link to="/kea-store/certidoes">Voltar à lista de emissores</Link></div>
    </div>
  </div>
}
