'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const nodes = [
  { label: 'message', sub: '用户输入', color: 'bg-slate-500' },
  { label: 'submitMessage', sub: '提交处理', color: 'bg-emerald-500' },
  { label: 'query()', sub: '核心调用', color: 'bg-emerald-600' },
  { label: 'stream', sub: '流式响应', color: 'bg-blue-500' },
  { label: 'yield events', sub: '事件分发', color: 'bg-blue-400' },
]

const steps = [
  { title: '用户输入', desc: '用户在 REPL 中输入消息, 触发 message 事件' },
  { title: '提交消息', desc: 'submitMessage() 封装消息, 准备 API 调用参数' },
  { title: '调用 query()', desc: '进入 QueryEngine 核心, 开始 async generator 执行' },
  { title: '流式响应', desc: 'API 返回 SSE 流, 逐块解析 content_block_delta' },
  { title: '事件分发', desc: 'yield 出 AssistantMessage/ToolUse/Result 事件给上层' },
]

export default function C03QueryEngine({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="flex items-center justify-between gap-1 py-8 px-2">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center gap-1">
            <motion.div
              className={`relative flex flex-col items-center justify-center w-[4.5rem] h-16 rounded-lg text-white text-[10px] font-bold shadow-lg ${node.color}`}
              animate={{
                opacity: i <= viz.currentStep ? 1 : 0.15,
                y: i === viz.currentStep ? -6 : 0,
                scale: i === viz.currentStep ? 1.08 : 1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <span className="text-xs">{node.label}</span>
              <span className="opacity-60 mt-0.5">{node.sub}</span>
              {i === viz.currentStep && (
                <motion.div
                  className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            {i < nodes.length - 1 && (
              <motion.span
                className="text-sm font-bold"
                animate={{ opacity: i < viz.currentStep ? 1 : 0.2 }}
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
