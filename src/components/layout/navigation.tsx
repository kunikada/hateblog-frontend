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
      {prev &&
        (prev.disabled ? (
          <Button variant="outline" size="sm" disabled className="bg-card text-gray-600 border-gray-300">
            <ChevronLeft className="h-4 w-4 mr-1" />
            {prev.label}
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild className="bg-card text-gray-600 border-gray-300">
            <Link to={prev.path}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {prev.label}
            </Link>
          </Button>
        ))}

      {next &&
        (next.disabled ? (
          <Button variant="outline" size="sm" disabled className="bg-card text-gray-600 border-gray-300">
            {next.label}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild className="bg-card text-gray-600 border-gray-300">
            <Link to={next.path}>
              {next.label}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ))}
    </div>
  )
}
