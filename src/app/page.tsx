'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CHAPTER_META, LAYERS, LAYER_GROUPS, LEARNING_PATH } from '@/lib/constants'
import type { Layer } from '@/lib/constants'
import { Card } from '@/components/Card'
import { ArrowRight, BookOpen, Code2, Layers, Zap, Shield, Puzzle, Monitor } from 'lucide-react'

/* ─── Animation variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

/* ─── Layer → icon mapping ─── */
const LAYER_ICONS: Record<Layer, React.ElementType> = {
  foundation: Zap,
  engine: Code2,
  tools: Puzzle,
  security: Shield,
  integration: Layers,
  'ui-state': Monitor,
}

/* ─── Layer → Tailwind color config ─── */
const LAYER_COLORS: Record<Layer, { dot: string; bg: string; text: string; border: string; badge: string }> = {
  foundation: {
    dot: 'bg-blue-500',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  },
  engine: {
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  },
  tools: {
    dot: 'bg-amber-500',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  },
  security: {
    dot: 'bg-purple-500',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  },
  integration: {
    dot: 'bg-red-500',
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400',
  },
  'ui-state': {
    dot: 'bg-slate-500',
    bg: 'bg-slate-500/10',
    text: 'text-slate-500',
    border: 'border-slate-500/20',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400',
  },
}

/* ─── Stats data ─── */
const STATS = [
  { icon: BookOpen, value: '20', label: '章节', color: 'text-blue-500' },
  { icon: Layers, value: '7', label: '架构层', color: 'text-emerald-500' },
  { icon: Puzzle, value: '42+', label: '工具', color: 'text-amber-500' },
  { icon: Code2, value: '1900+', label: '源文件', color: 'text-purple-500' },
]

/* ═══════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="pb-20">
      {/* ────────────────────────────────────
          1. Hero Section
         ──────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Animated background gradient */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--color-accent)_0%,transparent_70%)] opacity-[0.07] blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,var(--layer-engine)_0%,transparent_70%)] opacity-[0.05] blur-3xl animate-[pulse_8s_ease-in-out_infinite_1s]" />
        </div>

        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Tag */}
          <motion.div variants={fadeInUp} custom={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3.5 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              基于 Claude Code v1.0 源码
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl"
            variants={fadeInUp}
            custom={1}
          >
            深入{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--layer-engine)] bg-clip-text text-transparent">
              Claude Code
            </span>{' '}
            源码
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-4 text-lg font-medium text-[var(--color-text-secondary)] sm:text-xl"
            variants={fadeInUp}
            custom={2}
          >
            从架构到实现，系统学习 AI 编程助手的内部原理
          </motion.p>

          {/* Description */}
          <motion.p
            className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base"
            variants={fadeInUp}
            custom={3}
          >
            涵盖{' '}
            <strong className="text-[var(--color-text-secondary)]">20 章深度解析</strong>、
            <strong className="text-[var(--color-text-secondary)]">7 层架构体系</strong>，
            覆盖约 <strong className="text-[var(--color-text-secondary)]">1900+ 源文件</strong>、
            <strong className="text-[var(--color-text-secondary)]">512K+ 行代码</strong>
            中的全部核心模块
          </motion.p>

          {/* CTA */}
          <motion.div className="mt-8" variants={fadeInUp} custom={4}>
            <Link
              href="/c01"
              className="group inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--color-accent)]/25 transition-all duration-200 hover:bg-[var(--color-accent-hover)] hover:shadow-xl hover:shadow-[var(--color-accent)]/30 hover:-translate-y-0.5"
            >
              <BookOpen className="h-4 w-4" />
              开始学习
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ────────────────────────────────────
          2. Core Stats Bar
         ──────────────────────────────────── */}
      <motion.section
        className="mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label} variants={fadeInUp} custom={i}>
              <Card className="text-center">
                <stat.icon className={`mx-auto h-6 w-6 ${stat.color}`} />
                <div className="mt-2 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ────────────────────────────────────
          3. Architecture Layers Overview
         ──────────────────────────────────── */}
      <motion.section
        className="mb-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
      >
        {/* Section header */}
        <motion.div className="mb-10 text-center" variants={fadeInUp} custom={0}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            七层架构体系
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            从启动基础到终端 UI，每一层都是深入理解的关键
          </p>
        </motion.div>

        {/* Layers */}
        <div className="space-y-12">
          {LAYER_GROUPS.map((group, gi) => {
            const layerInfo = LAYERS[group.layer]
            const colors = LAYER_COLORS[group.layer]
            const Icon = LAYER_ICONS[group.layer]

            return (
              <motion.div
                key={group.layer}
                variants={fadeInUp}
                custom={gi + 1}
              >
                {/* Layer header */}
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors.bg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--color-text)]">
                      {layerInfo.label}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {group.chapters.length} 章
                    </p>
                  </div>
                  <div className={`ml-auto h-px flex-1 max-w-[40%] ${colors.bg}`} />
                </div>

                {/* Chapter cards grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.chapters.map((chId) => {
                    const ch = CHAPTER_META[chId]
                    if (!ch) return null

                    return (
                      <Link key={chId} href={`/${chId}`} className="group block">
                        <Card hover className="h-full">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              {/* Chapter number + badge */}
                              <div className="mb-2 flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${colors.badge}`}>
                                  {chId.toUpperCase()}
                                </span>
                                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                              </div>

                              {/* Title & subtitle */}
                              <h4 className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                                {ch.title}
                              </h4>
                              <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
                                {ch.subtitle}
                              </p>

                              {/* Key insight */}
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--color-text-muted)]">
                                {ch.keyInsight}
                              </p>
                            </div>

                            {/* Arrow */}
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                          </div>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* ────────────────────────────────────
          4. Learning Path Section
         ──────────────────────────────────── */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={staggerContainer}
      >
        {/* Section header */}
        <motion.div className="mb-10 text-center" variants={fadeInUp} custom={0}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
            推荐学习路径
          </h2>
          <p className="mt-2 text-[var(--color-text-muted)]">
            按顺序阅读，循序渐进掌握整体架构
          </p>
        </motion.div>

        {/* Path timeline */}
        <div className="relative mx-auto max-w-3xl">
          {/* Vertical line (desktop) */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-[var(--color-accent)] via-[var(--layer-engine)] to-[var(--layer-ui-state)] opacity-20 sm:block" />

          <div className="space-y-3">
            {LEARNING_PATH.map((chId, i) => {
              const ch = CHAPTER_META[chId]
              if (!ch) return null

              const colors = LAYER_COLORS[ch.layer]
              const layerInfo = LAYERS[ch.layer]

              return (
                <motion.div
                  key={chId}
                  variants={fadeInUp}
                  custom={i * 0.3}
                >
                  <Link href={`/${chId}`} className="group block">
                    <div className="flex items-center gap-4 sm:gap-5">
                      {/* Step indicator */}
                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colors.border} ${colors.bg} transition-all group-hover:scale-110`}>
                          <span className={`text-sm font-bold ${colors.text}`}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-all group-hover:border-[var(--color-accent)]/30 group-hover:shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                            {ch.title}
                          </span>
                          <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:inline-flex ${colors.badge}`}>
                            {layerInfo.label}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)] line-clamp-1">
                          {ch.subtitle}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="hidden h-4 w-4 shrink-0 text-[var(--color-text-muted)] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 sm:block" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div className="mt-12 text-center" variants={fadeInUp} custom={8}>
          <Link
            href="/c01"
            className="group inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5 hover:text-[var(--color-accent)]"
          >
            从第一章开始
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </motion.section>
    </div>
  )
}
