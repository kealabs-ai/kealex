import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from './Modal'
import { Button, Input, Textarea } from './UI'

export type ClienteFormData = {
  nome: string; email: string; telefone: string; cpfCnpj: string; cep: string
  endereco: string; cidade: string; estado: string; observacoes: string
  rg: string; orgaoExpedidor: string; nacionalidade: string; estadoCivil: string
  profissao: string; dataNascimento: string; razaoSocial: string; nomeFantasia: string
  inscricaoEstadual: string; inscricaoMunicipal: string; representanteLegal: string; whatsapp: string
}

const EMPTY_FORM: ClienteFormData = {
  nome: '', email: '', telefone: '', cpfCnpj: '', cep: '',
  endereco: '', cidade: '', estado: '', observacoes: '', rg: '', orgaoExpedidor: '',
  nacionalidade: '', estadoCivil: '', profissao: '', dataNascimento: '', razaoSocial: '',
  nomeFantasia: '', inscricaoEstadual: '', inscricaoMunicipal: '', representanteLegal: '', whatsapp: '',
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatCpfCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

type ClienteFormModalProps = {
  title: string
  subtitle?: string
  initialData?: Partial<ClienteFormData>
  onClose: () => void
  onSubmit: (data: ClienteFormData) => void
  loading?: boolean
}

export function ClienteFormModal({ title, subtitle, initialData, onClose, onSubmit, loading = false }: ClienteFormModalProps) {
  const formDefaults = Object.fromEntries(
    (Object.keys(EMPTY_FORM) as (keyof ClienteFormData)[]).map((field) => [field, initialData?.[field] ?? '']),
  ) as ClienteFormData
  const { register, handleSubmit, setValue } = useForm<ClienteFormData>({ defaultValues: {
    ...EMPTY_FORM, ...formDefaults,
    telefone: formatPhone(String(initialData?.telefone ?? '')),
    cpfCnpj: formatCpfCnpj(String(initialData?.cpfCnpj ?? '')),
  } })
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  async function handleCepChange(value: string) {
    const cep = formatCep(value)
    setValue('cep', cep, { shouldDirty: true })
    setCepError('')
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      if (!response.ok) throw new Error('Falha na consulta')
      const data = await response.json() as { erro?: boolean; logradouro?: string; localidade?: string; uf?: string }
      if (data.erro) { setCepError('CEP não encontrado.'); return }
      if (data.logradouro) setValue('endereco', data.logradouro, { shouldDirty: true })
      if (data.localidade) setValue('cidade', data.localidade, { shouldDirty: true })
      if (data.uf) setValue('estado', data.uf, { shouldDirty: true })
    } catch {
      setCepError('Não foi possível consultar o CEP. Preencha o endereço manualmente.')
    } finally { setCepLoading(false) }
  }

  const submitNormalized = (data: ClienteFormData) => {
    const normalized = Object.fromEntries(
      (Object.keys(EMPTY_FORM) as (keyof ClienteFormData)[]).map((field) => [field, String(data[field] ?? '')]),
    ) as ClienteFormData
    onSubmit(normalized)
  }

  return <Modal title={title} subtitle={subtitle} onClose={onClose}>
    <form onSubmit={handleSubmit(submitNormalized)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nome" {...register('nome', { required: true })} placeholder="Nome completo" />
        <Input label="Email" {...register('email', { required: true })} type="email" placeholder="email@exemplo.com" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Telefone/WhatsApp" {...register('telefone', { onChange: (event) => setValue('telefone', formatPhone(event.target.value), { shouldDirty: true }) })} placeholder="(11) 99999-9999" inputMode="numeric" />
        <Input label="CPF / CNPJ" {...register('cpfCnpj', { onChange: (event) => setValue('cpfCnpj', formatCpfCnpj(event.target.value), { shouldDirty: true }) })} placeholder="000.000.000-00" inputMode="numeric" />
      </div>
      <Textarea label="Observações" {...register('observacoes')} rows={3} placeholder="Informações adicionais..." />
      <div className="grid grid-cols-2 gap-3">
        <Input label="CEP" {...register('cep', { onChange: (event) => void handleCepChange(event.target.value) })} placeholder="00000-000" inputMode="numeric" />
        <Input label="Estado" {...register('estado')} placeholder="UF" maxLength={2} />
      </div>
      <Input label="Endereço" {...register('endereco')} placeholder="Rua, número..." />
      {cepLoading && <p className="text-xs text-slate-500">Consultando CEP...</p>}
      {cepError && <p role="alert" className="text-xs text-amber-700">{cepError}</p>}
      <Input label="Cidade" {...register('cidade')} placeholder="Cidade" />
      <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Qualificação de pessoa física</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="RG" {...register('rg')} placeholder="Número do RG" />
          <Input label="Órgão expedidor" {...register('orgaoExpedidor')} placeholder="Ex.: SSP/SP" />
          <Input label="Nacionalidade" {...register('nacionalidade')} placeholder="Brasileira" />
          <Input label="Estado civil" {...register('estadoCivil')} placeholder="Estado civil" />
          <Input label="Profissão" {...register('profissao')} placeholder="Profissão" />
          <Input label="Data de nascimento" {...register('dataNascimento')} type="date" />
          <Input label="WhatsApp" {...register('whatsapp')} placeholder="Número de WhatsApp" inputMode="tel" />
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Qualificação de pessoa jurídica</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Razão social" {...register('razaoSocial')} placeholder="Razão social" />
          <Input label="Nome fantasia" {...register('nomeFantasia')} placeholder="Nome fantasia" />
          <Input label="Inscrição estadual" {...register('inscricaoEstadual')} placeholder="Inscrição estadual" />
          <Input label="Inscrição municipal" {...register('inscricaoMunicipal')} placeholder="Inscrição municipal" />
          <Input label="Representante legal" {...register('representanteLegal')} placeholder="Nome do representante" />
        </div>
      </div>
      <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-gray-100 bg-white/95 px-4 pb-2 pt-2 backdrop-blur dark:border-slate-700 dark:bg-slate-800/95 sm:-mx-6 sm:px-6">
        <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit" loading={loading}>Salvar</Button>
      </div>
    </form>
  </Modal>
}
