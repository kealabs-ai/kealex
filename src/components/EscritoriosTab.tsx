import { useState, type FormEvent } from 'react'
import { Building2, Eye, KeyRound, Pencil, Plus, Users } from 'lucide-react'
import type { Escritorio } from '../api/escritorios'
import { useCreateEscritorio, useCreateEscritorioAccess, useEscritorios, useUpdateEscritorio } from '../hooks/useEscritorios'
import { Modal } from './Modal'
import { Badge } from './Badge'
import { Button, Input } from './UI'

export function EscritoriosTab() {
  const { data: escritorios = [], isLoading, isError } = useEscritorios()
  const create = useCreateEscritorio()
  const createAccess = useCreateEscritorioAccess()
  const update = useUpdateEscritorio()
  const [viewing, setViewing] = useState<Escritorio | null>(null)
  const [accessing, setAccessing] = useState<Escritorio | null>(null)
  const [emailAcesso, setEmailAcesso] = useState('')
  const [senhaAcesso, setSenhaAcesso] = useState('')
  const [editing, setEditing] = useState<Escritorio | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [novoCnpj, setNovoCnpj] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoTelefone, setNovoTelefone] = useState('')
  const [novoEndereco, setNovoEndereco] = useState('')
  const [novoEmailAcesso, setNovoEmailAcesso] = useState('')
  const [novaSenhaAcesso, setNovaSenhaAcesso] = useState('')
  const [nome, setNome] = useState('')
  const [limite, setLimite] = useState('3')
  const [saveError, setSaveError] = useState('')

  function openCreate() {
    create.reset()
    setNovoNome('')
    setNovoCnpj('')
    setNovoEmail('')
    setNovoTelefone('')
    setNovoEndereco('')
    setNovoEmailAcesso('')
    setNovaSenhaAcesso('')
    setCreateOpen(true)
  }

  function saveNew(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nome = novoNome.trim()
    if (!nome) return
    create.mutate({
      nome,
      emailAcesso: novoEmailAcesso.trim(),
      senhaInicial: novaSenhaAcesso,
      limiteAdvogados: 3,
      cnpj: novoCnpj.trim() || undefined,
      email: novoEmail.trim() || undefined,
      telefone: novoTelefone.trim() || undefined,
      endereco: novoEndereco.trim() || undefined,
    }, {
      onSuccess: () => setCreateOpen(false),
    })
  }

  function openEdit(escritorio: Escritorio) {
    setEditing(escritorio)
    setNome(escritorio.nome)
    setLimite(String(escritorio.limiteAdvogados ?? 3))
    setSaveError('')
  }

  function saveAccess(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accessing) return
    createAccess.mutate({ escritorioId: accessing.id, emailAcesso: emailAcesso.trim(), senhaInicial: senhaAcesso }, {
      onSuccess: () => setAccessing(null),
    })
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const limiteAdvogados = Number(limite)
    if (!Number.isInteger(limiteAdvogados) || limiteAdvogados < 1) {
      setSaveError('O limite precisa ser um número inteiro maior que zero.')
      return
    }
    update.mutate({ id: editing.id, data: { nome: nome.trim(), limiteAdvogados } }, {
      onSuccess: () => setEditing(null),
      onError: (error: any) => setSaveError(error.response?.data?.detail ?? 'Não foi possível salvar as alterações.'),
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-300"><Building2 size={21} /></span>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Escritórios</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie os escritórios e os limites de usuários associados.</p>
          </div>
        </div>
        <Button icon={<Plus size={16} />} onClick={openCreate}>Adicionar escritório</Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <tr>
              {['Nome do Escritório', 'Advogados ativos', 'Limite de Advogados', 'Status', 'Ações'].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Carregando escritórios…</td></tr>
            ) : isError ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-rose-600" role="alert">Não foi possível carregar os escritórios.</td></tr>
            ) : escritorios.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Nenhum escritório cadastrado.</td></tr>
            ) : escritorios.map((escritorio) => {
              const limiteAtual = escritorio.limiteAdvogados ?? 3
              const usuariosAtivos = escritorio.usuariosAtivos ?? 0
              const advogadosAtivos = escritorio.advogadosAtivos ?? 0
              const percentual = limiteAtual > 0 ? Math.min(100, usuariosAtivos / limiteAtual * 100) : 0
              return (
                <tr key={escritorio.id} className="text-slate-700 dark:text-slate-200">
                  <td className="px-5 py-4 font-semibold">{escritorio.nome}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2"><Users size={15} className="text-slate-400" />{advogadosAtivos}</div>
                    <div className="mt-2 w-40 max-w-full">
                      <div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>Uso do limite</span><span>{usuariosAtivos}/{limiteAtual} usuários</span></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${percentual >= 100 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${percentual}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-5 py-4">{limiteAtual}</td>
                  <td className="px-5 py-4"><Badge label={escritorio.ativo ? 'Ativo' : 'Inativo'} variant={escritorio.ativo ? 'green' : 'red'} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setViewing(escritorio)} aria-label={`Visualizar ${escritorio.nome}`} title="Visualizar" className="rounded-lg bg-cyan-50 p-2 text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300"><Eye size={16} /></button>
                      {!escritorio.acessoConfigurado && <button type="button" onClick={() => { createAccess.reset(); setEmailAcesso(''); setSenhaAcesso(''); setAccessing(escritorio) }} aria-label={`Criar acesso para ${escritorio.nome}`} title="Criar acesso do escritório" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"><KeyRound size={16} /></button>}
                      <button type="button" onClick={() => openEdit(escritorio)} aria-label={`Editar ${escritorio.nome}`} title="Editar" className="rounded-lg bg-indigo-50 p-2 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300"><Pencil size={16} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {viewing && (
        <Modal title={viewing.nome} subtitle="Detalhes do escritório" onClose={() => setViewing(null)} size="sm">
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p><strong>Status:</strong> {viewing.ativo ? 'Ativo' : 'Inativo'}</p>
            <p><strong>Código de associação:</strong> <code className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">{viewing.codigo}</code></p>
            <p><strong>Advogados ativos:</strong> {viewing.advogadosAtivos ?? 0}</p>
            <p><strong>Usuários ativos associados:</strong> {viewing.usuariosAtivos ?? 0} de {viewing.limiteAdvogados ?? 3}</p>
            {viewing.email && <p><strong>E-mail:</strong> {viewing.email}</p>}
            {viewing.telefone && <p><strong>Telefone:</strong> {viewing.telefone}</p>}
          </div>
        </Modal>
      )}

      {accessing && (
        <Modal title="Criar acesso do escritório" subtitle={accessing.nome} onClose={() => setAccessing(null)} size="sm">
          <form onSubmit={saveAccess} className="space-y-4">
            <Input label="E-mail de acesso" type="email" value={emailAcesso} onChange={(event) => setEmailAcesso(event.target.value)} required />
            <Input label="Senha inicial (mín. 6 caracteres)" type="password" minLength={6} value={senhaAcesso} onChange={(event) => setSenhaAcesso(event.target.value)} required />
            {createAccess.isError && <p className="text-sm text-rose-600" role="alert">{(createAccess.error as any)?.response?.data?.detail ?? 'Não foi possível criar o acesso.'}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800"><Button type="button" variant="secondary" onClick={() => setAccessing(null)}>Cancelar</Button><Button type="submit" loading={createAccess.isPending}>Criar credenciais</Button></div>
          </form>
        </Modal>
      )}

      {createOpen && (
        <Modal title="Adicionar escritório" subtitle="Crie o cadastro e as credenciais do administrador do escritório." onClose={() => setCreateOpen(false)} size="md">
          <form onSubmit={saveNew} className="space-y-4">
            <Input label="Nome do Escritório" value={novoNome} onChange={(event) => setNovoNome(event.target.value)} required autoFocus />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="E-mail de acesso" type="email" value={novoEmailAcesso} onChange={(event) => setNovoEmailAcesso(event.target.value)} required />
              <Input label="Senha inicial (mín. 6 caracteres)" type="password" minLength={6} value={novaSenhaAcesso} onChange={(event) => setNovaSenhaAcesso(event.target.value)} required />
            </div>
            <p className="text-xs text-slate-500">A senha será armazenada como hash seguro. O administrador poderá entrar com este e-mail e senha. Limite inicial: 3 advogados ativos.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="CNPJ" value={novoCnpj} onChange={(event) => setNovoCnpj(event.target.value)} />
              <Input label="E-mail" type="email" value={novoEmail} onChange={(event) => setNovoEmail(event.target.value)} />
              <Input label="Telefone" value={novoTelefone} onChange={(event) => setNovoTelefone(event.target.value)} />
              <Input label="Endereço" value={novoEndereco} onChange={(event) => setNovoEndereco(event.target.value)} />
            </div>
            {create.isError && <p className="text-sm text-rose-600" role="alert">{(create.error as any)?.response?.data?.detail ?? 'Não foi possível criar o escritório.'}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={create.isPending}>Criar escritório</Button>
            </div>
          </form>
        </Modal>
      )}

      {editing && (
        <Modal title="Editar escritório" subtitle={editing.nome} onClose={() => setEditing(null)} size="sm">
          <form onSubmit={save} className="space-y-4">
            <Input label="Nome do Escritório" value={nome} onChange={(event) => setNome(event.target.value)} required />
            <Input label="Limite de Advogados / Usuários" type="number" min={1} step={1} value={limite} onChange={(event) => setLimite(event.target.value)} required />
            {saveError && <p className="text-sm text-rose-600" role="alert">{saveError}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button type="submit" loading={update.isPending}>Salvar alterações</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
