'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const pipeline = [
  { label: '触发匹配', sub: '/command 或 TRIGGER', color: 'bg-red-400' },
  { label: 'Frontmatter', sub: '解析元数据', color: 'bg-red-500' },
  { label: '注入 Prompt', sub: '追加系统消息', color: 'bg-amber-500' },
  { label: 'Hook 绑定', sub: '注册工具约束', color: 'bg-purple-500' },
  { label: '执行 Skill', sub: '按模板执行', color: 'bg-emerald-500' },
]

const frontmatterFields = ['name', 'description', 'trigger', 'tools', 'hooks']

const steps = [
  { title: 'Skill 概览', desc: 'Markdown 文件封装的可复用 AI 行为模板' },
  { title: '触发匹配', desc: '用户输入 /command 或匹配 TRIGGER 关键词自动激活' },
  { title: 'Frontmatter 解析', desc: '解析 YAML 头部: name/trigger/tools/hooks 等元数据' },
  { title: 'Prompt 注入', desc: 'Skill 正文作为系统消息注入, 引导 Claude 行为' },
  { title: '执行完成', desc: 'Hook 约束 + 工具白名单确保 Skill 按预期运行' },
]

export default function C17Skills({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-4">
        {/* Pipeline */}
        <div className="flex items-center gap-1.5 justify-center">
          {pipeline.map((node, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <motion.div
                className={`${node.color} text-white rounded-lg px-2 py-2 text-center shadow-md`}
                animate={{
                  opacity: i <= viz.currentStep ? 1 : 0.15,
                  scale: i === viz.currentStep ? 1.08 : 1,
                  y: i === viz.currentStep ? -3 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-[10px] font-bold">{node.label}</div>
                <div className="text-[9px] opacity-60">{node.sub}</div>
              </motion.div>
              {i < pipeline.length - 1 && (
                <motion.span
                  className="text-xs font-bold text-[var(--color-text-muted)]"
                  animate={{ opacity: i < viz.currentStep ? 1 : 0.2 }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>

        {/* Frontmatter detail */}
        <motion.div
          className="border border-[var(--color-border)] rounded-lg p-3 bg-[var(--color-bg-secondary)]"
          animate={{ opacity: viz.currentStep >= 2 ? 1 : 0.1 }}
        >
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] mb-1.5">--- frontmatter ---</div>
          <div className="space-y-1">
            {frontmatterFields.map((field, i) => (
              <motion.div
                key={i}
                className="text-[10px] font-mono flex gap-2"
                animate={{
                  opacity: viz.currentStep >= 2 ? 1 : 0,
                  x: viz.currentStep >= 2 ? 0 : -8,
                }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-amber-500 font-bold">{field}:</span>
                <span className="text-[var(--color-text-muted)]">...</span>
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
