'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpen, Code2, GitBranch, Play } from 'lucide-react'
import { CHAPTER_META, LEARNING_PATH } from '@/lib/constants'
import { chapters } from '@/data/chapters'
import LayerBadge from '@/components/LayerBadge'
import StickyTabs from '@/components/StickyTabs'
import CodeBlock from '@/components/CodeBlock'
import { Card } from '@/components/Card'
import { Suspense } from 'react'
import visualizations from '@/components/visualizations'

/* ─── Visualization loader ─── */
function VisualizationBlock({ chapterId }: { chapterId: string }) {
  const Comp = visualizations[chapterId]
  if (!Comp) return null

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <Play className="h-4 w-4 text-[var(--color-accent)]" />
        <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
          互动演示
        </span>
      </div>
      <div className="p-5">
        <Suspense
          fallback={
            <div className="flex flex-col gap-3 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-[var(--color-bg-tertiary)]" />
              <div className="h-40 rounded-lg bg-[var(--color-bg-tertiary)]" />
              <div className="h-4 w-1/2 rounded bg-[var(--color-bg-tertiary)]" />
            </div>
          }
        >
          <Comp />
        </Suspense>
      </div>
    </div>
  )
}

/* ─── Sticky tab definitions ─── */
const SECTION_TABS = [
  { id: 'learn', label: '学习', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'architecture', label: '架构', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'source', label: '源码', icon: <Code2 className="h-4 w-4" /> },
  { id: 'interactive', label: '互动', icon: <Play className="h-4 w-4" /> },
]

/* ═══════════════════════════════════════════════════════
   Chapter Content (Client Component)
   — All 4 sections render vertically, sticky tabs for anchor nav
   ═══════════════════════════════════════════════════════ */
