'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const layers = [
  { label: '内置默认值', priority: 'P7 最低', color: 'bg-slate-400' },
  { label: '全局配置', priority: 'P6', color: 'bg-slate-500' },
  { label: '企业策略', priority: 'P5', color: 'bg-blue-400' },
  { label: '项目 .claude/', priority: 'P4', color: 'bg-blue-500' },
  { label: '环境变量', priority: 'P3', color: 'bg-emerald-400' },
  { label: 'CLI 参数', priority: 'P2', color: 'bg-emerald-500' },
  { label: '运行时覆盖', priority: 'P1 最高', color: 'bg-amber-500' },
]

const steps = [
  { title: '内置默认值', desc: '代码中硬编码的 DEFAULT_CONFIG, 兜底保障' },
  { title: '全局配置加载', desc: '~/.claude/settings.json 用户级别配置' },
  { title: '企业策略覆盖', desc: '组织管理员下发的 managedPolicy 强制生效' },
  { title: '项目配置合并', desc: '.claude/settings.json 项目级配置叠加' },
  { title: '最终合成', desc: '环境变量 → CLI 参数 → 运行时覆盖, 高优先级胜出' },
]

export default function C02Config({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const visibleCount = viz.currentStep < 4
    ? Math.min(viz.currentStep + 1, 4)
    : layers.length

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="flex flex-col-reverse items-center gap-1.5 py-6 px-4">
        {layers.map((layer, i) => (
          <motion.div
            key={i}
            className={`${layer.color} text-white rounded-lg px-4 py-2 text-xs font-semibold flex justify-between shadow-md`}
            initial={{ opacity: 0, x: -30 }}
            animate={{
              opacity: i < visibleCount ? 1 : 0.1,
              x: i < visibleCount ? 0 : -30,
              width: i < visibleCount ? `${60 + i * 5}%` : '50%',
            }}
            transition={{ duration: 0.4, delay: i < visibleCount ? i * 0.05 : 0 }}
          >
            <span>{layer.label}</span>
            <span className="opacity-70">{layer.priority}</span>
          </motion.div>
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
