import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, CalendarDays, Camera, ChevronLeft, ChevronRight, CircleHelp, CreditCard, HardDrive, History, KeyRound, LoaderCircle, Mail, Pencil, Plus, Save, Search, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { motion } from 'framer-motion'
import { TopBar } from '../components/TopBar'
import { AssinaturaModal } from '../components/AssinaturaModal'
import { Modal } from '../components/Modal'
import { assinaturaApi, PLANOS_CONFIG, type BillingProfile } from '../api/assinatura'
import { usuariosApi } from '../api/usuarios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { PROFILE_AVATARS, ProfileAvatar } from '../components/ProfileAvatar'
import { analiseDocumentosApi } from '../api/analiseDocumentos'

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
  const [driveOAuthCredentials, setDriveOAuthCredentials] = useState({ clientId: '', clientSecret: '', refreshToken: '' })
  const [driveFolderId, setDriveFolderId] = useState('')
  const [driveSettingsEditing, setDriveSettingsEditing] = useState(false)
  const [driveTokenHelpOpen, setDriveTokenHelpOpen] = useState(false)
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
  const { data: driveConfig, isLoading: loadingDriveConfig } = useQuery({
    queryKey: ['google-drive-config', user?.id],
    queryFn: analiseDocumentosApi.getGoogleDriveConfig,
    enabled: user?.role === 'advogado',
  })
  const { data: driveOAuthConnection } = useQuery({
    queryKey: ['google-drive-oauth-connection', user?.id],
    queryFn: analiseDocumentosApi.getGoogleDriveOAuthConnection,
    enabled: user?.role === 'advogado',
  })
  const startGoogleDriveOAuthMutation = useMutation({
    mutationFn: analiseDocumentosApi.startGoogleDriveOAuth,
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
    onError: (err: any) => toastError(err.response?.data?.detail ?? 'Não foi possível iniciar a conexão com o Google.'),
  })
  const startGoogleDriveUploadOAuthMutation = useMutation({
    mutationFn: analiseDocumentosApi.startGoogleDriveUploadOAuth,
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
    onError: (err: any) => {
      sessionStorage.removeItem('google_drive_upload_oauth_credentials')
      toastError(err.response?.data?.detail ?? 'Não foi possível iniciar a autorização para gerar as credenciais.')
    },
  })
  const completeGoogleDriveUploadOAuthMutation = useMutation({
    mutationFn: analiseDocumentosApi.completeGoogleDriveUploadOAuth,
    onSuccess: (credentials) => {
      sessionStorage.removeItem('google_drive_upload_oauth_credentials')
      setDriveOAuthCredentials({ clientId: credentials.client_id, clientSecret: credentials.client_secret, refreshToken: credentials.refresh_token })
      setDriveSettingsEditing(true)
      toastSuccess('Token gerado. Revise as credenciais e salve a configuração do Google Drive.')
    },
    onError: (err: any) => {
      sessionStorage.removeItem('google_drive_upload_oauth_credentials')
      toastError(err.response?.data?.detail ?? 'Não foi possível gerar o token do Google Drive.')
    },
  })
  const completeGoogleDriveOAuthMutation = useMutation({
    mutationFn: analiseDocumentosApi.completeGoogleDriveOAuth,
    onSuccess: (connection) => {
      queryClient.setQueryData(['google-drive-oauth-connection', user?.id], {
        ...connection,
        updatedAt: new Date().toISOString(),
      })
      toastSuccess(connection.email ? `Google Drive conectado: ${connection.email}` : 'Google Drive conectado com sucesso.')
    },
    onError: (err: any) => toastError(err.response?.data?.detail ?? 'Não foi possível concluir a conexão com o Google Drive.'),
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('google_drive_oauth_code')
    const state = params.get('google_drive_oauth_state')
    const oauthType = params.get('google_drive_oauth_type')
    const wasCancelled = params.has('google_drive_oauth_error')
    if (!code && !state && !wasCancelled) return
    if (code && state) {
      if (oauthType === 'upload') {
        try {
          const credentials = JSON.parse(sessionStorage.getItem('google_drive_upload_oauth_credentials') ?? '{}')
          if (!credentials.client_id || !credentials.client_secret) throw new Error('Credenciais OAuth ausentes nesta sessão.')
          completeGoogleDriveUploadOAuthMutation.mutate({ code, state, client_id: credentials.client_id, client_secret: credentials.client_secret })
        } catch (error) {
          sessionStorage.removeItem('google_drive_upload_oauth_credentials')
          toastError(error instanceof Error ? error.message : 'Não foi possível recuperar as credenciais OAuth desta sessão.')
        }
      } else completeGoogleDriveOAuthMutation.mutate({ code, state })
    } else {
      sessionStorage.removeItem('google_drive_upload_oauth_credentials')
      toastError('Não foi possível conectar ao Google Drive. Tente novamente.')
    }
    params.delete('google_drive_oauth_code')
    params.delete('google_drive_oauth_state')
    params.delete('google_drive_oauth_type')
    params.delete('google_drive_oauth_error')
    const query = params.toString()
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`)
  }, [completeGoogleDriveOAuthMutation, completeGoogleDriveUploadOAuthMutation, toastError])

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
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel atualizar os dados do perfil.')
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
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel atualizar os dados do tenant.')
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
      toastSuccess(`Chave pÃºblica de ${saved.orgao} ${editingPublicKeyId ? 'atualizada' : 'adicionada'}.`)
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel salvar a chave pÃºblica.')
    },
  })

  const removePublicKeyMutation = useMutation({
    mutationFn: usuariosApi.removerChavePublica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-keys', user?.id] })
      toastSuccess('Chave pÃºblica removida.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel remover a chave pÃºblica.')
    },
  })

  const hasDriveOAuthCredentials = Boolean(
    driveOAuthCredentials.clientId.trim() &&
    driveOAuthCredentials.clientSecret.trim() &&
    driveOAuthCredentials.refreshToken.trim(),
  )
  const hasPartialDriveOAuthCredentials = Object.values(driveOAuthCredentials).some((value) => value.trim()) && !hasDriveOAuthCredentials

  const googleDriveMutation = useMutation({
    mutationFn: () => analiseDocumentosApi.saveGoogleDriveConfig({
      ...(hasDriveOAuthCredentials ? {
        credential_json: JSON.stringify({
          type: 'authorized_user',
          client_id: driveOAuthCredentials.clientId.trim(),
          client_secret: driveOAuthCredentials.clientSecret.trim(),
          refresh_token: driveOAuthCredentials.refreshToken.trim(),
        }),
      } : {}),
      drive_folder_id: driveFolderId.trim(),
    }),
    onSuccess: (saved) => {
      queryClient.setQueryData(['google-drive-config', user?.id], saved)
      setDriveOAuthCredentials({ clientId: '', clientSecret: '', refreshToken: '' })
      setDriveFolderId(saved.driveFolderId ?? '')
      setDriveSettingsEditing(false)
      toastSuccess('ConfiguraÃ§Ã£o do Google Drive salva com seguranÃ§a.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel salvar a configuraÃ§Ã£o do Google Drive.')
    },
  })

  const testGoogleDriveMutation = useMutation({
    mutationFn: analiseDocumentosApi.testGoogleDriveConfig,
    onSuccess: (result) => {
      toastSuccess(result.email ? `ConexÃ£o com Google Drive validada: ${result.email}` : 'ConexÃ£o com Google Drive validada.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel validar a conexÃ£o com o Google Drive.')
    },
  })

  const removeGoogleDriveMutation = useMutation({
    mutationFn: analiseDocumentosApi.removeGoogleDriveConfig,
    onSuccess: () => {
      queryClient.setQueryData(['google-drive-config', user?.id], {
        configurado: false,
        tipo: null,
        driveFolderId: null,
        updatedAt: null,
      })
      setDriveOAuthCredentials({ clientId: '', clientSecret: '', refreshToken: '' })
      setDriveFolderId('')
      toastSuccess('Google Drive desconectado.')
    },
    onError: (err: any) => {
      toastError(err.response?.data?.detail ?? 'NÃ£o foi possÃ­vel desconectar o Google Drive.')
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
      toastError('A foto deve ter no mÃ¡ximo 5 MB.')
      return
    }

    try {
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('NÃ£o foi possÃ­vel ler a imagem.'))
        reader.onload = () => {
          const image = new Image()
          image.onerror = () => reject(new Error('O arquivo selecionado nÃ£o Ã© uma imagem vÃ¡lida.'))
          image.onload = () => {
            const size = 256
            const side = Math.min(image.naturalWidth, image.naturalHeight)
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size
            const context = canvas.getContext('2d')
            if (!context) {
              reject(new Error('NÃ£o foi possÃ­vel processar a imagem.'))
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
      toastError(error instanceof Error ? error.message : 'NÃ£o foi possÃ­vel atualizar a foto.')
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
    <div className="profile-page flex min-h-screen flex-col bg-slate-50 text-[#1E293B] dark:bg-slate-950 dark:text-slate-100">
      <TopBar icon={UserRound} title="EdiÃ§Ã£o do perfil" subtitle="Gerencie seus dados e sua assinatura" />
      <div className="flex-1 overflow-y-auto p-5 sm:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <ProfileAvatar user={user} className="h-20 w-20 rounded-2xl text-2xl" iconSize={34} />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Foto do perfil</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Envie uma foto ou escolha um avatar jurÃ­dico.</p>
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
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20"
                >
                  <Camera size={16} /> Enviar foto
                </button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3" role="group" aria-label="Escolher avatar jurÃ­dico">
              <button
                type="button"
                onClick={() => selectAvatar()}
                aria-label="Usar iniciais do nome"
                aria-pressed={!user?.avatarUrl && !user?.avatarId}
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${!user?.avatarUrl && !user?.avatarId ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800' : 'opacity-70 hover:opacity-100'}`}
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
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white transition-opacity focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 ${!user?.avatarUrl && user?.avatarId === id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800' : 'opacity-70 hover:opacity-100'}`}
                >
                  <Icon size={21} />
                </button>
              ))}
            </div>
          </motion.section>

          {user?.role === 'advogado' && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
            >
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <HardDrive size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Google Drive â€” anÃ¡lise documental</h2>
                  <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">
                    Conecte sua conta para consultar arquivos do Drive em modo somente leitura. O token fica criptografado no servidor. O envio de arquivos do chat usa a configuraÃ§Ã£o separada abaixo.
                  </p>
                </div>
              </div>

              {loadingDriveConfig ? (
                <div className="flex items-center gap-2 py-2 text-sm text-[#64748B] dark:text-slate-400" role="status">
                  <LoaderCircle size={16} className="animate-spin" /> Carregando configuraÃ§Ã£o do Google Driveâ€¦
                </div>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    googleDriveMutation.mutate()
                  }}
                  className="space-y-4"
                >
                  <div className={`rounded-xl border px-4 py-3 text-sm ${driveOAuthConnection?.connected ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200'}`}>
                    {driveOAuthConnection?.connected
                      ? `Acesso de leitura conectado${driveOAuthConnection.email ? ` como ${driveOAuthConnection.email}` : ''}.`
                      : 'Conecte uma conta Google para consultar documentos do Drive.'}
                  </div>

                  <button
                    type="button"
                    onClick={() => startGoogleDriveOAuthMutation.mutate()}
                    disabled={startGoogleDriveOAuthMutation.isPending}
                    className="inline-flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                  >
                    {startGoogleDriveOAuthMutation.isPending
                      ? <LoaderCircle size={18} className="animate-spin" />
                      : <span aria-hidden="true" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">G</span>}
                    {startGoogleDriveOAuthMutation.isPending ? 'Abrindo autorizaÃ§Ã£o do Googleâ€¦' : driveOAuthConnection?.connected ? 'Reconectar conta Google' : 'Conectar com Google'}
                  </button>
                  <p className="-mt-2 text-xs text-[#64748B] dark:text-slate-400">
                    A permissÃ£o solicitada Ã© somente leitura (`drive.readonly`). O Google solicitarÃ¡ sua confirmaÃ§Ã£o.
                  </p>

                  <label className="block">
                    <span className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1E293B] dark:text-slate-200">
                      Credenciais para upload ao Google Drive {driveConfig?.configurado ? '(deixe em branco para manter as atuais)' : '(opcional para consultas em modo leitura)'}
                      <button type="button" onClick={() => setDriveTokenHelpOpen(true)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-950/40">
                        <CircleHelp size={15} /> Como gerar o token?
                      </button>
                    </span>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                          <tr><th className="w-1/3 px-4 py-3 font-semibold">Campo</th><th className="px-4 py-3 font-semibold">Valor</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {([
                            ['clientId', 'Client ID', 'ID do cliente OAuth'],
                            ['clientSecret', 'Client Secret', 'Segredo do cliente OAuth'],
                            ['refreshToken', 'Refresh Token', 'Token de atualizaÃ§Ã£o OAuth'],
                          ] as const).map(([key, label, placeholder]) => (
                            <tr key={key}>
                              <th scope="row" className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</th>
                              <td className="px-3 py-2">
                                <input
                                  type="password"
                                  value={driveOAuthCredentials[key]}
                                  onChange={(event) => setDriveOAuthCredentials((current) => ({ ...current, [key]: event.target.value }))}
                                  disabled={googleDriveMutation.isPending || (driveConfig?.configurado && !driveSettingsEditing)}
                                  autoComplete="new-password"
                                  spellCheck={false}
                                  placeholder={placeholder}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                />
                                {key === 'refreshToken' && (
                                  <div className="mt-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const credentials = { client_id: driveOAuthCredentials.clientId.trim(), client_secret: driveOAuthCredentials.clientSecret.trim() }
                                        if (!credentials.client_id || !credentials.client_secret) { toastError('Preencha o Client ID e o Client Secret antes de gerar o token.'); return }
                                        sessionStorage.setItem('google_drive_upload_oauth_credentials', JSON.stringify(credentials))
                                        startGoogleDriveUploadOAuthMutation.mutate(credentials)
                                      }}
                                      disabled={startGoogleDriveUploadOAuthMutation.isPending || (driveConfig?.configurado && !driveSettingsEditing)}
                                      className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-wait disabled:opacity-60 dark:border-indigo-500/30 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                                    >
                                      {startGoogleDriveUploadOAuthMutation.isPending && <LoaderCircle size={14} className="animate-spin" />}
                                      Gerar token com Google
                                    </button>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Autorize o acesso solicitado pelo Google; o token serÃ¡ preenchido aqui para vocÃª salvar.</p>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {hasPartialDriveOAuthCredentials && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Preencha os trÃªs campos para salvar as credenciais OAuth.</p>}
                    <span className="mt-1 block text-xs text-[#64748B] dark:text-slate-400">
                      Informe o Client ID e o Client Secret do seu projeto Google Cloud; o token serÃ¡ gerado apÃ³s sua autorizaÃ§Ã£o.
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">ID da pasta no Drive (opcional)</span>
                    <input
                      value={driveFolderId}
                      onChange={(event) => setDriveFolderId(event.target.value)}
                      disabled={googleDriveMutation.isPending || (driveConfig?.configurado && !driveSettingsEditing)}
                      autoComplete="off"
                      maxLength={255}
                      placeholder="Vazio para usar a pasta padrÃ£o da conta"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#1E293B] dark:text-slate-200">ConfiguraÃ§Ãµes salvas</h3>
                      {driveConfig?.configurado && !driveSettingsEditing && <button type="button" onClick={() => { setDriveFolderId(driveConfig.driveFolderId ?? ''); setDriveSettingsEditing(true) }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"><Pencil size={14} /> Editar configuraÃ§Ãµes</button>}
                      {driveConfig?.configurado && driveSettingsEditing && <button type="button" onClick={() => { setDriveOAuthCredentials({ clientId: '', clientSecret: '', refreshToken: '' }); setDriveFolderId(driveConfig.driveFolderId ?? ''); setDriveSettingsEditing(false) }} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900">Cancelar ediÃ§Ã£o</button>}
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full border-collapse text-left text-sm">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <tr>
                            <th scope="row" className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">Status</th>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{driveConfig?.configurado ? 'Configurado' : 'NÃ£o configurado'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-slate-50 px-4 py-3 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">Tipo de credencial</th>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{driveConfig?.tipo === 'authorized_user' ? 'OAuth 2.0' : driveConfig?.tipo === 'service_account' ? 'Conta de serviÃ§o' : 'â€”'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-slate-50 px-4 py-3 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">ID da pasta</th>
                            <td className="break-all px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-200">{driveConfig?.driveFolderId || 'Pasta padrÃ£o do Drive'}</td>
                          </tr>
                          <tr>
                            <th scope="row" className="bg-slate-50 px-4 py-3 font-medium text-slate-600 dark:bg-slate-900 dark:text-slate-300">Ãšltima atualizaÃ§Ã£o</th>
                            <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{driveConfig?.updatedAt ? new Date(driveConfig.updatedAt).toLocaleString('pt-BR') : 'â€”'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] pt-5 dark:border-white/10">
                    <button
                      type="submit"
                      disabled={googleDriveMutation.isPending || hasPartialDriveOAuthCredentials || (driveConfig?.configurado && !driveSettingsEditing) || (!driveConfig?.configurado && !hasDriveOAuthCredentials)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {googleDriveMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                      Salvar configuraÃ§Ã£o
                    </button>
                    {driveConfig?.configurado && (
                      <>
                        <button
                          type="button"
                          onClick={() => testGoogleDriveMutation.mutate()}
                          disabled={testGoogleDriveMutation.isPending}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] px-4 py-2.5 text-sm font-semibold text-[#1E293B] transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {testGoogleDriveMutation.isPending && <LoaderCircle size={16} className="animate-spin" />}
                          Testar conexÃ£o
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Desconectar o Google Drive? Documentos enviados precisam ser removidos da anÃ¡lise antes.')) {
                              removeGoogleDriveMutation.mutate()
                            }
                          }}
                          disabled={removeGoogleDriveMutation.isPending}
                          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        >
                          {removeGoogleDriveMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          Desconectar
                        </button>
                      </>
                    )}
                  </div>
                </form>
              )}
            </motion.section>
          )}

          {driveTokenHelpOpen && (
            <Modal title="Como gerar as credenciais do Google Drive" subtitle="Gere uma credencial OAuth para habilitar o envio de arquivos." size="lg" onClose={() => setDriveTokenHelpOpen(false)}>
              <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1 text-sm text-slate-700 dark:text-slate-300">
                <section>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Opção 1: OAuth 2.0 (refresh token)</h3>
                  <ol className="mt-2 list-decimal space-y-2 pl-5">
                    <li>No Google Cloud Console, crie ou selecione um projeto, habilite a Google Drive API e configure a tela de consentimento OAuth. Se o app estiver em modo de teste, inclua sua conta em <strong>Usuários de teste</strong>.</li>
                    <li>Crie um ID do cliente OAuth do tipo <strong>Aplicativo da Web</strong>. Em <strong>URIs de redirecionamento autorizados</strong>, cadastre exatamente <code>https://srv1023256.hstgr.cloud/api/v1/integrations/google/callback</code>, sem adicionar ou remover barras. O URI precisa corresponder ao parâmetro <code>redirect_uri</code> enviado na solicitação OAuth.</li>
                    <li>Copie o <code>client_id</code> e o <code>client_secret</code> para os campos da tabela no perfil.</li>
                    <li>Clique em <strong>Gerar token com Google</strong> e autorize a conta que terá acesso ao Drive. O Kealex preencherá o refresh token; depois, salve a configuração.</li>
                  </ol>
                </section>
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">Se o Google mostrar “Acesso bloqueado” ou “solicitação inválida”, confira se o Client ID e o Client Secret pertencem ao mesmo cliente OAuth e se o URI de redirecionamento cadastrado corresponde exatamente ao da solicitação. Com o app em modo de teste, a conta autorizada também precisa estar na lista de usuários de teste.</p>
              </div>
            </Modal>
          )}

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                <KeyRound size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Chaves pÃºblicas de integraÃ§Ã£o</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Cadastre a chave pÃºblica que serÃ¡ utilizada nas integraÃ§Ãµes com cada Ã³rgÃ£o.</p>
              </div>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="relative block w-full sm:max-w-md">
                <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="search"
                  value={publicKeySearch}
                  onChange={(event) => { setPublicKeySearch(event.target.value); setPublicKeyPage(1) }}
                  placeholder="Buscar por Ã³rgÃ£o ou chave pÃºblica"
                  aria-label="Buscar chaves pÃºblicas por Ã³rgÃ£o ou chave"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <button type="button" onClick={() => openPublicKeyModal()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20">
                <Plus size={16} /> Adicionar chave
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-white/10">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#F5F8FC] text-xs uppercase tracking-wide text-[#64748B] dark:bg-slate-900 dark:text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Ã“rgÃ£o</th>
                    <th scope="col" className="px-4 py-3 font-semibold">Chave PÃºblica</th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">AÃ§Ãµes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/10">
                  {loadingPublicKeys ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Carregando chaves cadastradasâ€¦</td></tr>
                  ) : publicKeys.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Nenhuma chave pÃºblica cadastrada.</td></tr>
                  ) : filteredPublicKeys.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[#64748B] dark:text-slate-400">Nenhuma chave corresponde Ã  busca.</td></tr>
                  ) : visiblePublicKeys.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-slate-800">
                      <td className="px-4 py-3 font-semibold text-[#1E293B] dark:text-slate-200">{item.orgao}</td>
                      <td className="max-w-xl break-all px-4 py-3 font-mono text-xs text-[#64748B] dark:text-slate-400">{item.chavePublica}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openPublicKeyModal(item)} aria-label={`Editar chave de ${item.orgao}`} className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:text-indigo-400 dark:hover:bg-indigo-950/40">
                            <Pencil size={16} />
                          </button>
                          <button type="button" onClick={() => { if (window.confirm(`Remover a chave pÃºblica de ${item.orgao}?`)) removePublicKeyMutation.mutate(item.id) }} disabled={removePublicKeyMutation.isPending} aria-label={`Remover chave de ${item.orgao}`} className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:opacity-50 dark:hover:bg-rose-950/30">
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
                  Exibindo {(currentPublicKeyPage - 1) * publicKeysPerPage + 1}â€“{Math.min(currentPublicKeyPage * publicKeysPerPage, filteredPublicKeys.length)} de {filteredPublicKeys.length} {filteredPublicKeys.length === 1 ? 'chave' : 'chaves'}
                </p>
                <nav aria-label="PaginaÃ§Ã£o das chaves pÃºblicas" className="flex items-center gap-2">
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
                    PrÃ³xima <ChevronRight size={16} />
                  </button>
                </nav>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                <UserRound size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Dados pessoais</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Atualize as informaÃ§Ãµes da sua conta.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Nome</span>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 transition-colors focus-within:bg-slate-200 dark:bg-slate-900 dark:focus-within:bg-slate-800">
                    <UserRound size={16} className="shrink-0 text-slate-600 dark:text-slate-400" />
                    <input
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      autoComplete="name"
                      required
                      className="profile-text-input min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1E293B] outline-none dark:text-slate-100"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">E-mail</span>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 transition-colors focus-within:bg-slate-200 dark:bg-slate-900 dark:focus-within:bg-slate-800">
                    <Mail size={16} className="shrink-0 text-slate-600 dark:text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                      className="profile-text-input min-w-0 flex-1 bg-transparent text-sm font-medium text-[#1E293B] outline-none dark:text-slate-100"
                    />
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                  <ShieldCheck size={15} className="text-indigo-600 dark:text-indigo-400" />
                  AlteraÃ§Ãµes salvas na sua conta
                </div>
                <button
                  type="submit"
                  disabled={profileMutation.isPending || (nome === user?.nome && email === user?.email)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {profileMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Salvar alteraÃ§Ãµes
                </button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
          >
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                <Building2 size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Dados do tenant</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">InformaÃ§Ãµes cadastrais vinculadas Ã  conta e Ã  cobranÃ§a.</p>
              </div>
            </div>

            {loadingTenantProfile ? (
              <div className="flex items-center gap-2 py-2 text-sm text-[#64748B] dark:text-slate-400" role="status">
                <LoaderCircle size={16} className="animate-spin" /> Carregando dados do tenantâ€¦</div>
            ) : tenantProfileError ? (
              <p className="text-sm text-[#64748B] dark:text-slate-400" role="alert">NÃ£o foi possÃ­vel carregar os dados cadastrais do tenant.</p>
            ) : tenantForm ? (
              <form onSubmit={handleTenantSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TenantField label="Titular / organizaÃ§Ã£o" value={tenantForm.name} onChange={(value) => updateTenantField('name', value)} />
                  <TenantField label="E-mail de cobranÃ§a" type="email" value={tenantForm.email} onChange={(value) => updateTenantField('email', value)} />
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
                  <TenantField label="EndereÃ§o" value={tenantForm.address} onChange={(value) => updateTenantField('address', value)} />
                  <TenantField label="NÃºmero" value={tenantForm.addressNumber} onChange={(value) => updateTenantField('addressNumber', value)} />
                  <TenantField label="Complemento" value={tenantForm.addressComplement} onChange={(value) => updateTenantField('addressComplement', value)} />
                  <TenantField label="Bairro" value={tenantForm.neighborhood} onChange={(value) => updateTenantField('neighborhood', value)} />
                  <TenantField label="Cidade" value={tenantForm.city} onChange={(value) => updateTenantField('city', value)} />
                  <TenantField label="Estado" value={tenantForm.state} onChange={(value) => updateTenantField('state', value)} />
                  <div>
                    <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">ID do tenant</span>
                    <p className="rounded-xl bg-[#F5F8FC] px-4 py-3 text-sm text-[#64748B] dark:bg-slate-900 dark:text-slate-400" aria-readonly="true">{user?.tenantId ?? 'â€”'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8F0] pt-5 dark:border-white/10">
                  <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-slate-400">
                    <ShieldCheck size={15} className="text-indigo-600 dark:text-indigo-400" />
                    O ID do tenant nÃ£o pode ser alterado
                  </div>
                  <button
                    type="submit"
                    disabled={tenantMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tenantMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                    Salvar dados do tenant
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-[#64748B] dark:text-slate-400">Ainda nÃ£o hÃ¡ dados cadastrais de cobranÃ§a para este tenant.</p>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                  <CreditCard size={19} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">Plano e assinatura</h2>
                  {loadingBilling ? (
                    <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">Carregando informaÃ§Ãµes da assinaturaâ€¦</p>
                  ) : (
                    <div className="mt-2 space-y-1 text-sm text-[#64748B] dark:text-slate-400">
                      <p>Plano atual: <strong className="font-semibold text-[#1E293B] dark:text-slate-200">{currentPlan?.nome ?? (billingStatus?.status === 'trial' ? 'PerÃ­odo de teste' : billingStatus?.plano ?? 'Sem plano ativo')}</strong></p>
                      {formattedDueDate && (
                        <p className="flex items-center gap-1.5">
                          <CalendarDays size={14} /> PrÃ³xima renovaÃ§Ã£o: {formattedDueDate}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPlanModalOpen(true)}
                className="shrink-0 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
              >
                Ajustar plano
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row sm:items-center sm:p-8"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
                <History size={19} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1E293B] dark:text-white">VersÃ£o do Kealex</h2>
                <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">VersÃ£o atual: V. 1.3.0</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReleaseNotesOpen(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
            >
              <History size={16} /> Notas da versÃ£o
            </button>
          </motion.section>
        </div>
      </div>
      {publicKeyModalOpen && (
        <Modal
          title={editingPublicKeyId ? 'Editar chave pÃºblica' : 'Adicionar chave pÃºblica'}
          subtitle="Informe o Ã³rgÃ£o e a chave usada na integraÃ§Ã£o."
          onClose={() => setPublicKeyModalOpen(false)}
          size="md"
        >
          <form onSubmit={(event) => {
            event.preventDefault()
            if (publicKeys.some((item) => item.orgao === orgao && item.id !== editingPublicKeyId)) {
              toastError('JÃ¡ existe uma chave cadastrada para este Ã³rgÃ£o.')
              return
            }
            if (chavePublica.trim()) publicKeyMutation.mutate()
          }} className="space-y-4 p-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Ã“rgÃ£o</span>
              <select value={orgao} onChange={(event) => setOrgao(event.target.value)} required className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-900 dark:text-slate-200">
                {['Tribunais Superiores', 'JustiÃ§a Federal', 'JustiÃ§a Estadual', 'JustiÃ§a do Trabalho', 'JustiÃ§a Eleitoral', 'JustiÃ§a Militar'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#1E293B] dark:text-slate-200">Chave PÃºblica</span>
              <textarea value={chavePublica} onChange={(event) => setChavePublica(event.target.value)} rows={5} required maxLength={10000} placeholder="Cole a chave pÃºblica do Ã³rgÃ£o" className="w-full resize-y rounded-xl bg-slate-100 px-4 py-3 font-mono text-sm text-slate-800 outline-none placeholder:font-sans placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/10 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-400" />
            </label>
            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] pt-4 dark:border-white/10">
              <button type="button" onClick={() => setPublicKeyModalOpen(false)} className="rounded-xl border border-[#CBD5E1] px-4 py-2.5 text-sm font-semibold text-[#475569] hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</button>
              <button type="submit" disabled={!chavePublica.trim() || publicKeyMutation.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition-all hover:shadow-indigo-600/50 disabled:cursor-not-allowed disabled:opacity-50">
                {publicKeyMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                {editingPublicKeyId ? 'Salvar ediÃ§Ã£o' : 'Adicionar chave'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      <AssinaturaModal open={planModalOpen} onClose={() => setPlanModalOpen(false)} />
      {releaseNotesOpen && (
        <Modal
          title="Notas da versÃ£o"
          subtitle="Kealex â€” V. 1.3.0 Â· 29/10/2026"
          onClose={() => setReleaseNotesOpen(false)}
          size="md"
        >
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white">Novos recursos de IA e melhorias no chat.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>UsuÃ¡rios podem cadastrar e gerenciar chaves pessoais de IA, separadas por provedor e modelo; os segredos ficam criptografados no backend.</li>
              <li>Agentes aceitam modelos de OpenAI, Anthropic, Google, Groq, Cerebras e DeepSeek, com validaÃ§Ã£o de compatibilidade e atualizaÃ§Ã£o da lista pela chave informada.</li>
              <li>O chat usa o modelo configurado no agente e apresenta uma mensagem especÃ­fica quando o acesso ao Groq Ã© bloqueado pelo Cloudflare.</li>
              <li>Ãreas de processos, clientes, documentos, prazos e atividades.</li>
              <li>GestÃ£o financeira, cobranÃ§as, usuÃ¡rios, audiÃªncias e intimaÃ§Ãµes.</li>
              <li>AdministraÃ§Ã£o, perfil do usuÃ¡rio e recursos de inteligÃªncia artificial.</li>
              <li>Timeline processual integrada Ã  seÃ§Ã£o â€œFase atualâ€, com avanÃ§o de fase conforme as permissÃµes do usuÃ¡rio.</li>
              <li>PÃ¡ginas pÃºblicas de apresentaÃ§Ã£o, assinatura, termos de uso e privacidade.</li>
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
        className="profile-text-input w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-[#1E293B] outline-none transition-colors focus:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:focus:bg-slate-800"
      />
    </label>
  )
}
