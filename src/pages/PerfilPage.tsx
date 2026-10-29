import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, CalendarDays, Camera, ChevronLeft, ChevronRight, CreditCard, History, KeyRound, LoaderCircle, Mail, Pencil, Plus, Save, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { TopBar } from '../components/TopBar'
import { AssinaturaModal } from '../components/AssinaturaModal'
import { Modal } from '../components/Modal'
import { assinaturaApi, PLANOS_CONFIG, type BillingProfile } from '../api/assinatura'
import { usuariosApi } from '../api/usuarios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { PROFILE_AVATARS, ProfileAvatar } from '../components/ProfileAvatar'

export function PerfilPage() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const { success: toastSuccess, error: toastError } = useToast()
  const [nome, setNome] = useState(user?.nome ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [orgao, setOrgao] = useState('Tribunais Superiores')
  const [chavePublica, setChavePublica] = useState('')
  const [publicKeySearch, setPublicKeySearch] = useState('')
  const [publicKeyPage, setPublicKeyPage] = useState(1)
  const [editingPublicKeyId, setEditingPublicKeyId] = useState<string | null>(null)
  const [publicKeyModalOpen, setPublicKeyModalOpen] = useState(false)
  const [tenantForm, setTenantForm] = useState<BillingProfile | null>(null)
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const { data: billingStatus, isLoading: loadingBilling } = useQuery({
    queryKey: ['billing-status'],
    queryFn: assinaturaApi.billingStatus,
    enabled: Boolean(user),
  })
  const { data: tenantProfile, isLoading: loadingTenantProfile, isError: tenantProfileError } = useQuery({
    queryKey: ['billing-profile', user?.tenantId],
    queryFn: assinaturaApi.billingProfile,
    enabled: Boolean(user),
    staleTime: 5 * 60 * 1000,
  })
  const { data: publicKeys = [], isLoading: loadingPublicKeys } = useQuery({
    queryKey: ['public-keys', user?.id],
    queryFn: usuariosApi.listarChavesPublicas,
    enabled: Boolean(user),
  })

  useEffect(() => {
    setNome(user?.nome ?? '')
    setEmail(user?.email ?? '')
  }, [user?.nome, user?.email])

  useEffect(() => {
    if (tenantProfile) setTenantForm(tenantProfile)
  }, [tenantProfile])

  const profileMutation = useMutation({
    mutationFn: () => usuariosApi.update(user!.id, { nome: nome.trim(), email: email.trim() }),
    onSuccess: (updated) => {
      updateUser({ nome: updated.nome, email: updated.email })
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      toastSuccess('Dados do perfil atualizados.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'Não foi possível atualizar os dados do perfil.')
    },
  })

  const tenantMutation = useMutation({
    mutationFn: () => assinaturaApi.updateBillingProfile(tenantForm!),
    onSuccess: (updated) => {
      queryClient.setQueryData(['billing-profile', user?.tenantId], updated)
      setTenantForm(updated)
      toastSuccess('Dados do tenant atualizados.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'Não foi possível atualizar os dados do tenant.')
    },
  })

  const publicKeyMutation = useMutation({
    mutationFn: () => {
      const data = { orgao, chavePublica: chavePublica.trim() }
      return editingPublicKeyId
        ? usuariosApi.atualizarChavePublica(editingPublicKeyId, data)
        : usuariosApi.salvarChavePublica(data)
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['public-keys', user?.id] })
      setPublicKeyModalOpen(false)
      setChavePublica('')
      setEditingPublicKeyId(null)
      toastSuccess(`Chave pública de ${saved.orgao} ${editingPublicKeyId ? 'atualizada' : 'adicionada'}.`)
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'Não foi possível salvar a chave pública.')
    },
  })

  const removePublicKeyMutation = useMutation({
    mutationFn: usuariosApi.removerChavePublica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-keys', user?.id] })
      toastSuccess('Chave pública removida.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'Não foi possível remover a chave pública.')
    },
  })

  function openPublicKeyModal(item?: (typeof publicKeys)[number]) {
    setEditingPublicKeyId(item?.id ?? null)
    setOrgao(item?.orgao ?? 'Tribunais Superiores')
    setChavePublica(item?.chavePublica ?? '')
    setPublicKeyModalOpen(true)
  }

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!nome.trim() || !email.trim()) {
      toastError('Informe seu nome e e-mail.')
      return
    }
    profileMutation.mutate()
  }

  function handleTenantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tenantForm) return
    tenantMutation.mutate()
  }

  function updateTenantField(field: keyof BillingProfile, value: string) {
    setTenantForm((current) => current ? { ...current, [field]: value } : current)
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toastError('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError('A foto deve ter no máximo 5 MB.')
      return
    }

    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
        reader.onload = () => {
          const image = new Image()
          image.onerror = () => reject(new Error('O arquivo selecionado não é uma imagem válida.'))
          image.onload = () => {
            const size = 256
            const side = Math.min(image.naturalWidth, image.naturalHeight)
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size
            const context = canvas.getContext('2d')
            if (!context) {
              reject(new Error('Não foi possível processar a imagem.'))
              return
            }
            context.drawImage(
              image,
              (image.naturalWidth - side) / 2,
              (image.naturalHeight - side) / 2,
              side,
              side,
              0,
              0,
              size,
              size,
            )
            resolve(canvas.toDataURL('image/jpeg', 0.82))
          }
          image.src = String(reader.result)
        }
        reader.readAsDataURL(file)
      })
      updateUser({ avatarUrl, avatarId: undefined })
      toastSuccess('Foto do perfil atualizada neste dispositivo.')
    } catch (error) {
      toastError(error instanceof Error ? error.message : 'Não foi possível atualizar a foto.')
    }
  }

  function selectAvatar(avatarId?: string) {
    updateUser({ avatarUrl: undefined, avatarId })
    toastSuccess('Avatar do perfil atualizado.')
  }

  const currentPlan = billingStatus?.plano
    ? PLANOS_CONFIG.find((plan) => plan.id === billingStatus.plano)
    : undefined
  const nextDueDate = billingStatus?.nextDueDate
  const formattedDueDate = nextDueDate
    ? (() => {
        const [year, month, day] = nextDueDate.slice(0, 10).split('-').map(Number)
        return Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)
          ? new Date(year, month - 1, day).toLocaleDateString('pt-BR')
          : null
      })()
    : null
  const normalizedPublicKeySearch = publicKeySearch.trim().toLocaleLowerCase('pt-BR')
  const filteredPublicKeys = publicKeys.filter((item) =>
    `${item.orgao} ${item.chavePublica}`.toLocaleLowerCase('pt-BR').includes(normalizedPublicKeySearch),
  )
  const publicKeysPerPage = 5
  const publicKeyPageCount = Math.max(1, Math.ceil(filteredPublicKeys.length / publicKeysPerPage))
  const currentPublicKeyPage = Math.min(publicKeyPage, publicKeyPageCount)
  const visiblePublicKeys = filteredPublicKeys.slice(
    (currentPublicKeyPage - 1) * publicKeysPerPage,
    currentPublicKeyPage * publicKeysPerPage,
  )

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <TopBar icon={UserRound} title="Edição do perfil" subtitle="Gerencie seus dados e sua assinatura" />
      <div className="flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProfileAvatar user={user} className="h-20 w-20 rounded-2xl text-2xl" iconSize={34} />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Foto do perfil</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Envie uma foto ou escolha um avatar jurídico.</p>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  aria-label="Selecionar foto do perfil"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25"
                >
                  <Camera size={16} /> Enviar foto
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Escolher avatar jurídico">
              <button
                type="button"
                onClick={() => selectAvatar()}
                aria-label="Usar iniciais do nome"
                aria-pressed={!user?.avatarUrl && !user?.avatarId}
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#087E96] text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25 ${!user?.avatarUrl && !user?.avatarId ? 'ring-2 ring-[#087E96] ring-offset-2 dark:ring-offset-[#111827]' : 'opacity-70 hover:opacity-100'}`}
              >
                {user?.nome?.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? '?'}
              </button>
              {PROFILE_AVATARS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectAvatar(id)}
                  aria-label={`Usar avatar: ${label}`}
                  aria-pressed={!user?.avatarUrl && user?.avatarId === id}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[#087E96] text-white transition-opacity focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25 ${!user?.avatarUrl && user?.avatarId === id ? 'ring-2 ring-[#087E96] ring-offset-2 dark:ring-offset-[#111827]' : 'opacity-70 hover:opacity-100'}`}
                >
                  <Icon size={21} />
                </button>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#087E96]/20 dark:text-[#20B987]">
                <KeyRound size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Chaves públicas de integração</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Cadastre a chave pública que será utilizada nas integrações com cada órgão.</p>
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full sm:max-w-md">
                <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="search"
                  value={publicKeySearch}
                  onChange={(event) => { setPublicKeySearch(event.target.value); setPublicKeyPage(1) }}
                  placeholder="Buscar por órgão ou chave pública"
                  aria-label="Buscar chaves públicas por órgão ou chave"
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#1E293B] outline-none transition focus:border-[#087E96] focus:ring-2 focus:ring-[#087E96]/20 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <button type="button" onClick={() => openPublicKeyModal()} className="inline-flex items-center gap-2 rounded-xl bg-[#102B46] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25">
                <Plus size={16} /> Adicionar chave
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#F5F8FC] text-xs uppercase tracking-wide text-[#64748B] dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Órgão</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Chave Pública</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/10">
                  {loadingPublicKeys ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Carregando chaves cadastradas…</td></tr>
                  ) : publicKeys.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Nenhuma chave pública cadastrada.</td></tr>
                  ) : filteredPublicKeys.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Nenhuma chave corresponde à busca.</td></tr>
                  ) : visiblePublicKeys.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-[#111827]">
                      <td className="px-4 py-3 font-semibold text-[#1E293B] dark:text-slate-200">{item.orgao}</td>
                      <td className="max-w-xl break-all px-4 py-3 font-mono text-xs text-[#64748B] dark:text-slate-400">{item.chavePublica}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openPublicKeyModal(item)} aria-label={`Editar chave de ${item.orgao}`} className="rounded-lg p-2 text-[#087E96] transition-colors hover:bg-[#087E96]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087E96]/40">
                            <Pencil size={16} />
                          </button>
                          <button type="button" onClick={() => { if (window.confirm(`Remover a chave pública de ${item.orgao}?`)) removePublicKeyMutation.mutate(item.id) }} disabled={removePublicKeyMutation.isPending} aria-label={`Remover chave de ${item.orgao}`} className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50 dark:hover:bg-rose-950/30">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loadingPublicKeys && filteredPublicKeys.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 text-sm text-[#64748B] dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite">
                  Exibindo {(currentPublicKeyPage - 1) * publicKeysPerPage + 1}–{Math.min(currentPublicKeyPage * publicKeysPerPage, filteredPublicKeys.length)} de {filteredPublicKeys.length} {filteredPublicKeys.length === 1 ? 'chave' : 'chaves'}
                </p>
                <nav aria-label="Paginação das chaves públicas" className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPublicKeyPage((page) => Math.max(1, page - 1))}
                    disabled={currentPublicKeyPage === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 font-medium text-[#1E293B] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <ChevronLeft size={16} /> Anterior
                  </button>
                  <span className="min-w-20 text-center" aria-current="page">{currentPublicKeyPage} / {publicKeyPageCount}</span>
                  <button
                    type="button"
                    onClick={() => setPublicKeyPage((page) => Math.min(publicKeyPageCount, page + 1))}
                    disabled={currentPublicKeyPage >= publicKeyPageCount}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#E2E8F0] px-3 py-2 font-medium text-[#1E293B] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Próxima <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#087E96]/20 dark:text-[#20B987]">
                <UserRound size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Dados pessoais</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Atualize as informações da sua conta.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Nome</span>
                  <div className="flex items-center gap-3 rounded-xl bg-[#F5F8FC] px-4 py-3 transition-colors focus-within:bg-[#E2E8F0] dark:bg-[#F5F8FC] dark:focus-within:bg-[#E2E8F0]">
                    <UserRound size={16} className="shrink-0 text-[#64748B]" />
                    <input
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      autoComplete="name"
                      required
                      className="profile-text-input min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1E293B] outline-none"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">E-mail</span>
                  <div className="flex items-center gap-3 rounded-xl bg-[#F5F8FC] px-4 py-3 transition-colors focus-within:bg-[#E2E8F0] dark:bg-[#F5F8FC] dark:focus-within:bg-[#E2E8F0]">
                    <Mail size={16} className="shrink-0 text-[#64748B]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="profile-text-input min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1E293B] outline-none"
                    />
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                  <ShieldCheck size={15} className="text-[#087E96] dark:text-[#20B987]" />
                  Alterações salvas na sua conta
                </div>
                <button
                  type="submit"
                  disabled={profileMutation.isPending || (nome === user?.nome && email === user?.email)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B46] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {profileMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar alterações
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#087E96]/20 dark:text-[#20B987]">
                <Building2 size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Dados do tenant</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Informações cadastrais vinculadas à conta e à cobrança.</p>
              </div>
            </div>

            {loadingTenantProfile ? (
              <div className="flex items-center gap-2 py-2 text-sm text-[#64748B] dark:text-slate-400" role="status">
                <LoaderCircle size={16} className="animate-spin" /> Carregando dados do tenant…</div>
            ) : tenantProfileError ? (
              <p className="text-sm text-[#64748B] dark:text-slate-400" role="alert">Não foi possível carregar os dados cadastrais do tenant.</p>
            ) : tenantForm ? (
              <form onSubmit={handleTenantSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TenantField label="Titular / organização" value={tenantForm.name} onChange={(value) => updateTenantField('name', value)} />
                  <TenantField label="E-mail de cobrança" type="email" value={tenantForm.email} onChange={(value) => updateTenantField('email', value)} />
                  <TenantField
                    label="CPF / CNPJ"
                    value={tenantForm.billing_cpf_cnpj || tenantForm.cpfCnpj}
                    onChange={(value) => setTenantForm((current) => current ? { ...current, cpfCnpj: value, billing_cpf_cnpj: value } : current)}
                  />
                  <TenantField
                    label="Telefone"
                    value={tenantForm.mobilePhone || tenantForm.phone}
                    onChange={(value) => setTenantForm((current) => current ? { ...current, phone: value, mobilePhone: value } : current)}
                  />
                  <TenantField label="CEP" value={tenantForm.postalCode} onChange={(value) => updateTenantField('postalCode', value)} />
                  <TenantField label="Endereço" value={tenantForm.address} onChange={(value) => updateTenantField('address', value)} />
                  <TenantField label="Número" value={tenantForm.addressNumber} onChange={(value) => updateTenantField('addressNumber', value)} />
                  <TenantField label="Complemento" value={tenantForm.addressComplement} onChange={(value) => updateTenantField('addressComplement', value)} />
                  <TenantField label="Bairro" value={tenantForm.neighborhood} onChange={(value) => updateTenantField('neighborhood', value)} />
                  <TenantField label="Cidade" value={tenantForm.city} onChange={(value) => updateTenantField('city', value)} />
                  <TenantField label="Estado" value={tenantForm.state} onChange={(value) => updateTenantField('state', value)} />
                  <div>
                    <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">ID do tenant</span>
                    <p className="rounded-xl bg-[#F5F8FC] px-4 py-3 text-sm text-[#64748B] dark:bg-slate-900 dark:text-slate-400" aria-readonly="true">{user?.tenantId ?? '—'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                    <ShieldCheck size={15} className="text-[#087E96] dark:text-[#20B987]" />
                    O ID do tenant não pode ser alterado
                  </div>
                  <button
                    type="submit"
                    disabled={tenantMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#102B46] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/25 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tenantMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                    Salvar dados do tenant
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[#64748B] dark:text-slate-400">Ainda não há dados cadastrais de cobrança para este tenant.</p>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:p-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#20B987]/10 text-[#16835F] dark:bg-[#20B987]/15 dark:text-[#20B987]">
                  <CreditCard size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Plano e assinatura</h2>
                  {loadingBilling ? (
                    <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Carregando informações da assinatura…</p>
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-[#64748B] dark:text-slate-400">
                      <p>Plano atual: <strong className="font-semibold text-[#1E293B] dark:text-slate-200">{currentPlan?.nome ?? (billingStatus?.status === 'trial' ? 'Período de teste' : billingStatus?.plano ?? 'Sem plano ativo')}</strong></p>
                      {formattedDueDate && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays size={14} /> Próxima renovação: {formattedDueDate}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanModalOpen(true)}
                className="shrink-0 rounded-xl border border-[#087E96] px-4 py-2.5 text-sm font-semibold text-[#087E96] transition-colors hover:bg-[#087E96]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/20 dark:border-[#20B987] dark:text-[#20B987] dark:hover:bg-[#20B987]/10"
              >
                Ajustar plano
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-[#111827] sm:flex-row sm:items-center sm:p-8"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087E96]/10 text-[#087E96] dark:bg-[#087E96]/20 dark:text-[#20B987]">
                <History size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Versão do Kealex</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Versão atual: V. 1.3.0</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReleaseNotesOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#087E96] px-4 py-2.5 text-sm font-semibold text-[#087E96] transition-colors hover:bg-[#087E96]/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#087E96]/20 dark:border-[#20B987] dark:text-[#20B987] dark:hover:bg-[#20B987]/10"
            >
              <History size={16} /> Notas da versão
            </button>
          </motion.section>
        </div>
      </div>
      {publicKeyModalOpen && (
        <Modal
          title={editingPublicKeyId ? 'Editar chave pública' : 'Adicionar chave pública'}
          subtitle="Informe o órgão e a chave usada na integração."
          onClose={() => setPublicKeyModalOpen(false)}
          size="md"
        >
          <form onSubmit={(event) => {
            event.preventDefault()
            if (publicKeys.some((item) => item.orgao === orgao && item.id !== editingPublicKeyId)) {
              toastError('Já existe uma chave cadastrada para este órgão.')
              return
            }
            if (chavePublica.trim()) publicKeyMutation.mutate()
          }} className="space-y-4 p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Órgão</span>
              <select value={orgao} onChange={(event) => setOrgao(event.target.value)} required className="w-full rounded-xl bg-[#F5F8FC] px-4 py-3 text-sm font-medium text-[#1E293B] outline-none focus:ring-2 focus:ring-[#087E96]/30">
                {['Tribunais Superiores', 'Justiça Federal', 'Justiça Estadual', 'Justiça do Trabalho', 'Justiça Eleitoral', 'Justiça Militar'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Chave Pública</span>
              <textarea value={chavePublica} onChange={(event) => setChavePublica(event.target.value)} rows={5} required maxLength={10000} placeholder="Cole a chave pública do órgão" className="w-full resize-y rounded-xl bg-[#F5F8FC] px-4 py-3 font-mono text-sm text-[#1E293B] outline-none placeholder:font-sans placeholder:text-slate-400 focus:ring-2 focus:ring-[#087E96]/30" />
            </label>
            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4 dark:border-white/10">
              <button type="button" onClick={() => setPublicKeyModalOpen(false)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</button>
              <button type="submit" disabled={!chavePublica.trim() || publicKeyMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-[#102B46] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B2035] disabled:cursor-not-allowed disabled:opacity-50">
                {publicKeyMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                {editingPublicKeyId ? 'Salvar edição' : 'Adicionar chave'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      <AssinaturaModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} />
      {releaseNotesOpen && (
        <Modal
          title="Notas da versão"
          subtitle="Kealex — V. 1.3.0 · 29/10/2026"
          onClose={() => setReleaseNotesOpen(false)}
          size="md"
        >
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Novos recursos de IA e melhorias no chat.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Usuários podem cadastrar e gerenciar chaves pessoais de IA, separadas por provedor e modelo; os segredos ficam criptografados no backend.</li>
              <li>Agentes aceitam modelos de OpenAI, Anthropic, Google, Groq, Cerebras e DeepSeek, com validação de compatibilidade e atualização da lista pela chave informada.</li>
              <li>O chat usa o modelo configurado no agente e apresenta uma mensagem específica quando o acesso ao Groq é bloqueado pelo Cloudflare.</li>
              <li>Áreas de processos, clientes, documentos, prazos e atividades.</li>
              <li>Gestão financeira, cobranças, usuários, audiências e intimações.</li>
              <li>Administração, perfil do usuário e recursos de inteligência artificial.</li>
              <li>Timeline processual integrada à seção “Fase atual”, com avanço de fase conforme as permissões do usuário.</li>
              <li>Páginas públicas de apresentação, assinatura, termos de uso e privacidade.</li>
            </ul>
          </div>
        </Modal>
      )}
    </div>
  )
}

function TenantField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="profile-text-input w-full rounded-xl bg-[#F5F8FC] px-4 py-3 text-sm font-medium text-[#1E293B] outline-none transition-colors focus:bg-[#E2E8F0] dark:bg-[#F5F8FC] dark:focus:bg-[#E2E8F0]"
      />
    </label>
  )
}
