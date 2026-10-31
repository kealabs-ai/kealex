import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Copy, Link2, Pencil, ToggleLeft, ToggleRight } from 'lucide-react'
import { useUsuarios, useUpdateUsuario } from '../hooks/useUsuarios'
import { useEscritorios } from '../hooks/useEscritorios'
import { useAuth } from '../context/AuthContext'
import { Modal } from '../components/Modal'
import { Badge } from '../components/Badge'
import { Button, Input } from '../components/UI'
import { Topbar } from '../components/TopBar'
import { PageBanner } from '../components/PageBanner'
import type { Usuario } from '../types'

type FormData = { nome: string; email: string; senha?: string; oab?: string }

export function EquipeEscritorioPage() {
  const { data: usuarios = [], isLoading, isError, error: usuariosError } = useUsuarios()
  const update = useUpdateUsuario()
  const { user } = useAuth()
  const { data: escritorios = [] } = useEscritorios()
  const escritorio = escritorios.find((item) => item.id === user?.escritorioId)
    ?? escritorios.find((item) => item.tenantId === user?.tenantId)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [open, setOpen] = useState(false)
  const [associationOpen, setAssociationOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormData>()
  const advogados = usuarios.filter((usuario) => usuario.role === 'advogado')
  const active = advogados.filter((usuario) => usuario.ativo).length
  const close = () => { setOpen(false); setEditing(null) }
  const openEdit = (usuario: Usuario) => { update.reset(); reset({ nome: usuario.nome, email: usuario.email, oab: usuario.oab ?? '' }); setEditing(usuario); setOpen(true) }
  const submit = (data: FormData) => {
    const payload = { ...data, senha: data.senha || undefined }
    if (editing) update.mutate({ id: editing.id, data: payload }, { onSuccess: close })
  }
  const copyAssociationCode = async () => {
    if (!escritorio?.codigo) return
    try {
      await navigator.clipboard.writeText(escritorio.codigo)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return <div className="flex h-screen flex-col bg-gray-50">
    {isError && <p className="mx-6 mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{(usuariosError as any)?.response?.data?.detail ?? 'A conta precisa ter permissao e vinculo com um escritorio para carregar a equipe.'}</p>}
    <Topbar title="" hideModuleBar />
    <div className="flex-1 space-y-5 overflow-y-auto p-6 md:p-8">
      <PageBanner
        title="Equipe de Advogados"
        description={`${active}/${escritorio?.limiteAdvogados ?? 3} advogados ativos no escritório`}
        action={<Button icon={<Link2 size={15} />} onClick={() => setAssociationOpen(true)}>Associe Advogados</Button>}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
        <strong className="text-slate-900">Acesso da equipe</strong>
        <p className="mt-1">Cada advogado entra com seu próprio e-mail e senha e visualiza apenas os processos e clientes vinculados à própria conta. O limite padrão deste escritório é de 3 advogados ativos.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr>{['Advogado', 'E-mail', 'OAB', 'Status', 'Ações'].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Carregando equipe…</td></tr>
              : isError ? <tr><td colSpan={5} className="px-5 py-10 text-center text-rose-600">Não foi possível carregar os associados.</td></tr>
              : advogados.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Nenhum advogado associado.</td></tr>
              : advogados.map((usuario) => <tr key={usuario.id} className="text-slate-700">
                <td className="px-5 py-4 font-semibold">{usuario.nome}</td><td className="px-5 py-4">{usuario.email}</td><td className="px-5 py-4">{usuario.oab || '—'}</td>
                <td className="px-5 py-4"><Badge label={usuario.ativo ? 'Ativo' : 'Inativo'} variant={usuario.ativo ? 'green' : 'red'} /></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2">
                  <button title="Editar advogado" aria-label={`Editar ${usuario.nome}`} onClick={() => openEdit(usuario)} className="rounded-lg bg-indigo-50 p-2 text-indigo-600"><Pencil size={16} /></button>
                  <button title={usuario.ativo ? 'Inativar advogado' : 'Reativar advogado'} aria-label={usuario.ativo ? `Inativar ${usuario.nome}` : `Reativar ${usuario.nome}`} onClick={() => update.mutate({ id: usuario.id, data: { ativo: !usuario.ativo } })} className="rounded-lg bg-slate-100 p-2 text-slate-600">{usuario.ativo ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}</button>
                </div></td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>
    {associationOpen && <Modal title="Associe Advogados" subtitle="Compartilhe o código de associação com os advogados do escritório." onClose={() => setAssociationOpen(false)} size="sm">
      <div className="space-y-5 text-sm text-slate-600">
        <p>Peça ao advogado para entrar na própria conta e informar este código na opção de associação a um escritório. Assim, ele poderá solicitar o vínculo com sua equipe.</p>
        {escritorio?.codigo ? <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <code className="break-all text-lg font-bold tracking-wider text-slate-900">{escritorio.codigo}</code>
          <button type="button" onClick={copyAssociationCode} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100" aria-label="Copiar código de associação">
            {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copiado' : 'Copiar'}
          </button>
        </div> : <p className="rounded-xl bg-amber-50 p-3 text-amber-800" role="status">O código de associação não está disponível. Entre em contato com o suporte.</p>}
        <p className="text-xs text-slate-500">O advogado deve inserir o código no ambiente dele. A associação respeita o limite de vagas configurado para o escritório.</p>
      </div>
    </Modal>}
    {open && editing && <Modal title="Editar advogado" subtitle="O acesso é individual e restrito aos dados deste advogado." onClose={close}>
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <Input label="Nome completo" {...register('nome', { required: true })} required />
        <Input label="E-mail de acesso" {...register('email', { required: true })} type="email" required />
        <Input label="Nova senha (opcional)" {...register('senha', { minLength: 6 })} type="password" minLength={6} />
        <Input label="OAB (opcional)" {...register('oab')} />
        {update.isError && <p className="text-sm text-rose-600" role="alert">{(update.error as any)?.response?.data?.detail ?? 'Não foi possível salvar o advogado.'}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><Button type="button" variant="secondary" onClick={close}>Cancelar</Button><Button type="submit" loading={update.isPending}>Salvar</Button></div>
      </form>
    </Modal>}
  </div>
}
