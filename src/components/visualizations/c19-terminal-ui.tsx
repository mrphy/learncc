'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const renderPipeline = [
  { label: 'React', sub: 'JSX 组件', color: 'bg-slate-400' },
  { label: 'Ink', sub: '终端渲染器', color: 'bg-slate-500' },
  { label: 'Reconciler', sub: '协调器', color: 'bg-blue-500' },
  { label: 'DOM 树', sub: '虚拟节点', color: 'bg-blue-400' },
  { label: 'ANSI', sub: '终端输出', color: 'bg-emerald-500' },
]

const uiComponents = [
  { label: 'InputArea', desc: '输入区' },
  { label: 'MessageList', desc: '消息列表' },
  { label: 'ToolStatus', desc: '工具状态' },
  { label: 'Spinner', desc: '加载动画' },
]

const steps = [
  { title: 'React 组件', desc: '使用标准 React JSX 编写 UI 组件, 声明式描述界面' },
  { title: 'Ink 渲染器', desc: 'Ink 将 React 适配到终端环境, 替代 DOM 渲染' },
  { title: '协调器工作', desc: 'Custom Reconciler 比对虚拟 DOM, 计算最小更新' },
  { title: '虚拟 DOM 树', desc: '生成终端专用的虚拟节点树, 包含布局信息' },
  { title: 'ANSI 输出', desc: '最终转换为 ANSI 转义序列, 绘制到终端屏幕' },
]

export default function C19TerminalUI({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* Render pipeline */}
        <div className="flex items-center gap-1 justify-center">
          {renderPipeline.map((node, i) => (
            <div key={i} className="flex items-center gap-1">
              <motion.div
                className={`${node.color} text-white rounded-lg px-2 py-2 text-center shadow-md`}
                animate={{
                  opacity: i <= viz.currentStep ? 1 : 0.15,
                  scale: i === viz.currentStep ? 1.1 : 1,
                  y: i === viz.currentStep ? -4 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-[10px] font-bold">{node.label}</div>
                <div className="text-[9px] opacity-60">{node.sub}</div>
              </motion.div>
              {i < renderPipeline.length - 1 && (
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

        {/* UI Components */}
        <motion.div
          className="grid grid-cols-4 gap-1.5"
          animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.1 }}
        >
          {uiComponents.map((comp, i) => (
            <motion.div
              key={i}
              className="border border-[var(--color-border)] rounded-md bg-[var(--color-bg-secondary)] px-2 py-1.5 text-center"
              animate={{
                opacity: viz.currentStep >= 1 ? 1 : 0,
                y: viz.currentStep >= 1 ? 0 : 8,
              }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="text-[10px] font-mono font-bold text-[var(--color-text)]">{comp.label}</div>
              <div className="text-[9px] text-[var(--color-text-muted)]">{comp.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Terminal preview */}
        <motion.div
          className="border border-[var(--color-border)] rounded-lg bg-black/80 p-3 font-mono text-[10px] text-emerald-400"
          animate={{ opacity: viz.currentStep >= 4 ? 1 : 0.1 }}
        >
          <div className="text-slate-500">$ claude</div>
          <motion.div
            animate={{ opacity: viz.currentStep >= 4 ? [0.5, 1, 0.5] : 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-emerald-400">{'>'} </span>
            <span className="text-white">Hello, how can I help?</span>
            <span className="text-emerald-400 ml-0.5">_</span>
          </motion.div>
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
