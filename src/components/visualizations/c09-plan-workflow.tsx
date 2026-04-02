'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const modes = [
  { label: 'Normal', sub: '正常对话', color: 'bg-blue-500' },
  { label: 'Plan', sub: '规划模式', color: 'bg-amber-500' },
  { label: 'Implement', sub: '执行模式', color: 'bg-emerald-500' },
]

const steps = [
  { title: '正常模式', desc: 'Claude 可自由调用工具, 直接执行用户请求' },
  { title: '进入 Plan 模式', desc: '用户发送 /plan, 禁用写入类工具, 只允许分析' },
  { title: '制定计划', desc: 'Claude 输出结构化的 TodoWrite 计划, 不做实际修改' },
  { title: '切换到执行', desc: '用户确认后发送 "implement", 恢复全部工具权限' },
  { title: '循环迭代', desc: '执行后可再次进入 Plan 模式, 形成 Plan→Execute 循环' },
]

export default function C09PlanWorkflow({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const activeMode = viz.currentStep <= 1 ? 0 : viz.currentStep <= 3 ? viz.currentStep - 1 : 2

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-8 px-4">
        <div className="flex items-center justify-center gap-4">
          {modes.map((mode, i) => (
            <div key={i} className="flex items-center gap-4">
              <motion.div
                className={`${mode.color} text-white rounded-xl w-24 h-24 flex flex-col items-center justify-center shadow-lg`}
                animate={{
                  scale: activeMode === i ? 1.15 : 0.9,
                  opacity: activeMode === i ? 1 : 0.3,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="text-sm font-bold">{mode.label}</span>
                <span className="text-[10px] opacity-70 mt-0.5">{mode.sub}</span>
                {activeMode === i && (
                  <motion.div
                    className="mt-1 w-2 h-2 rounded-full bg-white"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {i < modes.length - 1 && (
                <motion.div className="flex flex-col items-center">
                  <motion.span
                    className="text-lg font-bold text-[var(--color-text-muted)]"
                    animate={{ opacity: activeMode >= i ? 0.8 : 0.2 }}
                  >
                    →
                  </motion.span>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Loop back arrow */}
        <motion.div
          className="text-center mt-4 text-xs font-bold text-amber-500"
          animate={{ opacity: viz.currentStep === 4 ? 1 : 0 }}
        >
          ↻ 可再次进入 Plan 模式迭代
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
