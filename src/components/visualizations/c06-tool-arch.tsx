'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const properties = [
  { label: 'name', desc: '工具名称', color: 'bg-amber-500' },
  { label: 'description', desc: 'AI 可读描述', color: 'bg-amber-400' },
  { label: 'inputSchema', desc: 'JSON Schema 参数', color: 'bg-amber-500' },
  { label: 'isReadOnly()', desc: '是否只读操作', color: 'bg-emerald-500' },
  { label: 'call()', desc: '执行入口函数', color: 'bg-emerald-400' },
  { label: 'needsPermission()', desc: '权限检查逻辑', color: 'bg-purple-500' },
  { label: 'isEnabled()', desc: '是否启用判断', color: 'bg-purple-400' },
]

const steps = [
  { title: 'Tool 接口定义', desc: 'TypeScript 接口规范, 每个工具必须实现的契约' },
  { title: '标识与描述', desc: 'name + description 让 Claude 理解工具用途' },
  { title: '参数模式', desc: 'inputSchema 定义参数类型, AI 按此生成 JSON 参数' },
  { title: '执行方法', desc: 'call() 是核心入口, isReadOnly() 标记是否修改文件系统' },
  { title: '权限与启用', desc: 'needsPermission() 和 isEnabled() 控制安全与可用性' },
]

export default function C06ToolArch({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const visibleProps = (() => {
    if (viz.currentStep === 0) return []
    if (viz.currentStep === 1) return [0, 1]
    if (viz.currentStep === 2) return [0, 1, 2]
    if (viz.currentStep === 3) return [0, 1, 2, 3, 4]
    return [0, 1, 2, 3, 4, 5, 6]
  })()

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4">
        <motion.div
          className="border-2 border-amber-500/30 rounded-xl p-4 bg-amber-500/5"
          animate={{ borderColor: viz.currentStep > 0 ? 'rgb(245 158 11 / 0.5)' : 'rgb(245 158 11 / 0.1)' }}
        >
          <div className="text-xs font-bold text-amber-500 mb-3">interface Tool</div>
          <div className="space-y-1.5">
            {properties.map((prop, i) => (
              <motion.div
                key={i}
                className={`${prop.color} text-white rounded-md px-3 py-1.5 text-xs font-semibold flex justify-between items-center shadow-sm`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{
                  opacity: visibleProps.includes(i) ? 1 : 0,
                  x: visibleProps.includes(i) ? 0 : -20,
                  height: visibleProps.includes(i) ? 'auto' : 0,
                  marginBottom: visibleProps.includes(i) ? 4 : 0,
                }}
                transition={{ duration: 0.3, delay: visibleProps.includes(i) ? i * 0.05 : 0 }}
              >
                <span className="font-mono">{prop.label}</span>
                <span className="opacity-60 text-[10px]">{prop.desc}</span>
              </motion.div>
            ))}
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
