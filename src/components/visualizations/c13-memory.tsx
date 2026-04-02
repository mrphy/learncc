'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const levels = [
  { label: '原始消息', tokens: '200K', width: '100%', color: 'bg-blue-300' },
  { label: '对话摘要', tokens: '80K', width: '70%', color: 'bg-blue-400' },
  { label: '关键信息', tokens: '40K', width: '45%', color: 'bg-blue-500' },
  { label: '核心记忆', tokens: '15K', width: '25%', color: 'bg-blue-600' },
]

const steps = [
  { title: '上下文窗口', desc: '200K token 上限, 长对话会逐渐逼近限制' },
  { title: '触发压缩', desc: '当 token 使用超过阈值, 自动启动 compaction 流程' },
  { title: '逐级压缩', desc: '先摘要旧消息, 再提取关键信息, 层层递进' },
  { title: '核心保留', desc: '系统消息 + 最近 N 轮对话始终保留, 不参与压缩' },
  { title: '透明运作', desc: '压缩对用户透明, Claude 持续获得高质量上下文' },
]

export default function C13Memory({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const activeLevel = Math.min(viz.currentStep, levels.length - 1)

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-2">
        {levels.map((level, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3"
            animate={{ opacity: i <= activeLevel ? 1 : 0.15 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-8 text-right shrink-0">
              {level.tokens}
            </span>
            <motion.div
              className={`${level.color} text-white rounded-md px-3 py-2 text-xs font-bold shadow-md`}
              animate={{
                width: i <= activeLevel ? level.width : '10%',
                opacity: i <= activeLevel ? 1 : 0.15,
              }}
              transition={{ duration: 0.5 }}
              style={{ minWidth: 60 }}
            >
              <div className="flex justify-between items-center">
                <span>{level.label}</span>
                {i === activeLevel && i > 0 && (
                  <motion.span
                    className="text-[10px] opacity-70"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    压缩中...
                  </motion.span>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}

        {/* Preserved area */}
        <motion.div
          className="mt-3 flex items-center gap-3"
          animate={{ opacity: viz.currentStep >= 3 ? 1 : 0.1 }}
        >
          <span className="text-[10px] font-mono text-[var(--color-text-muted)] w-8 text-right shrink-0">
            固定
          </span>
          <div className="flex gap-1.5">
            <span className="bg-emerald-500 text-white text-[10px] font-bold rounded px-2 py-1 shadow-sm">
              System Prompt
            </span>
            <span className="bg-emerald-400 text-white text-[10px] font-bold rounded px-2 py-1 shadow-sm">
              最近 N 轮
            </span>
          </div>
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
