'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const pipeline = [
  { label: '构建 Prompt', color: 'bg-emerald-500' },
  { label: '注入系统消息', color: 'bg-emerald-400' },
  { label: '检查 Token', color: 'bg-blue-400' },
  { label: '压缩历史', color: 'bg-blue-500' },
  { label: 'API 调用', color: 'bg-amber-500' },
  { label: '解析响应', color: 'bg-amber-400' },
  { label: '执行工具', color: 'bg-purple-500' },
  { label: '权限检查', color: 'bg-purple-400' },
  { label: '收集结果', color: 'bg-red-400' },
  { label: '循环判断', color: 'bg-red-500' },
]

const steps = [
  { title: 'Prompt 构建', desc: '组装 system prompt + 历史消息 + 用户输入' },
  { title: '上下文管理', desc: '注入系统消息, 检查 Token 上限, 按需压缩历史' },
  { title: 'API 请求', desc: '调用 Claude API, 开始流式接收响应数据' },
  { title: '工具执行', desc: '解析 tool_use block, 权限检查后执行工具调用' },
  { title: '循环判断', desc: '有 tool_use → 继续循环; 仅 text → break 退出' },
]

export default function C04QueryLoop({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const activeRange = (() => {
    if (viz.currentStep === 0) return [0, 1]
    if (viz.currentStep === 1) return [2, 3]
    if (viz.currentStep === 2) return [4, 5]
    if (viz.currentStep === 3) return [6, 7, 8]
    return [9]
  })()

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="relative py-6 px-4">
        <div className="grid grid-cols-5 gap-2">
          {pipeline.map((step, i) => (
            <motion.div
              key={i}
              className={`${step.color} text-white rounded-lg px-2 py-3 text-[10px] font-bold text-center shadow-md`}
              animate={{
                opacity: activeRange.includes(i) ? 1 : 0.2,
                scale: activeRange.includes(i) ? 1.05 : 0.95,
                y: activeRange.includes(i) ? -4 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-[10px] opacity-50 mb-0.5">#{i + 1}</div>
              {step.label}
            </motion.div>
          ))}
        </div>

        {/* Loop arrow */}
        <motion.div
          className="absolute -bottom-1 right-4 text-xs font-bold text-red-400"
          animate={{ opacity: viz.currentStep === 4 ? 1 : 0 }}
        >
          ↻ while(true)
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
