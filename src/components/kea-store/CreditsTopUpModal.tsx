import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Clipboard, LoaderCircle, QrCode, WalletCards } from 'lucide-react'
import { Modal } from '../Modal'
import { creditPackages } from '../../data/keaStoreServices'
import { keaCreditsApi, KEA_CREDITS_QUERY_KEY, type KeaCreditsRecharge } from '../../api/keaCredits'

interface CreditsTopUpModalProps {
  onClose: () => void
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const newIdempotencyKey = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function CreditsTopUpModal({ onClose }: CreditsTopUpModalProps) {
  const queryClient = useQueryClient()
  const [selectedPackage, setSelectedPackage] = useState<string>(creditPackages[1].id)
  const [recharge, setRecharge] = useState<KeaCreditsRecharge | null>(null)
  const [creating, setCreating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const idempotencyKey = useRef(newIdempotencyKey())
  const rechargeStatusQuery = useQuery({
    queryKey: ['kea-credits', 'recharge', recharge?.id],
    queryFn: () => keaCreditsApi.recharge(recharge!.id),
    enabled: Boolean(recharge?.id && recharge.status === 'PENDING'),
    refetchInterval: (query) => query.state.data?.status === 'PENDING' ? 5_000 : false,
  })
  const currentRecharge = rechargeStatusQuery.data ?? recharge

  useEffect(() => {
    if (currentRecharge?.status === 'RECEIVED') {
      void queryClient.invalidateQueries({ queryKey: KEA_CREDITS_QUERY_KEY })
    }
  }, [currentRecharge?.status, queryClient])

  async function createPixCharge() {
    if (creating) return
    if (currentRecharge && currentRecharge.status !== 'PENDING') {
      idempotencyKey.current = newIdempotencyKey()
      setRecharge(null)
    }
    setCreating(true)
    setErrorMessage('')
    try {
      const created = await keaCreditsApi.createRecharge(selectedPackage, idempotencyKey.current)
      setRecharge(created)
      await queryClient.invalidateQueries({ queryKey: KEA_CREDITS_QUERY_KEY })
    } catch (error) {
      const response = error as { response?: { data?: { detail?: string } } }
      setErrorMessage(response.response?.data?.detail ?? 'Não foi possível gerar o PIX. Tente novamente em instantes.')
    } finally {
      setCreating(false)
    }
  }

  function choosePackage(packageId: string) {
    if (packageId !== selectedPackage) idempotencyKey.current = newIdempotencyKey()
    setSelectedPackage(packageId)
  }

  async function copyPixCode() {
    if (!currentRecharge?.pixCopyPaste) return
    await navigator.clipboard.writeText(currentRecharge.pixCopyPaste)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <Modal title="Recarregar KeaCredits" subtitle="Compra de créditos do escritório via PIX" onClose={onClose} size="md">
      <div className="flex items-center gap-3 rounded-xl border border-[#00C2A8]/25 bg-[#00C2A8]/5 p-3 text-[#102B46] dark:border-[#20B987]/25 dark:bg-[#20B987]/5 dark:text-slate-100">
        <QrCode size={21} className="shrink-0" />
        <p className="text-xs leading-5">Pagamento PIX pelo Asaas. Os créditos entram na carteira após a confirmação do pagamento.</p>
      </div>
      <div className="mt-4 grid gap-2.5">
        {creditPackages.map((option) => {
          const selected = selectedPackage === option.id
          return (
            <button key={option.id} type="button" onClick={() => choosePackage(option.id)} aria-pressed={selected} className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition ${selected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'}`}>
              <span className="flex items-center gap-3">
                <span className={`grid size-5 place-items-center rounded-full border ${selected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{selected && <Check size={13} />}</span>
                <span><span className="block text-sm font-semibold text-slate-900 dark:text-white">{option.name}</span><span className="text-xs text-slate-500 dark:text-slate-400">{option.credits} KeaCredits</span></span>
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{currency.format(option.price)}</span>
            </button>
          )
        })}
      </div>
      {errorMessage && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{errorMessage}</p>}
      {currentRecharge?.pixQrCode && <div className="mt-4 rounded-xl border border-slate-200 p-4 text-center dark:border-slate-700">
        <img className="mx-auto size-48 rounded-lg border border-slate-100 p-2 dark:border-slate-700" src={`data:image/png;base64,${currentRecharge.pixQrCode}`} alt="QR Code PIX para recarga de KeaCredits" />
        <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Aguardando pagamento</p>
        {currentRecharge.pixCopyPaste && <button type="button" onClick={() => void copyPixCode()} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#087E96]/30 px-3 text-xs font-semibold text-[#087E96] hover:bg-[#087E96]/5 dark:border-[#20B987]/30 dark:text-[#20B987]"> <Clipboard size={15} />{copied ? 'Código copiado' : 'Copiar código PIX'}</button>}
      </div>}
      {currentRecharge?.status === 'RECEIVED' && <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">Pagamento confirmado. {currentRecharge.credits} KeaCredits adicionados à carteira.</p>}
      {currentRecharge && ['OVERDUE', 'CANCELLED', 'FAILED'].includes(currentRecharge.status) && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">Esta cobrança não está mais ativa. Gere uma nova cobrança PIX para continuar.</p>}
      <button type="button" onClick={() => void createPixCharge()} disabled={creating || Boolean(currentRecharge?.pixQrCode && currentRecharge.status === 'PENDING')} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#00C2A8] px-4 text-sm font-semibold text-white transition hover:bg-[#00a896] disabled:cursor-not-allowed disabled:opacity-50">
        {creating ? <LoaderCircle size={17} className="animate-spin" /> : <WalletCards size={17} />}
        {creating ? 'Gerando PIX…' : currentRecharge?.pixQrCode && currentRecharge.status === 'PENDING' ? 'PIX gerado' : 'Gerar cobrança PIX'}
      </button>
    </Modal>
  )
}
