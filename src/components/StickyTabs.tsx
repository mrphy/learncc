'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/cn'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
}

interface StickyTabsProps {
  tabs: Tab[]
}

export default function StickyTabs({ tabs }: StickyTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '')

  /* ── Scroll spy: track which section is in view ── */
  const handleScroll = useCallback(() => {
    // Header is 3.5rem (56px), sticky tabs bar is ~2.75rem (44px)
    const offset = 56 + 44 + 24 // header + tabs + gap

    for (let i = tabs.length - 1; i >= 0; i--) {
      const el = document.getElementById(`section-${tabs[i].id}`)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= offset) {
          setActiveId(tabs[i].id)
          return
        }
      }
    }
    // Fallback to first tab
    setActiveId(tabs[0]?.id ?? '')
  }, [tabs])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial check
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /* ── Click handler: smooth scroll to section ── */
  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`)
    if (el) {
      const offset = 56 + 44 + 16 // header + tabs + small gap
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div className="sticky-tabs-bar">
      <div className="sticky-tabs-inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => scrollTo(tab.id)}
            className={cn(
              'sticky-tab-item',
              activeId === tab.id && 'sticky-tab-active'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
