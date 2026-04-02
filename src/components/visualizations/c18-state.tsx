'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const sections = [
  {
    label: 'conversationState',
    sub: '对话消息历史',
    color: 'bg-slate-500',
    children: ['messages[]', 'systemPrompt', 'tokenCount'],
  },
  {
    label: 'toolState',
    sub: '工具注册表',
    color: 'bg-amber-500',
    children: ['builtinTools[]', 'mcpTools[]', 'permissions'],
  },
  {
    label: 'configState',
    sub: '运行时配置',
    color: 'bg-blue-500',
    children: ['model', 'apiKey', 'maxTokens'],
  },
  {
    label: 'uiState',
    sub: '界面状态',
    color: 'bg-slate-400',
    children: ['inputMode', 'spinnerState', 'theme'],
  },
  {
    label: 'sessionState',
    sub: '会话元数据',
    color: 'bg-emerald-500',
    children: ['sessionId', 'cwd', 'gitContext'],
  },
]

const steps = [
  { title: 'AppState 总览', desc: '全局状态分为 5 大模块, 各自管理不同维度的数据' },
  { title: '对话状态', desc: 'conversationState: 消息历史、系统 prompt、token 统计' },
  { title: '工具状态', desc: 'toolState: 内置工具注册、MCP 工具、权限规则缓存' },
  { title: '配置与 UI', desc: 'configState + uiState: 模型参数 + 界面渲染状态' },
  { title: '会话元数据', desc: 'sessionState: 会话 ID、工作目录、Git 上下文等' },
]

export default function C18State({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  const expandedIdx = viz.currentStep === 0 ? -1 : viz.currentStep - 1

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-4 px-4 space-y-1.5">
        {sections.map((section, i) => {
          const isExpanded = expandedIdx === i || (viz.currentStep === 4 && i >= 3)
          return (
            <motion.div
              key={i}
              className="rounded-lg border border-[var(--color-border)] overflow-hidden"
              animate={{
                opacity: viz.currentStep === 0 || isExpanded || i < expandedIdx ? 1 : 0.4,
                scale: isExpanded ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${section.color} text-white px-3 py-1.5 flex justify-between items-center`}>
                <span className="text-[10px] font-mono font-bold">{section.label}</span>
                <span className="text-[9px] opacity-60">{section.sub}</span>
              </div>
              <motion.div
                className="bg-[var(--color-bg-secondary)] px-3 overflow-hidden"
                animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="py-1.5 space-y-0.5">
                  {section.children.map((child, ci) => (
                    <motion.div
                      key={ci}
                      className="text-[10px] font-mono text-[var(--color-text-muted)]"
                      animate={{ x: isExpanded ? 0 : -5, opacity: isExpanded ? 1 : 0 }}
                      transition={{ delay: ci * 0.04 }}
                    >
                      ├─ {child}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
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
