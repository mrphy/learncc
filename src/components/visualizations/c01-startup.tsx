'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const stages = [
  { label: '预取', sub: 'prefetch model', color: 'bg-blue-500' },
  { label: 'Import', sub: '加载模块', color: 'bg-blue-400' },
  { label: 'Init', sub: '初始化系统', color: 'bg-blue-500' },
  { label: 'Config', sub: '读取配置', color: 'bg-emerald-500' },
  { label: 'REPL', sub: '进入交互循环', color: 'bg-emerald-400' },
]

const steps = [
  { title: '启动入口', desc: 'bin/claude.cjs → cli.ts main() 被调用' },
  { title: '预取模型', desc: '并行发起 prefetch 请求, 减少首次响应等待' },
  { title: '模块加载', desc: '动态 import 核心模块, 完成依赖注入' },
  { title: '系统初始化', desc: '初始化配置、权限、MCP 连接等子系统' },
  { title: '进入 REPL', desc: 'startInteractiveMode() 开始用户交互循环' },
]

export default function C01Startup({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="relative flex items-center justify-between gap-2 py-8 px-4">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-2">
            <motion.div
              className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-xl text-white text-xs font-bold shadow-lg ${stage.color}`}
              initial={{ opacity: 0.15, scale: 0.85 }}
              animate={{
                opacity: i <= viz.currentStep ? 1 : 0.15,
                scale: i === viz.currentStep ? 1.1 : i < viz.currentStep ? 1 : 0.85,
              }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-sm">{stage.label}</span>
              <span className="text-[10px] opacity-70 mt-0.5">{stage.sub}</span>
              {i === viz.currentStep && (
                <motion.div
                  className="absolute -inset-1 rounded-xl border-2 border-white/40"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
            {i < stages.length - 1 && (
              <motion.span
                className="text-lg font-bold"
                animate={{
                  opacity: i < viz.currentStep ? 1 : 0.2,
                  color: i < viz.currentStep ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                →
              </motion.span>
            )}
          </div>
        ))}
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
