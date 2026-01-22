import { cn } from '@/lib/utils'

type PageTitleProps = {
  children: React.ReactNode
  className?: string
}

export function PageTitle({ children, className }: PageTitleProps) {
  return <h1 className={cn('text-xl font-bold mb-4', className)}>{children}</h1>
}