export default function ChapterContent({ chapterId }: { chapterId: string }) {
  const meta = CHAPTER_META[chapterId]
  const chapter = chapters[chapterId]

  if (!meta || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-6xl font-black text-[var(--color-text-muted)] opacity-20">404</div>
        <h1 className="mt-4 text-2xl font-bold text-[var(--color-text)]">章节未找到</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          找不到章节 <code className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-sm font-mono">{chapterId}</code>
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)]"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    )
  }

  const currentIndex = LEARNING_PATH.indexOf(chapterId)
  const prevId = currentIndex > 0 ? LEARNING_PATH[currentIndex - 1] : null
  const nextId = currentIndex < LEARNING_PATH.length - 1 ? LEARNING_PATH[currentIndex + 1] : null
  const prevMeta = prevId ? CHAPTER_META[prevId] : null
  const nextMeta = nextId ? CHAPTER_META[nextId] : null
  const chapterNum = chapterId.replace('c', '').padStart(2, '0')

  return (
    <div className="pb-20">
      {/* ══════════════════════════════════
          Header
         ══════════════════════════════════ */}
      <header className="mb-6">
        <Link
          href="/"
          className="group mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-accent)]"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          返回目录
        </Link>

        <div className="flex items-center gap-3 mb-3">
          <LayerBadge layer={meta.layer} />
          <span className="text-sm font-mono font-semibold text-[var(--color-text-muted)]">
            第 {chapterNum} 章
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)] sm:text-4xl">
          {meta.title}
        </h1>

        <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
          {meta.subtitle}
        </p>

        {/* Key insight callout */}
        <div className="relative mt-6 rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              background: `linear-gradient(135deg, var(--layer-${meta.layer}), var(--color-accent))`,
            }}
          />
          <div className="relative px-5 py-4">
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `var(--layer-${meta.layer}-light)` }}
              >
                <BookOpen className="h-4 w-4" style={{ color: `var(--layer-${meta.layer})` }} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                  核心洞察
                </div>
                <p className="text-[15px] font-medium leading-relaxed text-[var(--color-text)]">
                  {meta.keyInsight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════
          Sticky Tab Bar (anchor nav)
         ══════════════════════════════════ */}
      <StickyTabs tabs={SECTION_TABS} />

      {/* ══════════════════════════════════
          Section 1: 学习
         ══════════════════════════════════ */}
      <section id="section-learn" className="chapter-section">
        <div className="section-header">
          <div className="section-header-icon bg-blue-500/10">
            <BookOpen className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h2 className="section-header-title">学习</h2>
            <p className="section-header-subtitle">概念讲解与核心设计分析</p>
          </div>
        </div>
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: chapter.content }} />
      </section>

      {/* ══════════════════════════════════
          Section 2: 架构
         ══════════════════════════════════ */}
      <section id="section-architecture" className="chapter-section">
        <div className="section-header">
          <div className="section-header-icon bg-emerald-500/10">
            <GitBranch className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h2 className="section-header-title">架构</h2>
            <p className="section-header-subtitle">模块关系与设计决策</p>
          </div>
        </div>
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: chapter.architecture }} />
      </section>

      {/* ══════════════════════════════════
          Section 3: 源码
         ══════════════════════════════════ */}
      <section id="section-source" className="chapter-section">
        <div className="section-header">
          <div className="section-header-icon bg-amber-500/10">
            <Code2 className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h2 className="section-header-title">源码</h2>
            <p className="section-header-subtitle">
              共 {chapter.codeExamples.length} 个关键代码示例
            </p>
          </div>
        </div>

        {chapter.codeExamples.length > 0 ? (
          <div className="space-y-8">
            {chapter.codeExamples.map((example: { title: string; code: string; language: string }, i: number) => (
              <div key={i} className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] font-bold text-white shadow-sm">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {i < chapter.codeExamples.length - 1 && (
                    <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-border)] to-transparent" />
                  )}
                </div>
                <CodeBlock code={example.code} language={example.language} title={example.title} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] py-12 text-center">
            <Code2 className="mx-auto h-8 w-8 text-[var(--color-text-muted)] opacity-40" />
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">暂无源码示例</p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════
          Section 4: 互动
         ══════════════════════════════════ */}
      <section id="section-interactive" className="chapter-section">
        <div className="section-header">
          <div className="section-header-icon bg-purple-500/10">
            <Play className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <h2 className="section-header-title">互动</h2>
            <p className="section-header-subtitle">步进式流程演示</p>
          </div>
        </div>

        {/* Inline visualization */}
        <div className="mb-8">
          <VisualizationBlock chapterId={chapterId} />
        </div>

        {/* Interactive text content */}
        <div className="prose-custom" dangerouslySetInnerHTML={{ __html: chapter.interactive }} />
      </section>

      {/* ══════════════════════════════════
          Source Files Reference
         ══════════════════════════════════ */}
      {meta.sourceFiles && meta.sourceFiles.length > 0 && (
        <section className="mt-12 mb-10">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="h-4 w-4 text-[var(--color-text-muted)]" />
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">相关源文件</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {meta.sourceFiles.map((file: string) => (
                <span
                  key={file}
                  className="inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2.5 py-1 text-xs font-mono text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/30"
                >
                  {file}
                </span>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* ══════════════════════════════════
          Bottom Prev / Next
         ══════════════════════════════════ */}
      <nav className="grid grid-cols-2 gap-4 pt-6 border-t border-[var(--color-border)]">
        {prevMeta ? (
          <Link
            href={`/${prevId}`}
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-[var(--color-text-muted)]">上一章</div>
              <div className="truncate text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">{prevMeta.title}</div>
            </div>
          </Link>
        ) : (
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:-translate-x-0.5" />
            <div className="min-w-0">
              <div className="text-xs text-[var(--color-text-muted)]">返回</div>
              <div className="truncate text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">目录首页</div>
            </div>
          </Link>
        )}
        {nextMeta ? (
          <Link
            href={`/${nextId}`}
            className="group flex items-center justify-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md text-right"
          >
            <div className="min-w-0">
              <div className="text-xs text-[var(--color-text-muted)]">下一章</div>
              <div className="truncate text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">{nextMeta.title}</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            href="/"
            className="group flex items-center justify-end gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md text-right"
          >
            <div className="min-w-0">
              <div className="text-xs text-[var(--color-text-muted)]">完成</div>
              <div className="truncate text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">返回目录</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)] transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </nav>
    </div>
  )
}
