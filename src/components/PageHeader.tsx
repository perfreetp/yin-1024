import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
}

export default function PageHeader({ title, showBack = false, right }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-cream-dark">
      <div className="flex items-center justify-between h-12 px-4">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1 active:scale-90 transition-transform">
              <ArrowLeft className="w-5 h-5 text-[var(--color-text)]" />
            </button>
          )}
          <h1 className="text-lg font-bold text-[var(--color-text)]">{title}</h1>
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
