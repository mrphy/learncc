'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const gates = [
  { label: '工具启用', sub: 'isEnabled()', color: 'bg-purple-300' },
  { label: '全局规则', sub: 'allowedTools', color: 'bg-purple-400' },
  { label: '权限规则', sub: 'permissions.json', color: 'bg-purple-500' },
  { label: 'Hook 拦截', sub: 'PreToolUse hook', color: 'bg-purple-600' },
  { label: '用户确认', desc: 'Terminal 弹窗', color: 'bg-purple-700' },
]

const steps = [
  { title: '工具启用检查', desc: '工具自身的 isEnabled() 判断当前环境是否可用' },
  { title: '全局规则过滤', desc: 'settings.json 中 allowedTools/blockedTools 规则匹配' },
  { title: '权限规则匹配', desc: 'permissions.json 路径模式 + 工具名匹配, allow/deny' },
  { title: 'Hook 拦截点', desc: 'PreToolUse hook 可返回 approve/deny/modify 覆盖决策' },
  { title: '用户确认', desc: '如果前面都未决定, 弹出终端确认对话框, 用户最终裁决' },
]

export default function C10Permissions({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4">
        {/* Request */}
        <motion.div
          className="text-center mb-4"
          animate={{ opacity: viz.currentStep >= 0 ? 1 : 0.3 }}
        >
          <span className="bg-amber-500 text-white text-xs font-bold rounded-lg px-3 py-1.5 shadow-md">
            tool_use 请求
          </span>
        </motion.div>

        {/* Gates */}
        <div className="space-y-2">
          {gates.map((gate, i) => (
            <div key={i} className="flex items-center gap-3">
              <motion.div
                className="text-lg font-bold text-center w-6"
                animate={{
                  opacity: i <= viz.currentStep ? 1 : 0.15,
                  color: i < viz.currentStep ? '#10b981' : i === viz.currentStep ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                {i < viz.currentStep ? '✓' : '▸'}
              </motion.div>
              <motion.div
                className={`${gate.color} text-white rounded-lg px-4 py-2 text-xs font-bold shadow-md flex-1 flex justify-between items-center`}
                animate={{
                  opacity: i <= viz.currentStep ? 1 : 0.15,
                  x: i <= viz.currentStep ? 0 : 15,
                  scale: i === viz.currentStep ? 1.03 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <span>{gate.label}</span>
                <span className="opacity-60 text-[10px] font-mono">{gate.sub}</span>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Result */}
        <motion.div
          className="text-center mt-4"
          animate={{ opacity: viz.currentStep === 4 ? 1 : 0 }}
        >
          <span className="bg-emerald-500 text-white text-xs font-bold rounded-lg px-3 py-1.5 shadow-md">
            ✓ 授权通过 → 执行工具
          </span>
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
