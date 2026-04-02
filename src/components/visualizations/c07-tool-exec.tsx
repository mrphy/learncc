'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const parallelTools = [
  { label: 'Read A', color: 'bg-amber-400' },
  { label: 'Read B', color: 'bg-amber-500' },
  { label: 'Grep C', color: 'bg-amber-400' },
]

const serialTools = [
  { label: 'Write X', color: 'bg-red-400' },
  { label: 'Bash Y', color: 'bg-red-500' },
]

const steps = [
  { title: '工具调用解析', desc: 'AI 响应中提取 tool_use content block 列表' },
  { title: '只读工具并发', desc: 'isReadOnly()=true 的工具(Read/Grep)并行执行' },
  { title: '写入工具串行', desc: '修改型工具逐个排队执行, 避免文件冲突' },
  { title: '结果收集', desc: '所有 tool_result 按原始顺序聚合返回' },
  { title: '注入消息', desc: '将 tool_result 作为新 message 追加到对话历史' },
]

export default function C07ToolExec({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* Parallel section */}
        <div>
          <motion.div
            className="text-[10px] font-bold text-emerald-500 mb-2"
            animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.3 }}
          >
            并行执行 (ReadOnly)
          </motion.div>
          <div className="flex gap-2">
            {parallelTools.map((tool, i) => (
              <motion.div
                key={i}
                className={`${tool.color} text-white rounded-lg px-3 py-2.5 text-xs font-bold shadow-md flex-1 text-center`}
                animate={{
                  opacity: viz.currentStep >= 1 ? 1 : 0.15,
                  y: viz.currentStep >= 1 ? 0 : 10,
                  scale: viz.currentStep === 1 ? 1.05 : 1,
                }}
                transition={{ delay: i * 0.05 }}
              >
                {tool.label}
                {viz.currentStep === 1 && (
                  <motion.div
                    className="mt-1 h-1 bg-white/40 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Serial section */}
        <div>
          <motion.div
            className="text-[10px] font-bold text-red-400 mb-2"
            animate={{ opacity: viz.currentStep >= 2 ? 1 : 0.3 }}
          >
            串行排队 (Write/Bash)
          </motion.div>
          <div className="flex gap-2 items-center">
            {serialTools.map((tool, i) => (
              <motion.div key={i} className="flex items-center gap-2">
                <motion.div
                  className={`${tool.color} text-white rounded-lg px-3 py-2.5 text-xs font-bold shadow-md text-center`}
                  animate={{
                    opacity: viz.currentStep >= 2 ? 1 : 0.15,
                    x: viz.currentStep >= 2 ? 0 : -15,
                  }}
                  transition={{ delay: i * 0.15 }}
                >
                  {tool.label}
                </motion.div>
                {i < serialTools.length - 1 && (
                  <motion.span
                    className="text-sm text-red-400 font-bold"
                    animate={{ opacity: viz.currentStep >= 2 ? 1 : 0 }}
                  >
                    →
                  </motion.span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Results */}
        <motion.div
          className="bg-emerald-500 text-white rounded-lg px-4 py-2.5 text-xs font-bold text-center shadow-md"
          animate={{
            opacity: viz.currentStep >= 3 ? 1 : 0.1,
            scale: viz.currentStep === 4 ? 1.05 : 1,
          }}
        >
          {viz.currentStep >= 4 ? '✓ tool_results → 追加到消息历史' : '收集全部 tool_result'}
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
