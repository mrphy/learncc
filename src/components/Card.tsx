import { cn } from '@/lib/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-theme',
        hover && 'hover:border-[var(--color-accent)]/30 hover:shadow-lg hover:shadow-[var(--color-accent)]/5 transition-all duration-200',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-[var(--color-text)]', className)}>
      {children}
    </h3>
  )
}
