'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'
import { CHAPTER_META, LAYER_GROUPS, LAYERS } from '@/lib/constants'
import type { Layer } from '@/lib/constants'

const DOT_COLORS: Record<Layer, string> = {
  foundation: 'bg-blue-500',
  engine: 'bg-emerald-500',
  tools: 'bg-amber-500',
  security: 'bg-purple-500',
  integration: 'bg-red-500',
  'ui-state': 'bg-slate-500',
}

const ACTIVE_BG: Record<Layer, string> = {
  foundation: 'bg-blue-500/10 dark:bg-blue-500/15',
  engine: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  tools: 'bg-amber-500/10 dark:bg-amber-500/15',
  security: 'bg-purple-500/10 dark:bg-purple-500/15',
  integration: 'bg-red-500/10 dark:bg-red-500/15',
  'ui-state': 'bg-slate-500/10 dark:bg-slate-500/15',
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:block w-56 shrink-0">
      <nav className="sticky top-[calc(3.5rem+1px)] max-h-[calc(100vh-3.5rem-1px)] overflow-y-auto py-6 pr-4 space-y-6">
        {LAYER_GROUPS.map(({ layer, chapters }) => (
          <div key={layer}>
            {/* Layer header */}
            <div className="flex items-center gap-2 px-3 mb-1.5">
              <div className={cn('w-2 h-2 rounded-full', DOT_COLORS[layer])} />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {LAYERS[layer].label}
              </span>
            </div>

            {/* Chapter links */}
            <ul className="space-y-0.5">
              {chapters.map((chId) => {
                const ch = CHAPTER_META[chId]
                if (!ch) return null
                const isActive = pathname === `/${ch.id}`
                return (
                  <li key={ch.id}>
                    <Link
                      href={`/${ch.id}`}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? cn('font-medium text-[var(--color-text)]', ACTIVE_BG[layer])
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]'
                      )}
                    >
                      <span className="text-xs text-[var(--color-text-muted)] font-mono w-6">
                        {ch.id.toUpperCase().replace('C', '')}
                      </span>
                      <span className="truncate">{ch.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
