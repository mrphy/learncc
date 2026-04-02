'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const transports = [
  { label: 'stdio', sub: '子进程', color: 'bg-red-400' },
  { label: 'sse', sub: 'HTTP SSE', color: 'bg-red-500' },
  { label: 'http', sub: 'HTTP 流', color: 'bg-red-400' },
  { label: 'ws', sub: 'WebSocket', color: 'bg-red-500' },
  { label: 'docker', sub: '容器化', color: 'bg-red-400' },
]

const servers = [
  { label: 'GitHub', color: 'bg-slate-600' },
  { label: 'Database', color: 'bg-blue-500' },
  { label: 'Custom', color: 'bg-emerald-500' },
]

const steps = [
  { title: 'MCP 概览', desc: 'Model Context Protocol — 连接外部工具和数据源的开放协议' },
  { title: '5 种传输方式', desc: 'stdio / SSE / HTTP Streamable / WebSocket / Docker 容器' },
  { title: '服务器发现', desc: '从 settings.json 读取 mcpServers 配置, 逐个初始化' },
  { title: '工具注册', desc: '通过 JSON-RPC 获取服务器提供的 tools/list, 动态注册' },
  { title: '运行时调用', desc: 'AI 像调用内置工具一样调用 MCP 工具, 协议透明' },
]

export default function C12Mcp({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-6 px-4 space-y-5">
        {/* Central node */}
        <div className="flex justify-center">
          <motion.div
            className="bg-red-500 text-white rounded-xl w-28 h-14 flex items-center justify-center shadow-lg text-sm font-bold"
            animate={{ scale: viz.currentStep === 0 ? 1.1 : 1 }}
          >
            MCP Client
          </motion.div>
        </div>

        {/* Transports */}
        <motion.div
          className="flex gap-1.5 justify-center flex-wrap"
          animate={{ opacity: viz.currentStep >= 1 ? 1 : 0.1 }}
        >
          {transports.map((t, i) => (
            <motion.div
              key={i}
              className={`${t.color} text-white rounded-lg px-2.5 py-1.5 text-[10px] font-bold shadow-sm text-center`}
              animate={{
                opacity: viz.currentStep >= 1 ? 1 : 0,
                y: viz.currentStep >= 1 ? 0 : 10,
                scale: viz.currentStep === 1 ? 1.05 : 1,
              }}
              transition={{ delay: i * 0.06 }}
            >
              <div>{t.label}</div>
              <div className="opacity-50">{t.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="text-center text-lg font-bold text-[var(--color-text-muted)]"
          animate={{ opacity: viz.currentStep >= 2 ? 1 : 0.1 }}
        >
          ↕
        </motion.div>

        {/* Servers */}
        <motion.div
          className="flex gap-3 justify-center"
          animate={{ opacity: viz.currentStep >= 2 ? 1 : 0.1 }}
        >
          {servers.map((s, i) => (
            <motion.div
              key={i}
              className={`${s.color} text-white rounded-lg px-4 py-3 text-xs font-bold shadow-md text-center`}
              animate={{
                opacity: viz.currentStep >= 2 ? 1 : 0,
                y: viz.currentStep >= 2 ? 0 : 15,
                scale: viz.currentStep >= 3 && i === viz.currentStep - 3 ? 1.1 : 1,
              }}
              transition={{ delay: i * 0.1 }}
            >
              <div>{s.label}</div>
              <motion.div
                className="text-[10px] opacity-60 mt-0.5"
                animate={{ opacity: viz.currentStep >= 3 ? 1 : 0 }}
              >
                tools/list
              </motion.div>
            </motion.div>
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
