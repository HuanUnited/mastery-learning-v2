import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ViewDensity = 'comfortable' | 'compact'

interface BaseViewProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  density?: ViewDensity
  className?: string
}

export function BaseView({
  title,
  subtitle,
  actions,
  children,
  maxWidth = '6xl',
  density = 'comfortable',
  className
}: BaseViewProps) {
  const isCompact = density === 'compact'
  
  const spacing = isCompact ? 'space-y-2' : 'space-y-4'
  const padding = isCompact ? 'p-3' : 'p-4'
  const headerGap = isCompact ? 'gap-2' : 'gap-3'

  return (
    <div className={cn(
      `max-w-${maxWidth} mx-auto`,
      padding,
      spacing,
      className
    )}>
      {/* Header */}
      <div className={cn('flex items-start justify-between', headerGap)}>
        <div className="flex-1 min-w-0">
          <h2 className={cn(
            'font-bold',
            isCompact ? 'text-xl' : 'text-2xl'
          )}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn(
              'text-muted-foreground',
              isCompact ? 'text-xs mt-0.5' : 'text-sm mt-1'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  )
}
