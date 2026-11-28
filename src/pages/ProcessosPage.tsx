import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Briefcase, Search, FileText, Download, CircleCheck, Archive, CircleX, FolderOpen } from 'lucide-react'
import { useProcessos, useCreateProcesso, useUpdateProcesso, useDeleteProcesso, useAvancarFase } from '../hooks/useProcessos'
import { useCreateCliente, useUpdateCliente } from '../hooks/useClientes'
import { ProcessoTimeline } from '../components/ProcessoTimeline'
import { Modal } from '../components/Modal'
import { DataCard, SkeletonRow, EmptyState } from '../components/Cards'
import { statusProcessoBadge } from '../components/Badge'
import { Button, Input, Select, Textarea } from '../components/UI'
import { ClienteFormModal, type ClienteFormData } from '../components/ClienteFormModal'
import { TopBar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import { useAuth } from '../context/useAuth'
import { safeApiErrorMessage } from '../utils/safeApiErrorMessage'
import { useToast } from '../components/Toast'
import { gerarGuiaTJMG } from '../utils/guiaGenerator'
import { gerarDocumentoWord } from '../utils/documentGenerator'
import { documentosApi } from '../api/documentos'
import { usuariosApi } from '../api/usuarios'
import { processosApi, type ProcessoClienteInput, type ProcessoClienteVinculado, type ProcessoParte, type ProcessoParteInput } from '../api/processos'
import { clientesApi } from '../api/clientes'
import type { Processo, StatusProcesso } from '../types'
import type { Cliente } from '../types'

type FormData = {
  numero: string; titulo: string; descricao: string
  clienteId: string; vara: string; tribunal: string
  status?: StatusProcesso
}
type GuiaFormData = { tipo: 'custas' | 'honorarios' | 'deposito' | 'multa' | 'outro'; valor: string; vencimento: string; descricao: string }

const PROCESS_STEPS = [
  { title: 'Dados do processo', description: 'Identificação, tribunal e fase inicial.' },
  { title: 'Clientes', description: 'Vincule clientes e defina posições processuais.' },
  { title: 'Demais partes', description: 'Inclua partes que não são clientes do escritório.' },
  { title: 'Fases e revisão', description: 'Revise os dados e configure as fases.' },
]

const CODIGOS_TRIBUNAIS = [
  'ac', 'al', 'am', 'ap', 'ba', 'ce', 'dft', 'es', 'go', 'ma', 'mg', 'ms', 'mt',
  'pa', 'pb', 'pe', 'pi', 'pr', 'rj', 'rn', 'ro', 'rr', 'rs', 'sc', 'se', 'sp', 'to',
]

function identificarTribunal(numero: string): string | null {
  const n = numero.replace(/\D/g, '')
  if (n.length !== 20) return null
  const ramo = n[13]
  const codigo = Number(n.slice(14, 16))
  if (ramo === '3' && codigo === 0) return 'stj'
  if (ramo === '4' && codigo >= 1 && codigo <= 6) return `trf${codigo}`
  if (ramo === '5') return codigo === 0 ? 'tst' : codigo <= 24 ? `trt${codigo}` : null
  if (ramo === '6') {
    if (codigo === 0) return 'tse'
    return CODIGOS_TRIBUNAIS[codigo - 1] ? `tre-${CODIGOS_TRIBUNAIS[codigo - 1]}` : null
  }
  if (ramo === '7') {
    if (codigo === 0) return 'stm'
    return ({ 13: 'tjmmg', 21: 'tjmrs', 26: 'tjmsp' } as Record<number, string>)[codigo] ?? null
  }
  if (ramo === '8' && codigo >= 1 && codigo <= 27) {
    const sigla = CODIGOS_TRIBUNAIS[codigo - 1]
    return sigla === 'dft' ? 'tjdft' : `tj${sigla}`
  }
  return null
}

function gerarQualificacao(cliente: Cliente) {
  const documento = cliente.cpfCnpj?.trim()
  const pessoaJuridica = Boolean((documento && documento.replace(/\D/g, '').length > 11) || cliente.razaoSocial)
  const qualificacao = [pessoaJuridica ? (cliente.razaoSocial || cliente.nome) : cliente.nome]
  if (pessoaJuridica && cliente.nomeFantasia) qualificacao.push(`nome fantasia ${cliente.nomeFantasia}`)
  if (!pessoaJuridica) {
    if (cliente.nacionalidade) qualificacao.push(cliente.nacionalidade)
    if (cliente.estadoCivil) qualificacao.push(cliente.estadoCivil)
    if (cliente.profissao) qualificacao.push(cliente.profissao)
  }
  if (documento) qualificacao.push(`${pessoaJuridica ? 'inscrita' : 'inscrito'} ${pessoaJuridica ? 'no CNPJ' : 'no CPF'} sob nº ${documento}`)
  if (!pessoaJuridica && cliente.rg) qualificacao.push(`portador do RG nº ${cliente.rg}${cliente.orgaoExpedidor ? `, expedido por ${cliente.orgaoExpedidor}` : ''}`)
  if (pessoaJuridica) {
    if (cliente.inscricaoEstadual) qualificacao.push(`inscrição estadual nº ${cliente.inscricaoEstadual}`)
    if (cliente.inscricaoMunicipal) qualificacao.push(`inscrição municipal nº ${cliente.inscricaoMunicipal}`)
    if (cliente.representanteLegal) qualificacao.push(`representada por ${cliente.representanteLegal}`)
  }
  const endereco = [cliente.endereco, cliente.cidade, cliente.estado, cliente.cep].filter(Boolean).join(', ')
  if (endereco) qualificacao.push(`${pessoaJuridica ? 'com endereço em' : 'residente e domiciliado em'} ${endereco}`)
  if (cliente.email) qualificacao.push(`e-mail ${cliente.email}`)
  if (cliente.telefone || cliente.whatsapp) qualificacao.push(`telefone/WhatsApp ${[cliente.telefone, cliente.whatsapp].filter(Boolean).join(' / ')}`)
  return `${qualificacao.join(', ')}.`
}

export function ProcessosPage() {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()
  const isCliente = user?.role === 'cliente'
  const { data: processos, isLoading, isError } = useProcessos(!isCliente)
  const create = useCreateProcesso()
  const update = useUpdateProcesso()
  const createClient = useCreateCliente()
  const updateClient = useUpdateCliente()
  const remove = useDeleteProcesso()
  const avancarFase = useAvancarFase()
  const [editing, setEditing] = useState<Processo | null>(null)
  const [open, setOpen] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [clientLinksLoading, setClientLinksLoading] = useState(false)
  const [guiaOpen, setGuiaOpen] = useState(false)
  const [exportingProcessId, setExportingProcessId] = useState<string | null>(null)
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Processo | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [tribunalFilter, setTribunalFilter] = useState('todos')
  const [clienteFilter, setClienteFilter] = useState('todos')
  const [customFases, setCustomFases] = useState<string[]>([])
  const [novaFase, setNovaFase] = useState('')
  const [consultaStatus, setConsultaStatus] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<Cliente[]>([])
  const [clientSearchPage, setClientSearchPage] = useState(1)
  const [clientSearchTotal, setClientSearchTotal] = useState(0)
  const [selectedProcessClients, setSelectedProcessClients] = useState<ProcessoClienteVinculado[]>([])
  const [clientSearchLoading, setClientSearchLoading] = useState(false)
  const [clientLinkError, setClientLinkError] = useState('')
  const [clientFormOpen, setClientFormOpen] = useState(false)
  const [clientEditing, setClientEditing] = useState<Cliente | null>(null)
  const [processParties, setProcessParties] = useState<ProcessoParte[]>([])
  const [newParty, setNewParty] = useState<ProcessoParteInput>({ name: '', personType: 'fisica', proceduralRole: 'Réu', isUnknown: false })
  const lastLookup = useRef('')
  const { register, handleSubmit, reset, control, setValue, getValues, trigger } = useForm<FormData>()
  const numeroProcesso = useWatch({ control, name: 'numero' })
  const { register: registerGuia, handleSubmit: handleSubmitGuia, reset: resetGuia } = useForm<GuiaFormData>()

  const openCreate = () => { reset({}); setActiveStep(0); lastLookup.current = ''; setConsultaStatus(''); setEditing(null); setCustomFases([]); setNovaFase(''); setSelectedProcessClients([]); setProcessParties([]); setNewParty({ name: '', personType: 'fisica', proceduralRole: 'Réu', isUnknown: false }); setClientSearch(''); setClientResults([]); setClientSearchPage(1); setClientLinkError(''); setClientLinksLoading(false); setOpen(true) }
  const openEdit = (p: Processo) => { reset({ numero: p.numero, titulo: p.titulo, descricao: p.descricao, clienteId: p.clienteId, vara: p.vara, tribunal: p.tribunal, status: p.status }); setActiveStep(0); setSelectedProcessClients([]); setProcessParties([]); setNewParty({ name: '', personType: 'fisica', proceduralRole: 'Réu', isUnknown: false }); setClientLinkError(''); setClientLinksLoading(true); setEditing(p); setOpen(true) }
  const close = () => setOpen(false)

  const goToNextStep = async () => {
    if (activeStep === 0 && !(await trigger(['numero', 'titulo']))) return
    if (activeStep === 1) {
      if (clientLinksLoading) return
      if (!selectedProcessClients.length || !selectedProcessClients.some((client) => client.isPrimary)) {
        setClientLinkError('Vincule pelo menos um cliente e defina o cliente principal para continuar.')
        return
      }
    }
    setClientLinkError('')
    setActiveStep((step) => Math.min(step + 1, PROCESS_STEPS.length - 1))
  }

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      setClientSearchLoading(true)
      try {
        const result = await clientesApi.search(clientSearch, clientSearchPage)
        if (!cancelled) {
          setClientResults(result.items)
          setClientSearchTotal(result.total)
        }
      } catch {
        if (!cancelled) setClientLinkError('Não foi possível pesquisar clientes. Verifique sua conexão e tente novamente.')
      } finally {
        if (!cancelled) setClientSearchLoading(false)
      }
    }, 250)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [open, clientSearch, clientSearchPage])

  useEffect(() => {
    if (!open || !editing) return
    let cancelled = false
    Promise.all([processosApi.clients(editing.id), processosApi.parties(editing.id)]).then(([links, parties]) => {
      if (!cancelled) {
        setSelectedProcessClients(links)
        setProcessParties(parties)
        const primary = links.find((link) => link.isPrimary)
        if (primary) setValue('clienteId', primary.id)
        setClientLinksLoading(false)
      }
    }).catch(() => {
      if (!cancelled) { setClientLinkError('Não foi possível carregar os clientes vinculados a este processo.'); setClientLinksLoading(false) }
    })
    return () => { cancelled = true }
  }, [open, editing, setValue])

  const addProcessClient = (client: Cliente) => {
    if (selectedProcessClients.some((item) => item.id === client.id)) return
    const isPrimary = selectedProcessClients.length === 0
    const link: ProcessoClienteVinculado = { ...client, linkId: `new-${client.id}`, isPrimary, proceduralRole: isPrimary ? 'Interessado' : 'Interessado' }
    const next = [...selectedProcessClients, link]
    setSelectedProcessClients(next)
    if (isPrimary) setValue('clienteId', client.id, { shouldDirty: true })
    setClientLinkError('')
  }

  const removeProcessClient = (clientId: string) => {
    if (selectedProcessClients.length === 1) {
      setClientLinkError('O processo precisa manter pelo menos um cliente vinculado.')
      return
    }
    const next = selectedProcessClients.filter((item) => item.id !== clientId)
    if (!next.some((item) => item.isPrimary) && next.length > 0) next[0].isPrimary = true
    setSelectedProcessClients(next)
    setValue('clienteId', next.find((item) => item.isPrimary)?.id ?? '', { shouldDirty: true })
  }

  const makePrimaryClient = (clientId: string) => {
    const next = selectedProcessClients.map((item) => ({ ...item, isPrimary: item.id === clientId }))
    setSelectedProcessClients(next)
    setValue('clienteId', clientId, { shouldDirty: true })
  }

  const updateClientRole = (clientId: string, role: string) => setSelectedProcessClients((current) => current.map((item) => item.id === clientId ? { ...item, proceduralRole: role } : item))

  const submitClientForm = (data: ClienteFormData) => {
    const clean = (value: string | null | undefined) => (value ?? '').trim()
    const clientData = {
      nome: clean(data.nome), email: clean(data.email), telefone: clean(data.telefone),
      cpfCnpj: clean(data.cpfCnpj), cep: clean(data.cep), endereco: clean(data.endereco),
      cidade: clean(data.cidade), estado: clean(data.estado).toUpperCase(), observacoes: clean(data.observacoes),
      rg: clean(data.rg), orgaoExpedidor: clean(data.orgaoExpedidor), nacionalidade: clean(data.nacionalidade),
      estadoCivil: clean(data.estadoCivil), profissao: clean(data.profissao), dataNascimento: clean(data.dataNascimento),
      razaoSocial: clean(data.razaoSocial), nomeFantasia: clean(data.nomeFantasia),
      inscricaoEstadual: clean(data.inscricaoEstadual), inscricaoMunicipal: clean(data.inscricaoMunicipal),
      representanteLegal: clean(data.representanteLegal), whatsapp: clean(data.whatsapp),
    }
    if (clientEditing) {
      updateClient.mutate({ id: clientEditing.id, data: clientData }, {
        onSuccess: (updatedClient) => {
          setSelectedProcessClients((current) => current.map((item) => item.id === updatedClient.id ? { ...item, ...updatedClient } : item))
          setClientFormOpen(false)
          setClientEditing(null)
        },
        onError: () => toastError('Não foi possível atualizar o cadastro do cliente.'),
      })
      return
    }
    createClient.mutate(clientData, {
      onSuccess: (client) => {
        addProcessClient(client)
        setClientFormOpen(false)
        setClientEditing(null)
      },
      onError: () => toastError('Não foi possível cadastrar o cliente.'),
    })
  }

  const addProcessParty = () => {
    if (!newParty.name.trim()) return
    setProcessParties((current) => [...current, { ...newParty, name: newParty.name.trim(), id: `new-${crypto.randomUUID()}` }])
    setNewParty({ name: '', personType: 'fisica', proceduralRole: 'Réu', isUnknown: false })
  }

  const removeProcessParty = (partyId: string) => {
    if (!partyId.startsWith('new-')) {
      toastError('Esta parte já está salva. A remoção será disponibilizada após a atualização do serviço de processos.')
      return
    }
    setProcessParties((current) => current.filter((party) => party.id !== partyId))
  }

  const persistNewParties = async (processId: string, parties: ProcessoParte[]) => {
    for (const party of parties) {
      if (!party.id.startsWith('new-')) continue
      const { id: temporaryId, ...partyData } = party
      const savedParty = await processosApi.addParty(processId, partyData)
      setProcessParties((current) => current.map((item) => item.id === temporaryId ? savedParty : item))
    }
  }

  useEffect(() => {
    if (!open || editing) return
    const numero = (numeroProcesso ?? '').replace(/\D/g, '')
    if (numero.length !== 20 || lastLookup.current === numero) return
    const tribunal = identificarTribunal(numero)
    if (!tribunal) {
      const timer = window.setTimeout(() => {
        setConsultaStatus('Não foi possível identificar automaticamente o tribunal deste número. Você pode preencher os dados manualmente.')
      }, 0)
      return () => window.clearTimeout(timer)
    }
    const timer = window.setTimeout(async () => {
      lastLookup.current = numero
      setConsultaStatus('Consultando dados do processo…')
      try {
        const response = await usuariosApi.consultarProcessoDataJud({ tribunal, numeroProcesso: numero })
        if (String(getValues('numero') ?? '').replace(/\D/g, '') !== numero) return
        const processo = response?.hits?.hits?.[0]?._source
        if (!processo) {
          setConsultaStatus('Nenhum processo encontrado para esse número. Você pode preencher os dados manualmente.')
          return
        }
        const assuntos = Array.isArray(processo.assuntos)
          ? processo.assuntos.map((assunto) => assunto.nome).filter((nome): nome is string => Boolean(nome))
          : []
        const descricao = [assuntos.length ? `Assuntos: ${assuntos.join(', ')}` : '', processo.dataAjuizamento ? `Data de ajuizamento: ${new Date(processo.dataAjuizamento).toLocaleDateString('pt-BR')}` : ''].filter(Boolean).join('\n')
        const preencheSeVazio = (campo: 'titulo' | 'vara' | 'tribunal' | 'descricao', valor?: string) => {
          if (valor && !String(getValues(campo) ?? '').trim()) setValue(campo, valor, { shouldDirty: false })
        }
        preencheSeVazio('titulo', processo.classe?.nome)
        preencheSeVazio('vara', processo.orgaoJulgador?.nome)
        preencheSeVazio('tribunal', processo.tribunal)
        preencheSeVazio('descricao', descricao)
        setConsultaStatus('Dados encontrados no DataJud. Confira e complete o cadastro do processo.')
      } catch (error: unknown) {
        setConsultaStatus(safeApiErrorMessage(error, 'Não foi possível consultar o DataJud. Confira a chave pública no Perfil e preencha os dados manualmente.'))
      }
    }, 500)
    return () => window.clearTimeout(timer)
  }, [numeroProcesso, open, editing, setValue, getValues])

  const openGuia = (p: Processo) => {
    setSelectedProcesso(p)
    resetGuia({
      tipo: 'custas',
      valor: '',
      vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      descricao: `Guia de pagamento - Processo ${p.numero}`
    })
    setGuiaOpen(true)
  }

  const exportarProcessoWord = async (processo: Processo) => {
    setExportingProcessId(processo.id)
    try {
      const [clientsResult, partiesResult, documentsResult] = await Promise.allSettled([
        processosApi.clients(processo.id),
        processosApi.parties(processo.id),
        documentosApi.byProcesso(processo.id),
      ])
      const clientes = clientsResult.status === 'fulfilled' ? clientsResult.value : []
      const partes = partiesResult.status === 'fulfilled' ? partiesResult.value : []
      const documentos = documentsResult.status === 'fulfilled' ? documentsResult.value : []
      const pendencias = [
        clientsResult.status === 'rejected' && 'clientes vinculados',
        partiesResult.status === 'rejected' && 'demais partes',
        documentsResult.status === 'rejected' && 'documentos anexados',
      ].filter(Boolean)
      const formatarData = (value?: string) => value ? new Date(value).toLocaleDateString('pt-BR') : 'Não informado'
      const linha = (label: string, value?: string | number | null) => `- ${label}: ${value === undefined || value === null || value === '' ? 'Não informado' : value}`
      const conteudo = [
        '## Dados do processo',
        linha('Número', processo.numero),
        linha('Título', processo.titulo),
        linha('Descrição', processo.descricao),
        linha('Status', processo.status),
        linha('Tribunal', processo.tribunal),
        linha('Vara', processo.vara),
        linha('Cliente principal', processo.clienteNome),
        linha('E-mail do cliente', processo.clienteEmail),
        linha('Data de cadastro', formatarData(processo.createdAt)),
        linha('Última atualização', formatarData(processo.updatedAt)),
        '',
        '## Clientes vinculados',
        ...(clientes.length ? clientes.flatMap((cliente, index) => [
          `### Cliente ${index + 1}${cliente.isPrimary ? ' — principal' : ''}`,
          linha('Nome', cliente.nome),
          linha('Papel processual', cliente.proceduralRole),
          linha('Polo processual', cliente.proceduralPole),
          linha('CPF/CNPJ', cliente.cpfCnpj),
          linha('E-mail', cliente.email),
          linha('Telefone', cliente.telefone),
          linha('WhatsApp', cliente.whatsapp),
          linha('Endereço', [cliente.endereco, cliente.cidade, cliente.estado, cliente.cep].filter(Boolean).join(', ')),
        ]) : [linha('Cliente', processo.clienteNome)]),
        '',
        '## Demais partes',
        ...(partes.length ? partes.flatMap((parte, index) => [
          `### Parte ${index + 1}`,
          linha('Nome', parte.name),
          linha('Tipo de pessoa', parte.personType),
          linha('Papel processual', parte.proceduralRole),
          linha('CPF/CNPJ', parte.document),
          linha('E-mail', parte.email),
          linha('Telefone', parte.phone),
          linha('Endereço', parte.address),
          linha('Dados desconhecidos', parte.isUnknown ? 'Sim' : 'Não'),
        ]) : [linha('Partes', 'Nenhuma parte adicional cadastrada')]),
        '',
        '## Fases do processo',
        ...(processo.fases?.length ? processo.fases.map((fase, index) => `- ${index + 1}. ${fase.label} — ${fase.status}${fase.data ? ` — ${formatarData(fase.data)}` : ''}`) : [linha('Fases', 'Nenhuma fase cadastrada')]),
        '',
        '## Documentos anexados',
        ...(documentos.length ? documentos.map((documento, index) => `- ${index + 1}. ${documento.nome} — tipo: ${documento.tipo}; status: ${documento.status}; arquivo: ${documento.urlArquivo}`) : [linha('Documentos', 'Nenhum documento anexado')]),
        ...(pendencias.length ? ['', '## Dados não carregados', `- Não foi possível consultar: ${pendencias.join(', ')}. O arquivo contém os demais dados disponíveis.`] : []),
      ].join('\n')
      await gerarDocumentoWord({ titulo: `Dados do Processo — ${processo.numero}`, conteudo, autor: 'Kealex' })
      if (pendencias.length) success('Documento gerado. Alguns dados relacionados não puderam ser carregados.')
      else success('Documento Word do processo gerado com sucesso!')
    } catch {
      toastError('Não foi possível gerar o documento Word deste processo.')
    } finally {
      setExportingProcessId(null)
    }
  }

  const closeGuia = () => setGuiaOpen(false)

  const onSubmitGuia = async (data: GuiaFormData) => {
    if (!selectedProcesso) return
    
    try {
      await gerarGuiaTJMG({
        numeroProcesso: selectedProcesso.numero,
        titulo: selectedProcesso.titulo,
        vara: selectedProcesso.vara,
        tribunal: selectedProcesso.tribunal,
        clienteNome: selectedProcesso.clienteNome || 'Cliente',
        tipo: data.tipo,
        valor: parseFloat(data.valor),
        vencimento: data.vencimento,
        descricao: data.descricao
      })
      success('Guia gerada e baixada com sucesso!')
      closeGuia()
    } catch {
      toastError('Erro ao gerar guia. Tente novamente.')
    }
  }

  const onSubmit = (data: FormData) => {
    const links: ProcessoClienteInput[] = selectedProcessClients.map((client) => ({
      clienteId: client.id, proceduralRole: client.proceduralRole, proceduralPole: client.proceduralPole ?? undefined,
      isPrimary: client.isPrimary, notes: client.notes ?? undefined,
    }))
    if (!links.length) {
      setClientLinkError('Vincule pelo menos um cliente ao processo.')
      return
    }
    if (!links.some((link) => link.clienteId === data.clienteId && link.isPrimary)) {
      setClientLinkError('Selecione um cliente principal entre os clientes vinculados.')
      return
    }
    const payload = { ...data, ...(customFases.length > 0 ? { fases: customFases } : {}), clientesVinculados: links }
    if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess: async () => {
      try {
        if (links.length) await processosApi.replaceClients(editing.id, links)
        await persistNewParties(editing.id, processParties)
        setOpen(false)
      } catch {
        setClientLinkError('O processo foi atualizado, mas não foi possível salvar uma das demais partes. Confira a conexão e tente novamente.')
      }
    } })
    else create.mutate(payload, { onSuccess: async (process) => {
      try {
        await persistNewParties(process.id, processParties)
        close()
      } catch {
        setClientLinkError('O processo foi criado, mas não foi possível salvar uma das demais partes. Tente editar o processo para concluir.')
      }
    } })
  }

  const allProcessos = Array.isArray(processos) ? processos : []
  const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
  const tribunalOptions = [...new Set(allProcessos.map((p) => p.tribunal).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const clienteOptions = [...new Map(allProcessos.filter((p) => p.clienteId).map((p) => [p.clienteId, p.clienteNome || 'Cliente']))]
    .sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'))
  const displayProcessos = allProcessos.filter((p) => {
    const matchesSearch = [p.titulo, p.numero, p.clienteNome, p.tribunal, p.vara]
      .some((value) => value?.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
    return matchesSearch
      && (statusFilter === 'todos' || p.status === statusFilter)
      && (tribunalFilter === 'todos' || p.tribunal === tribunalFilter)
      && (clienteFilter === 'todos' || p.clienteId === clienteFilter)
  })
  const activeFilterCount = [search.trim(), statusFilter !== 'todos', tribunalFilter !== 'todos', clienteFilter !== 'todos'].filter(Boolean).length

  const stats = [
    { label: 'Total de Processos', value: allProcessos.length, description: 'Todos os processos cadastrados', tone: 'blue', icon: <Briefcase size={20} /> },
    { label: 'Processos Ativos', value: allProcessos.filter((p) => p.status === 'ativo').length, description: 'Em andamento', tone: 'green', icon: <CircleCheck size={20} /> },
    { label: 'Arquivados', value: allProcessos.filter((p) => p.status === 'arquivado').length, description: 'Processos arquivados', tone: 'orange', icon: <Archive size={20} /> },
    { label: 'Encerrados', value: allProcessos.filter((p) => p.status === 'encerrado').length, description: 'Processos finalizados', tone: 'red', icon: <CircleX size={20} /> },
  ]

  if (isCliente) {
    return (
      <div className="kea-process-page">
        <TopBar title="" hideModuleBar />
        <div className="kea-process-content">
          <PageBanner title="Processos" description="A consulta individual ainda não está disponível." />
          <section role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
            O acesso depende de um vínculo seguro entre seu login e o cadastro de cliente. Entre em contato com o escritório para consultar seus processos enquanto esse vínculo é configurado.
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
          title="Processos & Fases"
          description={isCliente ? 'Acompanhe seus processos jurídicos e consulte suas fases.' : 'Gerencie seus processos com uma esteira de fases interativa e acompanhe prazos, movimentações e documentos em um só lugar.'}
          action={!isCliente && <Button icon={<Plus size={15} />} onClick={openCreate}>Novo Processo</Button>}
        />
        <div className="kea-process-stats">
          {stats.map((stat) => (
            <article key={stat.label} className={`kea-process-stat is-${stat.tone}`}>
              <span className="kea-process-stat-icon">{stat.icon}</span>
              <div className="kea-process-stat-copy"><span>{stat.label}</span><strong>{isLoading || isError ? '—' : stat.value}</strong><small>{stat.description}</small></div>
              <span className="kea-process-stat-accent" />
            </article>
          ))}
        </div>

        <DataCard delay={0.2} className="kea-process-filter-card">
          <div className="kea-process-filters">
            <div className="kea-process-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, número, cliente, tribunal ou vara..."
                aria-label="Buscar processos"
              />
            </div>
            <label className="kea-process-status-filter"><span>Status</span><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filtrar por status"><option value="todos">Todos</option><option value="ativo">Ativos</option><option value="arquivado">Arquivados</option><option value="encerrado">Encerrados</option></select></label>
            <label className="kea-process-status-filter"><span>Tribunal</span><select value={tribunalFilter} onChange={(e) => setTribunalFilter(e.target.value)} aria-label="Filtrar por tribunal"><option value="todos">Todos</option>{tribunalOptions.map((tribunal) => <option key={tribunal} value={tribunal}>{tribunal}</option>)}</select></label>
            <label className="kea-process-status-filter"><span>Cliente</span><select value={clienteFilter} onChange={(e) => setClienteFilter(e.target.value)} aria-label="Filtrar por cliente"><option value="todos">Todos</option>{clienteOptions.map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}</select></label>
            {(search || statusFilter !== 'todos' || tribunalFilter !== 'todos' || clienteFilter !== 'todos') && <button type="button" className="kea-process-clear" onClick={() => { setSearch(''); setStatusFilter('todos'); setTribunalFilter('todos'); setClienteFilter('todos') }}>Limpar</button>}
            {activeFilterCount > 0 && <span className="kea-process-active-filter-count" aria-live="polite">{activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} ativo{activeFilterCount === 1 ? '' : 's'}</span>}
          </div>
          <div className="kea-process-list-heading"><h2>Processos cadastrados</h2><span>{isLoading ? 'Carregando…' : `${displayProcessos.length} ${displayProcessos.length === 1 ? 'registro' : 'registros'}`}</span></div>
          <div className="kea-process-list">
            {isError ? (
              <p className="kea-process-empty-error" role="alert">Não foi possível carregar os processos. Tente novamente em instantes.</p>
            ) : isLoading ? (
              [...Array(4)].map((_, i) => <SkeletonRow key={i} variant="list" />)
            ) : displayProcessos.length === 0 ? (
              <div className="p-8"><EmptyState message="Nenhum processo encontrado" icon={<Briefcase size={28} className="text-slate-300" />} /></div>
            ) : (
              <AnimatePresence>
                {displayProcessos.map((p, i) => {
                  return (
                    <motion.div
                      key={p.id}
                      className="kea-process-record"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="kea-process-record-main">
                        <div className="kea-process-identification">
                          <span className="kea-process-folder"><FolderOpen size={21} /></span>
                          <div className="kea-process-identification-copy">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono text-indigo-500 dark:text-indigo-400">{p.numero}</span>
                            {statusProcessoBadge(p.status)}
                          </div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{p.titulo}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {p.clienteNome} • {p.vara} • {p.tribunal}
                          </p>

                          </div>
                        </div>
                        <div className="kea-process-phase-column">
                          <div className="kea-process-phase-summary">
                            <span>Fase atual</span>
                            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-indigo-950/40">
                              <ProcessoTimeline
                                fases={p.fases}
                                faseAtual={p.faseAtual}
                                readonly={isCliente}
                                isLoading={avancarFase.isPending}
                                onAvancar={(novaFase) => {
                                  avancarFase.mutate({ id: p.id, faseAtual: novaFase })
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="kea-process-actions">
                          <motion.button
                            type="button"
                            onClick={() => void exportarProcessoWord(p)}
                            disabled={exportingProcessId === p.id}
                            className="p-2 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-all disabled:cursor-wait disabled:opacity-50"
                            aria-label="Gerar documento Word do processo"
                            title={exportingProcessId === p.id ? 'Gerando documento...' : 'Gerar documento Word'}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Download size={20} />
                          </motion.button>
                          <motion.button
                            onClick={() => openGuia(p)}
                            className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-all"
                            aria-label="Emitir guia"
                            title="Emitir Guia"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FileText size={20} />
                          </motion.button>
                          {!isCliente && (
                            <>
                              <motion.button
                                onClick={() => openEdit(p)}
                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all"
                                aria-label="Editar processo"
                                title="Editar Processo"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Pencil size={20} />
                              </motion.button>
                              <motion.button
                                onClick={() => setConfirmDelete(p)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                                aria-label="Excluir processo"
                                title="Excluir Processo"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Trash2 size={20} />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </DataCard>
      </div>

      {open && !isCliente && (
        <Modal
          title={editing ? 'Editar Processo' : 'Novo Processo'}
          subtitle={editing ? `Editando: ${editing.numero}` : 'Preencha os dados do novo processo'}
          onClose={close}
          closeOnBackdrop={Boolean(editing)}
          size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <nav aria-label="Etapas do processo" className="grid grid-cols-4 gap-2">
              {PROCESS_STEPS.map((step, index) => <button key={step.title} type="button" disabled={index > activeStep} onClick={() => setActiveStep(index)} className={`rounded-lg px-2 py-2 text-left text-xs transition-colors ${index === activeStep ? 'bg-indigo-600 text-white' : index < activeStep ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-700'}`}>
                <span className="block font-semibold">{index + 1}. {step.title}</span>
              </button>)}
            </nav>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900/50" aria-live="polite">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Etapa {activeStep + 1} de {PROCESS_STEPS.length}: {PROCESS_STEPS[activeStep].title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{PROCESS_STEPS[activeStep].description}</p>
            </div>
            <input type="hidden" {...register('clienteId')} />
            {activeStep === 0 && <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Número" {...register('numero', { required: true })} required placeholder="0001234-56.2024" />
              <Input label="Título" {...register('titulo', { required: true })} required placeholder="Ex: Ação Civil" />
            </div>
            {!editing && <p className="text-xs text-slate-500 dark:text-slate-400" role="status" aria-live="polite">Informe o número CNJ completo para buscar automaticamente os dados públicos do processo.{consultaStatus && <> {consultaStatus}</>}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Vara" {...register('vara')} placeholder="1ª Vara Cível" />
              <Input label="Tribunal" {...register('tribunal')} placeholder="TJSP" />
            </div>
            <Textarea label="Descrição" {...register('descricao')} rows={3} placeholder="Descreva o processo..." />
            {editing && <Select label="Status" {...register('status')}>
              {['ativo', 'arquivado', 'encerrado'].map((status) => <option key={status} value={status}>{status}</option>)}
            </Select>}
            </>}
            {activeStep === 1 && <section className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Clientes vinculados ao processo</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Pesquise pelo nome, CPF/CNPJ, e-mail ou código do cliente. O vínculo não altera o cadastro original.</p>
              </div>
              <div className="flex items-end gap-2"><div className="min-w-0 flex-1"><Input label="Pesquisar clientes" value={clientSearch} onChange={(event) => { setClientSearch(event.target.value); setClientSearchPage(1) }} placeholder="Nome, CPF/CNPJ, e-mail ou código interno" /></div><Button type="button" variant="secondary" onClick={() => { setClientEditing(null); setClientFormOpen(true) }}>Novo cliente</Button></div>
              <div className="max-h-48 space-y-1 overflow-auto rounded-lg border border-slate-100 dark:border-slate-700 p-2" aria-live="polite">
                {clientSearchLoading ? <p className="p-2 text-xs text-slate-500">Pesquisando clientes…</p> : clientResults.length === 0 ? <p className="p-2 text-xs text-slate-500">Nenhum cliente encontrado.</p> : clientResults.map((client) => {
                  const linked = selectedProcessClients.some((item) => item.id === client.id)
                  return <div key={client.id} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{client.nome}</p><p className="truncate text-xs text-slate-500">{[client.cpfCnpj, client.email, client.id].filter(Boolean).join(' · ')}</p></div>
                    <Button type="button" size="sm" variant={linked ? 'secondary' : 'primary'} disabled={linked} onClick={() => addProcessClient(client)}>{linked ? 'Vinculado' : 'Vincular'}</Button>
                  </div>
                })}
              </div>
              {clientSearchTotal > 20 && <div className="flex items-center justify-between text-xs text-slate-500"><span>Página {clientSearchPage} · {clientSearchTotal} clientes</span><div className="flex gap-2"><Button type="button" size="sm" variant="secondary" disabled={clientSearchPage <= 1} onClick={() => setClientSearchPage((page) => page - 1)}>Anterior</Button><Button type="button" size="sm" variant="secondary" disabled={clientSearchPage * 20 >= clientSearchTotal} onClick={() => setClientSearchPage((page) => page + 1)}>Próxima</Button></div></div>}
              {selectedProcessClients.length > 0 ? <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Qualificação dos clientes selecionados</p>
                {selectedProcessClients.map((client) => {
                  const pessoaJuridica = Boolean((client.cpfCnpj && client.cpfCnpj.replace(/\D/g, '').length > 11) || client.razaoSocial)
                  const pendencias = pessoaJuridica
                    ? [!client.cpfCnpj && 'CNPJ', !client.inscricaoEstadual && 'inscrição estadual', !client.inscricaoMunicipal && 'inscrição municipal', !client.representanteLegal && 'representante legal']
                    : [!client.cpfCnpj && 'CPF', !client.rg && 'RG', !client.orgaoExpedidor && 'órgão expedidor', !client.nacionalidade && 'nacionalidade', !client.estadoCivil && 'estado civil', !client.profissao && 'profissão', !client.dataNascimento && 'data de nascimento']
                  const missing = [...pendencias, !client.telefone && !client.whatsapp && 'telefone/WhatsApp', !client.email && 'e-mail', !client.endereco && 'endereço'].filter(Boolean)
                  return <article key={client.id} className="rounded-lg bg-indigo-50/70 p-3 dark:bg-indigo-950/30">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div><div className="flex items-center gap-2"><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{client.razaoSocial || client.nome}</p>{client.isPrimary && <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white">Principal</span>}</div>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{[client.cpfCnpj, client.email, client.telefone, [client.endereco, client.cidade, client.estado, client.cep].filter(Boolean).join(', ')].filter(Boolean).join(' · ') || 'Sem dados complementares cadastrados'}</p>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300"><span className="font-semibold">Qualificação com dados cadastrados:</span> {gerarQualificacao(client)}</p>
                        {missing.length > 0 && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Cadastro pendente: {missing.join(', ')}.</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {!client.isPrimary && <Button type="button" variant="secondary" size="sm" onClick={() => makePrimaryClient(client.id)}>Definir principal</Button>}
                        <Button type="button" variant="secondary" size="sm" onClick={() => { setClientEditing(client); setClientFormOpen(true) }}>{missing.length ? 'Completar cadastro' : 'Editar cadastro'}</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeProcessClient(client.id)}>Desvincular</Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <Select label="Posição processual" value={client.proceduralRole} onChange={(event) => updateClientRole(client.id, event.target.value)}>
                        {['Autor', 'Réu', 'Requerente', 'Requerido', 'Reclamante', 'Reclamado', 'Exequente', 'Executado', 'Impetrante', 'Impetrado', 'Recorrente', 'Recorrido', 'Interessado', 'Terceiro interessado', 'Outros'].map((role) => <option key={role}>{role}</option>)}
                      </Select>
                      <Select label="Polo processual" value={client.proceduralPole ?? ''} onChange={(event) => setSelectedProcessClients((current) => current.map((item) => item.id === client.id ? { ...item, proceduralPole: event.target.value || null } : item))}>
                        <option value="">Não informado</option><option value="ativo">Ativo</option><option value="passivo">Passivo</option><option value="terceiro">Terceiro</option>
                      </Select>
                    </div>
                  </article>
                })}
              </div> : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Vincule pelo menos um cliente ao processo.</p>}
              {clientLinkError && <p role="alert" className="text-xs text-red-600">{clientLinkError}</p>}
            </section>}
            {activeStep === 2 && <section className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div><h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Demais partes envolvidas</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Cadastre partes, representantes, testemunhas e terceiros sem incluí-los como clientes do escritório.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome da parte" value={newParty.name} onChange={(event) => setNewParty((party) => ({ ...party, name: event.target.value }))} placeholder="Nome ou razão social" />
                <Select label="Tipo de pessoa" value={newParty.personType} onChange={(event) => setNewParty((party) => ({ ...party, personType: event.target.value as 'fisica' | 'juridica' }))}><option value="fisica">Pessoa física</option><option value="juridica">Pessoa jurídica</option></Select>
                <Select label="Posição processual" value={newParty.proceduralRole} onChange={(event) => setNewParty((party) => ({ ...party, proceduralRole: event.target.value }))}>{['Autor', 'Réu', 'Requerente', 'Requerido', 'Reclamante', 'Reclamado', 'Exequente', 'Executado', 'Impetrante', 'Impetrado', 'Recorrente', 'Recorrido', 'Interessado', 'Terceiro interessado', 'Testemunha', 'Representante legal', 'Perito', 'Outros'].map((role) => <option key={role}>{role}</option>)}</Select>
                <Input label="CPF/CNPJ (opcional)" value={newParty.document ?? ''} onChange={(event) => setNewParty((party) => ({ ...party, document: event.target.value }))} placeholder="Documento" />
                <Input label="E-mail (opcional)" value={newParty.email ?? ''} onChange={(event) => setNewParty((party) => ({ ...party, email: event.target.value }))} placeholder="email@exemplo.com" />
                <Input label="Telefone (opcional)" value={newParty.phone ?? ''} onChange={(event) => setNewParty((party) => ({ ...party, phone: event.target.value }))} placeholder="Telefone" />
              </div>
              <Input label="Endereço (opcional)" value={newParty.address ?? ''} onChange={(event) => setNewParty((party) => ({ ...party, address: event.target.value }))} placeholder="Endereço completo" />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"><input type="checkbox" checked={newParty.isUnknown} onChange={(event) => setNewParty((party) => ({ ...party, isUnknown: event.target.checked }))} /> Há informações desconhecidas ou indisponíveis</label>
                <Button type="button" size="sm" variant="secondary" disabled={!newParty.name.trim()} onClick={addProcessParty}>Adicionar parte</Button>
              </div>
              {processParties.length > 0 && <ul className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700">{processParties.map((party) => <li key={party.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50"><div><p className="text-sm font-medium text-slate-800 dark:text-slate-100">{party.name}</p><p className="text-xs text-slate-500">{party.personType === 'juridica' ? 'Pessoa jurídica' : 'Pessoa física'} · {party.proceduralRole}{party.isUnknown ? ' · dados pendentes' : ''}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => removeProcessParty(party.id)}>Remover</Button></li>)}</ul>}
            </section>}
            
            {activeStep === 3 && <>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Revisão do cadastro</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{getValues('numero') || 'Número pendente'} · {getValues('titulo') || 'Título pendente'}</p>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{selectedProcessClients.length} cliente(s) vinculado(s) · {processParties.length} demais parte(s)</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Cliente principal: {selectedProcessClients.find((client) => client.isPrimary)?.razaoSocial || selectedProcessClients.find((client) => client.isPrimary)?.nome || 'Não definido'}</p>
            </div>
            <div className="border-t border-slate-100 dark:border-indigo-950/40 pt-4">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Fases do Processo</p>
              <div className="space-y-2 mb-3">
                {customFases.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">Nenhuma fase adicionada. Use as padrões ou crie customizadas.</p>
                ) : (
                  customFases.map((fase, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{idx + 1}. {fase}</span>
                      <button
                        type="button"
                        onClick={() => setCustomFases(customFases.filter((_, i) => i !== idx))}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold"
                      >
                        Remover
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novaFase}
                  onChange={(e) => setNovaFase(e.target.value)}
                  placeholder="Ex: Distribuição, Citação..."
                  className="flex-1 px-3 py-2 text-sm bg-transparent border border-slate-200 dark:border-indigo-950/60 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && novaFase.trim()) {
                      setCustomFases([...customFases, novaFase.trim()])
                      setNovaFase('')
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (novaFase.trim()) {
                      setCustomFases([...customFases, novaFase.trim()])
                      setNovaFase('')
                    }
                  }}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  Adicionar
                </button>
              </div>
            </div>
            </>}
            <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white/95 px-4 pb-2 pt-3 backdrop-blur dark:border-indigo-950/40 dark:bg-slate-800/95 sm:-mx-6 sm:px-6">
              <Button variant="secondary" type="button" onClick={close}>Cancelar</Button>
              <div className="flex gap-2">
                {activeStep > 0 && <Button variant="secondary" type="button" onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>Voltar</Button>}
                {activeStep < PROCESS_STEPS.length - 1
                  ? <Button type="button" loading={activeStep === 1 && clientLinksLoading} onClick={() => void goToNextStep()}>Continuar</Button>
                  : <Button type="submit" loading={create.isPending || update.isPending}>Salvar Processo</Button>}
              </div>
            </div>
          </form>
        </Modal>
      )}

      {clientFormOpen && <ClienteFormModal
        title={clientEditing ? 'Completar cadastro do cliente' : 'Novo cliente'}
        subtitle="O cliente será vinculado ao processo após salvar."
        initialData={clientEditing ?? undefined}
        onClose={() => { setClientFormOpen(false); setClientEditing(null) }}
        onSubmit={submitClientForm}
        loading={createClient.isPending || updateClient.isPending}
      />}

      {confirmDelete && (
        <Modal title="Confirmar Exclusão" onClose={() => setConfirmDelete(null)} size="sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
              <Trash2 size={20} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">Excluir o processo <strong>{confirmDelete.numero}</strong>? Esta ação não pode ser desfeita.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" icon={<Trash2 size={14} />} loading={remove.isPending} onClick={() => remove.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) })}>Excluir</Button>
            </div>
          </div>
        </Modal>
      )}

      {guiaOpen && selectedProcesso && (
        <Modal
          title="Emitir Guia de Pagamento"
          subtitle={`Processo: ${selectedProcesso.numero} - ${selectedProcesso.titulo}`}
          onClose={closeGuia}
        >
          <form onSubmit={handleSubmitGuia(onSubmitGuia)} className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/20 rounded-xl">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Processo Selecionado</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400 font-mono">{selectedProcesso.numero}</p>
              <p className="text-xs text-indigo-700 dark:text-indigo-400">{selectedProcesso.titulo}</p>
            </div>

            <Select label="Tipo de Guia" {...registerGuia('tipo')}>
              <option value="custas">Custas Processuais</option>
              <option value="honorarios">Honorários Periciais</option>
              <option value="deposito">Depósito Judicial</option>
              <option value="multa">Multa</option>
              <option value="outro">Outro</option>
            </Select>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Valor (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...registerGuia('valor')}
              />
              <Input
                label="Vencimento"
                type="date"
                {...registerGuia('vencimento')}
              />
            </div>

            <Textarea
              label="Descrição"
              rows={3}
              placeholder="Detalhes do pagamento..."
              {...registerGuia('descricao')}
            />

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/20 rounded-xl">
              <p className="text-xs text-amber-800 dark:text-amber-300">
                💡 A guia será gerada em formato PDF com código de barras para pagamento bancário e símbolo da justiça federal.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-indigo-950/40">
              <Button variant="secondary" type="button" onClick={closeGuia}>Cancelar</Button>
              <Button type="submit" icon={<Download size={15} />}>Gerar e Baixar Guia</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
