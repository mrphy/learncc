'use client'

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StepControlsProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  isPlaying: boolean
  onToggleAutoPlay: () => void
  stepTitle?: string
  stepDescription?: string
}

export default function StepControls({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
  isPlaying,
  onToggleAutoPlay,
  stepTitle,
  stepDescription,
}: StepControlsProps) {
  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors"
            title="重置"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onPrev}
            disabled={currentStep <= 0}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-30"
            title="上一步"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleAutoPlay}
            className={cn(
              'p-2 rounded-lg transition-colors',
              isPlaying
                ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]'
            )}
            title={isPlaying ? '暂停' : '自动播放'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={onNext}
            disabled={currentStep >= totalSteps - 1}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors disabled:opacity-30"
            title="下一步"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === currentStep
                  ? 'bg-[var(--color-accent)] scale-125'
                  : i < currentStep
                    ? 'bg-[var(--color-accent)]/40'
                    : 'bg-[var(--color-border)]'
              )}
            />
          ))}
        </div>

        {/* Step counter */}
        <span className="text-xs font-mono text-[var(--color-text-muted)]">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      {/* Step annotation */}
      {(stepTitle || stepDescription) && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
          {stepTitle && (
            <div className="text-sm font-semibold text-[var(--color-text)]">{stepTitle}</div>
          )}
          {stepDescription && (
            <div className="text-sm text-[var(--color-text-secondary)] mt-0.5">{stepDescription}</div>
          )}
        </div>
      )}
    </div>
  )
}
