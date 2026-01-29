import type { MouseEventHandler, ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

type RankingLinkButtonProps = {
  to: string
  params?: Record<string, string>
  size?: 'default' | 'sm'
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  children: ReactNode
}

export function RankingLinkButton({
  to,
  params,
  size = 'sm',
  className,
  onClick,
  children,
}: RankingLinkButtonProps) {
  return (
    <Link to={to} params={params} onClick={onClick}>
      <Button variant="outline" size={size} className={className}>
        {children}
      </Button>
    </Link>
  )
}
