import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

type NavigationProps = {
  prev?: {
    label: string
    path: string
    disabled?: boolean
  }
  next?: {
    label: string
    path: string
    disabled?: boolean
  }
}

export function Navigation({ prev, next }: NavigationProps) {
  return (
    <div className="flex items-center gap-2">
      {prev && (
        <Button variant="outline" size="sm" asChild disabled={prev.disabled}>
          <Link to={prev.path}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {prev.label}
          </Link>
        </Button>
      )}

      {next && (
        <Button variant="outline" size="sm" asChild disabled={next.disabled}>
          <Link to={next.path}>
            {next.label}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  )
}
