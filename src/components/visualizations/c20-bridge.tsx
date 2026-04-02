'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const layers = [
  { label: 'IDE', sub: 'VS Code / JetBrains', color: 'bg-blue-500' },
  { label: 'Bridge', sub: 'WebSocket 桥接', color: 'bg-red-500' },
  { label: 'Claude Code', sub: 'CLI 进程', color: 'bg-emerald-500' },
]

const messages = [
  { from: 0, to: 2, label: 'user_input', dir: '→' },
  { from: 2, to: 0, label: 'assistant_msg', dir: '←' },
  { from: 2, to: 0, label: 'tool_status', dir: '←' },
  { from: 0, to: 2, label: 'permission', dir: '→' },
]

const steps = [
  { title: 'Bridge 架构', desc: 'IDE 扩展通过 Bridge 进程与 Claude Code CLI 双向通信' },
  { title: 'IDE 侧连接', desc: 'VS Code 扩展通过 WebSocket 连接 Bridge 服务' },
  { title: 'Claude Code 侧', desc: 'Bridge 启动 Claude Code 子进程, 管理生命周期' },
  { title: '双向消息流', desc: '用户输入 → Claude; 响应/工具状态 ← Claude; 权限确认 →' },
  { title: '能力映射', desc: 'Bridge 将 CLI 功能映射到 IDE UI: 内联 diff、文件操作等' },
]

export default function C20Bridge({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* Three-layer architecture */}
        <div className="flex items-center justify-center gap-4">
          {layers.map((layer, i) => (
            <div key={i} className="flex items-center gap-4">
              <motion.div
                className={`${layer.color} text-white rounded-xl w-28 h-20 flex flex-col items-center justify-center shadow-lg`}
                animate={{
                  opacity: i <= viz.currentStep ? 1 : 0.15,
                  scale: viz.currentStep === i + 1 ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <span className="text-xs font-bold">{layer.label}</span>
                <span className="text-[10px] opacity-60 mt-0.5">{layer.sub}</span>
              </motion.div>
              {i < layers.length - 1 && (
                <motion.div
                  className="flex flex-col items-center gap-0.5"
                  animate={{ opacity: i + 1 <= viz.currentStep ? 1 : 0.2 }}
                >
                  <span className="text-sm font-bold text-[var(--color-text-muted)]">↔</span>
                  <span className="text-[9px] text-[var(--color-text-muted)]">WebSocket</span>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Message flow */}
        <motion.div
          className="space-y-1.5"
          animate={{ opacity: viz.currentStep >= 3 ? 1 : 0.1 }}
        >
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 justify-center"
              animate={{
                opacity: viz.currentStep >= 3 ? 1 : 0,
                x: viz.currentStep >= 3 ? 0 : (msg.dir === '→' ? -10 : 10),
              }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-[10px] text-[var(--color-text-muted)] w-20 text-right">
                {layers[msg.from].label}
              </span>
              <span className={`text-sm font-bold ${msg.dir === '→' ? 'text-blue-400' : 'text-emerald-400'}`}>
                {msg.dir}
              </span>
              <span className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded px-2 py-0.5 text-[10px] font-mono text-[var(--color-text)]">
                {msg.label}
              </span>
              <span className={`text-sm font-bold ${msg.dir === '→' ? 'text-blue-400' : 'text-emerald-400'}`}>
                {msg.dir}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] w-20">
                {layers[msg.to].label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Capabilities */}
        <motion.div
          className="flex gap-1.5 justify-center flex-wrap"
          animate={{ opacity: viz.currentStep >= 4 ? 1 : 0 }}
        >
          {['内联 Diff', '文件跳转', '权限弹窗', '进度展示', '日志面板'].map((cap, i) => (
            <motion.span
              key={i}
              className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[10px] font-bold rounded px-2 py-1"
              animate={{ opacity: viz.currentStep >= 4 ? 1 : 0, y: viz.currentStep >= 4 ? 0 : 5 }}
              transition={{ delay: i * 0.06 }}
            >
              {cap}
            </motion.span>
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
