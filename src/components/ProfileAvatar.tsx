import { BookOpen, Gavel, Landmark, Scale, type LucideIcon } from 'lucide-react'
import type { AuthUser } from '../types'

export const PROFILE_AVATARS: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: 'scale', label: 'Balança da justiça', icon: Scale },
  { id: 'gavel', label: 'Martelo jurídico', icon: Gavel },
  { id: 'book', label: 'Livro jurídico', icon: BookOpen },
  { id: 'courthouse', label: 'Tribunal', icon: Landmark },
]

interface Props {
  user: Pick<AuthUser, 'nome' | 'avatarUrl' | 'avatarId'> | null | undefined
  className: string
  iconSize?: number
}

export function ProfileAvatar({ user, className, iconSize = 18 }: Props) {
  const avatar = PROFILE_AVATARS.find((option) => option.id === user?.avatarId)
  const Icon = avatar?.icon
  const initials = user?.nome?.split(' ').map((part) => part[0]).slice(0, 2).join('') ?? '?'

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-[#087E96] font-bold text-white ${className}`}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={`Foto de ${user.nome}`} className="h-full w-full object-cover" />
      ) : Icon ? (
        <Icon size={iconSize} aria-label={avatar.label} />
      ) : (
        initials
      )}
    </div>
  )
}
