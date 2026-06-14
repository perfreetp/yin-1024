import { useAppStore } from '@/store/useAppStore'

interface AvatarProps {
  memberId?: string
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

const SIZE_MAP = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-10 h-10 text-xl',
  lg: 'w-14 h-14 text-2xl',
}

export default function Avatar({ memberId, size = 'md', showName = false }: AvatarProps) {
  const getMemberById = useAppStore(s => s.getMemberById)
  const member = memberId ? getMemberById(memberId) : undefined

  if (!member) {
    return <div className={`${SIZE_MAP[size]} rounded-full bg-cream-dark flex items-center justify-center`}>❓</div>
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`${SIZE_MAP[size]} rounded-full bg-cream flex items-center justify-center ring-2 ring-white shadow-sm`}>
        {member.avatar}
      </div>
      {showName && <span className="text-sm font-medium text-[var(--color-text)]">{member.name}</span>}
    </div>
  )
}
