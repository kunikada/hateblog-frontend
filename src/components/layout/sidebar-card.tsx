import { cn } from '@/lib/utils'

type SidebarCardProps = {
  title: string
  children: React.ReactNode
  className?: string
}

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <h3 className="font-semibold text-lg mb-3">{title}</h3>
      {children}
    </div>
  )
}
