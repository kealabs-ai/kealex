import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Building2, User, CheckCircle2, Loader2 } from 'lucide-react'
import { Modal } from './Modal'
import { escritoriosApi } from '../api/escritorios'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

interface Props {
  open: boolean
  onClose: () => void
}

export function ModalidadeModal({ open, onClose }: Props) {
  const { user, updateUser } = useAuth()
  const { success, error } = useToast()
  const [selected, setSelected] = useState<'autonomo' | 'escritorio'>(
    user?.modalidade === 'escritorio' ? 'escritorio' : 'autonomo'
  )
  const [escritorioId, setEscritorioId] = useState<string>(user?.escritorioId ?? '')

  const { data: escritorios = [] } = useQuery({
    queryKey: ['escritorios'],
    queryFn: escritoriosApi.list,
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/v1/lex/usuarios/modalidade', {
        escritorioId: selected === 'escritorio' ? escritorioId || null : null,
      }).then((r) => r.data),
    onSuccess: () => {
      updateUser({
        modalidade: selected,
        escritorioId: selected === 'escritorio' ? escritorioId : undefined,
      })
      success(
        selected === 'escritorio'
          ? 'Associado ao escritório com sucesso!'
          : 'Modo autônomo ativado com sucesso!'
      )
      onClose()
    },
    onError: () => error('Erro ao alterar modalidade. Tente novamente.'),
  })

  const canSave =
    selected === 'autonomo' || (selected === 'escritorio' && escritorioId)

  if (!open) return null

  return (
    <Modal
      title="Modalidade de uso"
      subtitle="Escolha como deseja usar o Kealex"
      onClose={onClose}
      size="sm"
    >
      <div className="space-y-3">
        {/* Opção autônomo */}
        <button
          type="button"
          onClick={() => setSelected('autonomo')}
          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
            selected === 'autonomo'
              ? 'border-[#00C2A8] bg-[#00C2A8]/5'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <User size={20} className="text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Autônomo</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Gerencie seus processos de forma independente, sem vínculo com escritório.
            </p>
          </div>
          {selected === 'autonomo' && (
            <CheckCircle2 size={18} className="text-[#00C2A8] shrink-0 mt-0.5" />
          )}
        </button>

        {/* Opção escritório */}
        <button
          type="button"
          onClick={() => setSelected('escritorio')}
          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
            selected === 'escritorio'
              ? 'border-[#00C2A8] bg-[#00C2A8]/5'
              : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm">Associado a Escritório</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Vincule-se a um escritório e compartilhe acesso com permissões definidas pelo administrador.
            </p>
          </div>
          {selected === 'escritorio' && (
            <CheckCircle2 size={18} className="text-[#00C2A8] shrink-0 mt-0.5" />
          )}
        </button>

        {/* Seletor de escritório */}
        {selected === 'escritorio' && (
          <div className="pt-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Selecione o escritório
            </label>
            {escritorios.length === 0 ? (
              <p className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg">
                Nenhum escritório cadastrado. Peça ao administrador para criar um.
              </p>
            ) : (
              <select
                value={escritorioId}
                onChange={(e) => setEscritorioId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#00C2A8] focus:ring-2 focus:ring-[#00C2A8]/10 transition-all"
              >
                <option value="">Escolha um escritório...</option>
                {escritorios.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSave || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#F96313] hover:bg-[#e0550f] disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}
