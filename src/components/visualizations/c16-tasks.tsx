'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const states = [
  { label: 'pending', display: '待处理', color: 'bg-slate-400' },
  { label: 'in_progress', display: '进行中', color: 'bg-amber-500' },
  { label: 'completed', display: '已完成', color: 'bg-emerald-500' },
]

const taskExamples = [
  { id: '#1', title: '实现登录页面', status: 0 },
  { id: '#2', title: '编写单元测试', status: 0 },
  { id: '#3', title: '更新文档', status: 0 },
]

const steps = [
  { title: 'Task 状态机', desc: 'pending → in_progress → completed 三态转换' },
  { title: '创建任务', desc: 'TaskCreate 创建任务, 设置 subject/description/blockedBy' },
  { title: '开始执行', desc: 'TaskUpdate 将状态设为 in_progress, 开始工作' },
  { title: '依赖管理', desc: 'blockedBy 字段控制任务间依赖, 被阻塞的任务无法开始' },
  { title: '完成流转', desc: '标记 completed 后自动解除下游任务的阻塞' },
]

export default function C16Tasks({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const getTaskStatus = (taskIdx: number) => {
    if (viz.currentStep <= 1) return 0
    if (viz.currentStep === 2) return taskIdx === 0 ? 1 : 0
    if (viz.currentStep === 3) return taskIdx === 0 ? 2 : taskIdx === 1 ? 1 : 0
    return taskIdx <= 1 ? 2 : 1
  }

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* State machine */}
        <div className="flex items-center justify-center gap-3">
          {states.map((state, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                className={`${state.color} text-white rounded-lg px-3 py-2.5 text-xs font-bold shadow-md text-center`}
                animate={{
                  scale: viz.currentStep === 0 ? 1.05 : 1,
                  opacity: viz.currentStep === 0 ? 1 : 0.8,
                }}
              >
                <div className="font-mono text-[10px]">{state.label}</div>
                <div className="mt-0.5">{state.display}</div>
              </motion.div>
              {i < states.length - 1 && (
                <span className="text-sm font-bold text-[var(--color-text-muted)]">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Task list */}
        <div className="space-y-1.5">
          {taskExamples.map((task, i) => {
            const statusIdx = getTaskStatus(i)
            const state = states[statusIdx]
            return (
              <motion.div
                key={i}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2"
                animate={{
                  opacity: viz.currentStep >= 1 ? 1 : 0.2,
                  x: viz.currentStep >= 1 ? 0 : -10,
                }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-6">{task.id}</span>
                <span className="text-xs text-[var(--color-text)] flex-1">{task.title}</span>
                <motion.span
                  className={`${state.color} text-white text-[10px] font-bold rounded px-1.5 py-0.5`}
                  animate={{ scale: statusIdx === 1 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 1, repeat: statusIdx === 1 ? Infinity : 0 }}
                >
                  {state.display}
                </motion.span>
              </motion.div>
            )
          })}
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
