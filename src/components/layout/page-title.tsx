import { cn } from '@/lib/utils'

type PageTitleProps = {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return <h1 className={cn('text-2xl font-bold mb-6', className)}>{children}</h1>
}
