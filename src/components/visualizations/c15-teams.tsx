'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const workers = [
  { label: 'Worker 1', task: '前端组件', color: 'bg-red-400' },
  { label: 'Worker 2', task: 'API 接口', color: 'bg-red-400' },
  { label: 'Worker 3', task: '测试用例', color: 'bg-red-400' },
  { label: 'Worker 4', task: '文档更新', color: 'bg-red-400' },
]

const steps = [
  { title: '协调者启动', desc: 'Coordinator Agent 接收复杂任务, 分析并拆解' },
  { title: '任务分配', desc: '通过 TaskCreate 创建子任务, 分配给 Worker Agent' },
  { title: '并行执行', desc: '多个 Worker 独立运行, 各自拥有独立上下文和工具' },
  { title: '状态同步', desc: '通过 TaskList/TaskUpdate 查询进度, 协调依赖关系' },
  { title: '结果汇总', desc: '所有 Worker 完成后, Coordinator 汇总并返回最终结果' },
]

export default function C15Teams({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Coordinator */}
          <motion.div
            className="bg-red-500 text-white rounded-xl w-36 h-14 flex flex-col items-center justify-center shadow-lg"
            animate={{ scale: viz.currentStep === 0 ? 1.1 : 1 }}
          >
            <span className="text-xs font-bold">Coordinator</span>
            <span className="text-[10px] opacity-60">协调者</span>
          </motion.div>

          {/* Distribution arrows */}
          <motion.div
            className="flex gap-6 text-sm font-bold text-[var(--color-text-muted)]"
            animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.15 }}
          >
            {workers.map((_, i) => (
              <motion.span
                key={i}
                animate={{ opacity: viz.currentStep >= 1 ? 1 : 0, y: viz.currentStep >= 1 ? 0 : -5 }}
                transition={{ delay: i * 0.08 }}
              >
                ↓
              </motion.span>
            ))}
          </motion.div>

          {/* Workers */}
          <div className="flex gap-2.5">
            {workers.map((w, i) => (
              <motion.div
                key={i}
                className={`${w.color} text-white rounded-lg w-20 h-[4.5rem] flex flex-col items-center justify-center shadow-md text-center`}
                animate={{
                  opacity: viz.currentStep >= 2 ? 1 : 0.15,
                  y: viz.currentStep >= 2 ? 0 : 10,
                  scale: viz.currentStep === 2 ? 1.05 : 1,
                }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-[10px] font-bold">{w.label}</span>
                <span className="text-[9px] opacity-60 mt-0.5">{w.task}</span>
                {viz.currentStep === 2 && (
                  <motion.div
                    className="mt-1 h-0.5 w-12 bg-white/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Status sync */}
          <motion.div
            className="flex gap-1.5"
            animate={{ opacity: viz.currentStep >= 3 ? 1 : 0 }}
          >
            {['pending', 'in_progress', 'completed', 'completed'].map((s, i) => (
              <motion.span
                key={i}
                className={`text-[9px] font-mono rounded px-1.5 py-0.5 ${
                  s === 'completed'
                    ? 'bg-emerald-500/15 text-emerald-500'
                    : s === 'in_progress'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-slate-500/15 text-slate-500'
                }`}
                animate={{ opacity: viz.currentStep >= 3 ? 1 : 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>

          {/* Final result */}
          <motion.div
            className="bg-emerald-500 text-white text-xs font-bold rounded-lg px-4 py-2 shadow-md"
            animate={{ opacity: viz.currentStep >= 4 ? 1 : 0, scale: viz.currentStep === 4 ? 1.05 : 1 }}
          >
            ✓ 汇总完成
          </motion.div>
        </div>
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
