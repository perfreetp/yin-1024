interface EmptyProps {
  icon?: string
  title: string
  description?: string
}

export default function Empty({ icon = '📭', title, description }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-base font-medium text-[var(--color-text-secondary)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-text-muted)] mt-1 text-center">{description}</p>}
    </div>
  )
}
