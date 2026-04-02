'use client'
import { motion } from 'framer-motion'
import { useSteppedVisualization } from '@/hooks/useSteppedVisualization'
import StepControls from '@/components/StepControls'

const categories = [
  {
    name: '文件操作',
    color: 'bg-amber-500',
    tools: ['Read', 'Write', 'Edit', 'Glob', 'Grep'],
  },
  {
    name: '执行环境',
    color: 'bg-emerald-500',
    tools: ['Bash', 'Notebook', 'WebFetch'],
  },
  {
    name: '代码智能',
    color: 'bg-blue-500',
    tools: ['LSP', 'Search', 'Symbols'],
  },
  {
    name: '任务管理',
    color: 'bg-purple-500',
    tools: ['Task', 'SubAgent', 'Memory'],
  },
  {
    name: 'MCP 扩展',
    color: 'bg-red-400',
    tools: ['McpTool', 'Connect', 'Schema'],
  },
]

const steps = [
  { title: '文件操作类', desc: 'Read/Write/Edit/Glob/Grep — 覆盖文件 CRUD 和搜索' },
  { title: '执行环境类', desc: 'Bash/Notebook/WebFetch — 运行命令、代码和网络访问' },
  { title: '代码智能类', desc: 'LSP/Search/Symbols — 跳转定义、引用查找、符号搜索' },
  { title: '任务管理类', desc: 'Task/SubAgent/Memory — 子任务、子代理和记忆管理' },
  { title: '扩展生态', desc: 'MCP 动态加载外部工具, 42+ 内置工具仅是起点' },
]

export default function C08BuiltinTools({ title }: { title?: string }) {
  const viz = useSteppedVisualization({ totalSteps: 5 })

  return (
    <div className="space-y-6">
      {title && <div className="text-sm font-semibold text-[var(--color-text-muted)]">{title}</div>}

      <div className="py-4 px-4 space-y-2.5">
        {categories.map((cat, ci) => (
          <motion.div
            key={ci}
            className="flex items-center gap-2"
            animate={{
              opacity: ci <= viz.currentStep ? 1 : 0.15,
              x: ci <= viz.currentStep ? 0 : -10,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className={`${cat.color} text-white text-[10px] font-bold rounded-md px-2 py-1.5 w-16 text-center shadow-sm shrink-0`}>
              {cat.name}
            </div>
            <div className="flex gap-1 flex-wrap">
              {cat.tools.map((tool, ti) => (
                <motion.div
                  key={ti}
                  className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] text-[10px] font-mono rounded px-1.5 py-1"
                  animate={{
                    opacity: ci <= viz.currentStep ? 1 : 0.2,
                    scale: ci === viz.currentStep ? 1.05 : 1,
                  }}
                  transition={{ delay: ti * 0.04 }}
                >
                  {tool}
                </motion.div>
              ))}
            </div>
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
