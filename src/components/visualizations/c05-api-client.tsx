'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const blocks = [
  { label: 'text', sub: '文本内容', color: 'bg-blue-400', type: 'output' },
  { label: 'tool_use', sub: '工具调用', color: 'bg-amber-500', type: 'output' },
  { label: 'thinking', sub: '思考过程', color: 'bg-purple-400', type: 'output' },
]

const steps = [
  { title: '构建请求', desc: '封装 messages + tools + system prompt 为 API 请求体' },
  { title: '发起 SSE 流', desc: 'POST /v1/messages, 响应为 Server-Sent Events 流' },
  { title: '事件解析', desc: 'message_start → content_block_start → delta → stop' },
  { title: '块类型分发', desc: '解析出 text / tool_use / thinking 三类 content block' },
  { title: '结果聚合', desc: '组装完整的 AssistantMessage, 回传给 QueryEngine' },
]

export default function C05ApiClient({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-4">
        {/* API Call flow */}
        <div className="flex items-center gap-3 justify-center">
          <motion.div
            className="bg-emerald-500 text-white rounded-lg px-4 py-3 text-xs font-bold shadow-lg"
            animate={{ opacity: viz.currentStep >= 0 ? 1 : 0.2, scale: viz.currentStep === 0 ? 1.05 : 1 }}
          >
            API Client
          </motion.div>

          <motion.div
            className="flex flex-col items-center"
            animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.2 }}
          >
            <span className="text-xs text-[var(--color-text-muted)]">SSE</span>
            <span className="text-lg">→</span>
          </motion.div>

          <motion.div
            className="bg-blue-500 text-white rounded-lg px-4 py-3 text-xs font-bold shadow-lg"
            animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.2, scale: viz.currentStep === 1 ? 1.05 : 1 }}
          >
            Stream Parser
          </motion.div>
        </div>

        {/* Stream events */}
        <motion.div
          className="flex gap-1 justify-center text-[10px] font-mono text-[var(--color-text-muted)]"
          animate={{ opacity: viz.currentStep >= 2 ? 1 : 0 }}
        >
          {['message_start', 'block_start', 'delta...', 'block_stop', 'message_stop'].map((evt, i) => (
            <motion.span
              key={i}
              className="bg-[var(--color-bg-secondary)] rounded px-1.5 py-0.5 border border-[var(--color-border)]"
              animate={{ opacity: viz.currentStep >= 2 ? 1 : 0, y: viz.currentStep >= 2 ? 0 : 10 }}
              transition={{ delay: i * 0.08 }}
            >
              {evt}
            </motion.span>
          ))}
        </motion.div>

        {/* Output blocks */}
        <motion.div
          className="flex gap-3 justify-center"
          animate={{ opacity: viz.currentStep >= 3 ? 1 : 0 }}
        >
          {blocks.map((block, i) => (
            <motion.div
              key={i}
              className={`${block.color} text-white rounded-lg px-3 py-2.5 text-xs font-bold shadow-md`}
              animate={{
                opacity: viz.currentStep >= 3 ? 1 : 0,
                y: viz.currentStep >= 3 ? 0 : 15,
                scale: viz.currentStep === 4 ? 1.05 : 1,
              }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            >
              <div>{block.label}</div>
              <div className="text-[10px] opacity-60">{block.sub}</div>
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
