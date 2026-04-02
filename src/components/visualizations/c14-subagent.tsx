'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const steps = [
  { title: '主代理运行', desc: '用户对话由主 Agent 处理, 拥有完整上下文' },
  { title: '任务拆分', desc: '主代理通过 SubAgent 工具将子任务委托出去' },
  { title: '子代理创建', desc: '每个子代理获得独立 query() 实例和受限工具集' },
  { title: '结果回传', desc: '子代理完成后返回 tool_result, 主代理继续推理' },
  { title: '递归能力', desc: '子代理也可创建子代理, 形成递归调用树' },
]

export default function C14SubAgent({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4">
        <div className="flex flex-col items-center gap-3">
          {/* Main agent */}
          <motion.div
            className="bg-red-500 text-white rounded-xl w-32 h-14 flex flex-col items-center justify-center shadow-lg"
            animate={{ scale: viz.currentStep === 0 ? 1.1 : 1, opacity: 1 }}
          >
            <span className="text-xs font-bold">主代理</span>
            <span className="text-[10px] opacity-60">Main Agent</span>
          </motion.div>

          {/* Arrow */}
          <motion.div
            className="text-lg font-bold text-[var(--color-text-muted)]"
            animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.15 }}
          >
            ↓ query()
          </motion.div>

          {/* Child agents */}
          <motion.div
            className="flex gap-3"
            animate={{ opacity: viz.currentStep >= 2 ? 1 : 0.1 }}
          >
            {['子代理 A', '子代理 B'].map((name, i) => (
              <motion.div
                key={i}
                className="bg-red-400 text-white rounded-lg w-24 h-16 flex flex-col items-center justify-center shadow-md"
                animate={{
                  opacity: viz.currentStep >= 2 ? 1 : 0,
                  y: viz.currentStep >= 2 ? 0 : 15,
                  scale: viz.currentStep === 2 ? 1.05 : 1,
                }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-[10px] font-bold">{name}</span>
                {viz.currentStep >= 2 && viz.currentStep < 3 && (
                  <motion.div
                    className="mt-1 h-0.5 w-10 bg-white/30 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className="h-full bg-white rounded-full"
                      animate={{ width: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Return arrow */}
          <motion.div
            className="text-lg font-bold text-emerald-500"
            animate={{ opacity: viz.currentStep >= 3 ? 1 : 0 }}
          >
            ↑ tool_result
          </motion.div>

          {/* Recursive child */}
          <motion.div
            className="flex flex-col items-center gap-1"
            animate={{ opacity: viz.currentStep >= 4 ? 1 : 0 }}
          >
            <span className="text-[10px] text-[var(--color-text-muted)]">↓ 递归</span>
            <motion.div
              className="bg-red-300 text-white rounded-md w-20 h-10 flex items-center justify-center shadow-sm text-[10px] font-bold"
              animate={{ opacity: viz.currentStep >= 4 ? 1 : 0, scale: viz.currentStep === 4 ? 1.05 : 1 }}
            >
              子子代理
            </motion.div>
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
