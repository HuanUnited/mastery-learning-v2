import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ViewCardProps {
  title?: string
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  children: ReactNode
  density?: 'comfortable' | 'compact'
  className?: string
  onClick?: () => void
}

export function ViewCard({
  title,
  badge,
  badgeVariant = 'secondary',
  children,
  density = 'comfortable',
  className,
  onClick
}: ViewCardProps) {
  const isCompact = density === 'compact'
  const padding = isCompact ? 'p-2' : 'p-3'
  const spacing = isCompact ? 'space-y-1' : 'space-y-2'

  return (
    <Card 
      className={cn(
        padding,
        spacing,
        onClick && 'cursor-pointer hover:border-primary/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            'font-semibold truncate',
            isCompact ? 'text-xs' : 'text-sm'
          )}>
            {title}
          </h4>
          {badge !== undefined && (
            <Badge 
              variant={badgeVariant}
              className={cn(
                'shrink-0',
                isCompact ? 'text-[10px] px-1.5 py-0' : 'text-xs'
              )}
            >
              {badge}
            </Badge>
          )}
        </div>
      )}
      {children}
    </Card>
  )
}
