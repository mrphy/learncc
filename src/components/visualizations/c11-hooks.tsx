'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const phases = [
  { label: 'PreToolUse', sub: '执行前拦截', color: 'bg-purple-400', position: 'left' },
  { label: '工具执行', sub: 'tool.call()', color: 'bg-amber-500', position: 'center' },
  { label: 'PostToolUse', sub: '执行后处理', color: 'bg-purple-500', position: 'right' },
]

const hookActions = ['approve', 'deny', 'modify', 'passthrough']

const steps = [
  { title: 'Hook 机制概览', desc: 'settings.json 中定义 hooks, 在工具执行前后注入自定义逻辑' },
  { title: 'PreToolUse', desc: '执行前触发, 可返回 approve/deny/modify 拦截或修改参数' },
  { title: '工具执行', desc: 'Hook 放行后, 执行实际的 tool.call() 方法' },
  { title: 'PostToolUse', desc: '执行后触发, 可修改 tool_result 或执行附加检查' },
  { title: 'Hook 决策流', desc: '多个 Hook 按优先级执行, 第一个非 passthrough 结果生效' },
]

export default function C11Hooks({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* Three-phase pipeline */}
        <div className="flex items-center justify-center gap-3">
          {phases.map((phase, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                className={`${phase.color} text-white rounded-xl w-24 h-20 flex flex-col items-center justify-center shadow-lg text-center`}
                animate={{
                  opacity: i <= viz.currentStep - 1 || viz.currentStep === 0 ? 1 : 0.2,
                  scale: viz.currentStep - 1 === i ? 1.1 : 1,
                  y: viz.currentStep - 1 === i ? -5 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="text-xs font-bold">{phase.label}</span>
                <span className="text-[10px] opacity-60 mt-0.5">{phase.sub}</span>
              </motion.div>
              {i < phases.length - 1 && (
                <motion.span
                  className="text-lg font-bold text-[var(--color-text-muted)]"
                  animate={{ opacity: i < viz.currentStep ? 1 : 0.2 }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>

        {/* Hook actions */}
        <motion.div
          className="flex gap-2 justify-center"
          animate={{ opacity: viz.currentStep >= 4 ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {hookActions.map((action, i) => (
            <motion.div
              key={i}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-mono font-bold shadow-sm border ${
                action === 'deny'
                  ? 'bg-red-500/10 text-red-500 border-red-500/30'
                  : action === 'approve'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
              animate={{ opacity: viz.currentStep >= 4 ? 1 : 0, y: viz.currentStep >= 4 ? 0 : 8 }}
              transition={{ delay: i * 0.08 }}
            >
              {action}
            </motion.div>
          ))}
        </motion.div>
      </div>

      <StepControls
        currentStep={viz.currentStep}
        totalSteps={viz.totalSteps}
        onPrev={viz.prev}
        onNext={viz.next}
        onReset={viz.reset}
        isPlaying={viz.isPlaying}
        onToggleAutoPlay={viz.toggleAutoPlay}
        stepTitle={steps[viz.currentStep]?.title}
        stepDescription={steps[viz.currentStep]?.desc}
      />
    </div>
  )
}
