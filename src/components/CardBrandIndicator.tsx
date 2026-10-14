import { CreditCard } from 'lucide-react'

type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'diners' | 'discover'

function startsInRange(value: string, min: number, max: number) {
  const prefix = Number(value.slice(0, String(min).length))
  return Number.isFinite(prefix) && prefix >= min && prefix <= max
}

export function detectCardBrand(cardNumber: string): CardBrand | null {
  const digits = cardNumber.replace(/\D/g, '')
  if (!digits) return null

  const eloPrefixes = [
    '401178', '401179', '438935', '451416', '457393', '457631', '457632',
    '504175', '506699', '5067', '509', '627780', '636297', '636368',
    '650031', '650033', '650035', '650036', '650037', '650038', '650039',
    '650040', '650041', '650042', '650043', '650044', '650045', '650046',
    '650047', '650048', '650049', '650050', '650051', '650405', '650406',
    '650407', '650408', '650409', '650410', '650411', '650412', '650413',
    '650414', '650415', '650416', '650417', '650418', '650419', '650420',
    '650421', '650422', '650423', '650424', '650425', '650426', '650427',
    '650428', '650429', '650430', '650431', '650432', '650433', '650434',
    '650435', '650436', '650437', '650438', '650439', '650485', '650486',
    '650487', '650488', '650489', '650490', '650491', '650492', '650493',
    '650494', '650495', '650496', '650497', '650498', '650499', '651652',
    '651653', '651654', '651655', '651656', '651657', '651658', '651659',
    '655000', '655001', '655002', '655003', '655004', '655005', '655006',
    '655007', '655008', '655009',
  ]
  if (eloPrefixes.some((prefix) => digits.startsWith(prefix))) return 'elo'
  if (digits.startsWith('606282') || digits.startsWith('3841')) return 'hipercard'
  if (digits.startsWith('34') || digits.startsWith('37')) return 'amex'
  if (startsInRange(digits, 2221, 2720) || startsInRange(digits, 51, 55)) return 'mastercard'
  if (digits.startsWith('6011') || digits.startsWith('65') || startsInRange(digits, 644, 649)) return 'discover'
  if (startsInRange(digits, 300, 305) || digits.startsWith('36') || digits.startsWith('38')) return 'diners'
  if (digits.startsWith('4')) return 'visa'
  return null
}

export function CardBrandIndicator({ number }: { number: string }) {
  const brand = detectCardBrand(number)
  if (!brand) return <CreditCard size={16} aria-hidden="true" className="text-slate-400" />

  if (brand === 'mastercard') {
    return (
      <svg aria-label="Mastercard" role="img" viewBox="0 0 32 22" className="h-[18px] w-7">
        <circle cx="12" cy="11" r="9" fill="#EB001B" />
        <circle cx="20" cy="11" r="9" fill="#F79E1B" fillOpacity=".95" />
      </svg>
    )
  }

  const styles: Record<Exclude<CardBrand, 'mastercard'>, string> = {
    visa: 'font-black italic text-blue-800',
    amex: 'rounded bg-blue-700 px-0.5 py-1 text-[7px] font-extrabold leading-none text-white',
    elo: 'font-black italic text-slate-800',
    hipercard: 'font-black italic text-red-600',
    diners: 'font-black italic text-blue-600',
    discover: 'font-black italic text-orange-600',
  }
  const labels: Record<Exclude<CardBrand, 'mastercard'>, string> = {
    visa: 'VISA', amex: 'AMEX', elo: 'elo', hipercard: 'hiper', diners: 'DINERS', discover: 'DISC',
  }

  return <span role="img" aria-label={brand} className={`inline-flex h-[18px] min-w-7 items-center justify-center text-[10px] ${styles[brand]}`}>{labels[brand]}</span>
}
