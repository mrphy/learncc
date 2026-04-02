export type Layer =
  | 'foundation'
  | 'engine'
  | 'tools'
  | 'security'
  | 'integration'
  | 'ui-state'

export interface ChapterMeta {
  id: string
  title: string
  subtitle: string
  coreAddition: string
  keyInsight: string
  layer: Layer
  sourceFiles: string[]
}

export const LAYERS: Record<Layer, { label: string; color: string }> = {
  foundation: { label: '启动与基础', color: 'blue' },
  engine: { label: '核心引擎', color: 'emerald' },
  tools: { label: '工具系统', color: 'amber' },
  security: { label: '安全与权限', color: 'purple' },
  integration: { label: '扩展与集成', color: 'red' },
  'ui-state': { label: '界面与状态', color: 'slate' },
}

export const CHAPTER_META: Record<string, ChapterMeta> = {
  c01: {
    id: 'c01',
    title: '启动引擎',
    subtitle: '从命令行到就绪态',
    coreAddition: 'CLI 解析 → 并行预取 → 初始化管道',
    keyInsight: '通过并行预取和延迟初始化，将启动时间压缩到毫秒级',
    layer: 'foundation',
    sourceFiles: ['main.tsx', 'entrypoints/init.ts', 'replLauncher.tsx'],
  },
  c02: {
    id: 'c02',
    title: '配置系统',
    subtitle: '七层配置优先级',
    coreAddition: 'CLI → 策略 → 远程 → Flag → 项目 → 用户 → 全局',
    keyInsight: '7 层配置合并确保企业策略始终优先，同时保持开发者灵活性',
    layer: 'foundation',
    sourceFiles: ['utils/settings/', 'utils/config.ts', 'schemas/'],
  },
  c03: {
    id: 'c03',
    title: '查询引擎',
    subtitle: 'SDK 与 Headless 的统一',
    coreAddition: 'QueryEngine 类 — 会话生命周期管理',
    keyInsight: 'QueryEngine 是 CLI REPL 和 SDK 编程接口的统一抽象层',
    layer: 'engine',
    sourceFiles: ['QueryEngine.ts'],
  },
  c04: {
    id: 'c04',
    title: '查询循环',
    subtitle: 'AsyncGenerator 驱动的心脏',
    coreAddition: 'while(true) 循环 × 10 步迭代管道',
    keyInsight: 'AsyncGenerator 让流式事件、工具调用、错误恢复自然串联为一个无限循环',
    layer: 'engine',
    sourceFiles: ['query.ts', 'query/'],
  },
  c05: {
    id: 'c05',
    title: 'API 客户端',
    subtitle: '流式响应与智能重试',
    coreAddition: '流式处理 × Thinking 模式 × 缓存管理',
    keyInsight: '通过 Prompt Cache 断点检测和预连接，最大限度减少首 token 延迟',
    layer: 'engine',
    sourceFiles: ['services/api/claude.ts', 'services/api/'],
  },
  c06: {
    id: 'c06',
    title: '工具架构',
    subtitle: '30+ 属性的 Tool 接口',
    coreAddition: 'Tool 类型定义 × 工具注册表 × 特性门控',
    keyInsight: '编译期死代码消除(bun:bundle DCE)实现零运行时开销的特性门控',
    layer: 'tools',
    sourceFiles: ['Tool.ts', 'tools.ts'],
  },
  c07: {
    id: 'c07',
    title: '工具执行引擎',
    subtitle: '并发编排与流式执行',
    coreAddition: 'StreamingToolExecutor × 工具分区 × 结果预算',
    keyInsight: '安全工具并行执行，非安全工具串行隔离，通过兄弟 AbortController 实现级联中止',
    layer: 'tools',
    sourceFiles: ['services/tools/'],
  },
  c08: {
    id: 'c08',
    title: '内置工具全景',
    subtitle: 'Bash·文件·搜索·LSP',
    coreAddition: '42+ 工具的完整实现图谱',
    keyInsight: 'Bash 工具通过 AST 解析实现语义级命令分类，区分只读/破坏性/搜索操作',
    layer: 'tools',
    sourceFiles: ['tools/BashTool/', 'tools/FileEditTool/', 'tools/GrepTool/', 'tools/LSPTool/'],
  },
  c09: {
    id: 'c09',
    title: '计划与工作流',
    subtitle: '结构化的任务推进',
    coreAddition: '计划模式 × 技能系统 × 用户交互',
    keyInsight: 'ToolSearch 延迟加载机制让 40+ 工具仅在需要时才进入上下文窗口',
    layer: 'tools',
    sourceFiles: ['tools/EnterPlanModeTool/', 'tools/SkillTool/', 'tools/ToolSearchTool/'],
  },
  c10: {
    id: 'c10',
    title: '权限系统',
    subtitle: '五层安全决策',
    coreAddition: '规则 → Hook → 分类器 → 沙箱 → 用户确认',
    keyInsight: 'YOLO 自动模式通过转录分类器实现无人值守下的安全执行',
    layer: 'security',
    sourceFiles: ['utils/permissions/'],
  },
  c11: {
    id: 'c11',
    title: 'Hook 生命周期',
    subtitle: '可编程的拦截点',
    coreAddition: 'PreToolUse → PostToolUse → Stop × 三种执行方式',
    keyInsight: 'Hook 系统让用户在不修改源码的情况下，完全控制工具执行的前后逻辑',
    layer: 'security',
    sourceFiles: ['utils/hooks/'],
  },
  c12: {
    id: 'c12',
    title: 'MCP 集成',
    subtitle: '五种传输协议',
    coreAddition: 'Stdio / SSE / HTTP / WebSocket / SDK 传输',
    keyInsight: 'MCP 将外部服务统一抽象为工具/资源/命令三种原语，实现无限扩展',
    layer: 'integration',
    sourceFiles: ['services/mcp/'],
  },
  c13: {
    id: 'c13',
    title: '内存与上下文',
    subtitle: '四级压缩管道',
    coreAddition: 'CLAUDE.md × MEMORY.md × Snip → Micro → Collapse → Auto',
    keyInsight: '渐进式压缩策略在保留关键上下文的同时，将 token 消耗控制在预算内',
    layer: 'integration',
    sourceFiles: ['memdir/', 'services/compact/', 'services/SessionMemory/'],
  },
  c14: {
    id: 'c14',
    title: '子代理系统',
    subtitle: '递归的 query() 调用',
    coreAddition: 'Fork 模型 × MCP 共享 × 内置代理',
    keyInsight: '子代理通过递归调用 query() 实现，与主代理共享 MCP 连接但隔离上下文',
    layer: 'integration',
    sourceFiles: ['tools/AgentTool/', 'tools/SendMessageTool/'],
  },
  c15: {
    id: 'c15',
    title: 'Teams 多代理协作',
    subtitle: 'Swarm 编排架构',
    coreAddition: '团队创建 × 后端适配 × 权限同步 × 记忆共享',
    keyInsight: 'Swarm 通过 iTerm/Tmux/InProcess 三种后端，支持从本地到分布式的多代理协作',
    layer: 'integration',
    sourceFiles: ['tools/TeamCreateTool/', 'utils/swarm/', 'coordinator/'],
  },
  c16: {
    id: 'c16',
    title: '任务与调度',
    subtitle: '五种任务类型',
    coreAddition: 'Main / Agent / Shell / Teammate / Dream × Cron',
    keyInsight: 'DreamTask 在后台静默执行，实现了 "AI 做梦" 式的异步知识整理',
    layer: 'integration',
    sourceFiles: ['tasks/', 'tools/ScheduleCronTool/', 'services/autoDream/'],
  },
  c17: {
    id: 'c17',
    title: 'Skills 与 Plugins',
    subtitle: '可扩展的能力生态',
    coreAddition: '技能加载 × 插件市场 × 83+ 斜杠命令',
    keyInsight: 'Skills 通过 Frontmatter 声明 Hook，让 Markdown 文件具有编程能力',
    layer: 'integration',
    sourceFiles: ['skills/', 'plugins/', 'commands/'],
  },
  c18: {
    id: 'c18',
    title: '状态管理',
    subtitle: 'DeepImmutable 状态树',
    coreAddition: 'AppState 300+ 字段 × createStore × 副作用',
    keyInsight: 'DeepImmutable 类型约束 + 函数式更新，在无框架依赖下实现可预测状态管理',
    layer: 'ui-state',
    sourceFiles: ['state/', 'bootstrap/state.ts'],
  },
  c19: {
    id: 'c19',
    title: '终端 UI 框架',
    subtitle: '自定义 Ink 的 React 终端',
    coreAddition: 'Reconciler → DOM → Renderer × Flexbox × Vim',
    keyInsight: '通过自定义 React Reconciler，将 React 组件树渲染为 ANSI 终端输出',
    layer: 'ui-state',
    sourceFiles: ['ink/', 'components/', 'screens/', 'vim/'],
  },
  c20: {
    id: 'c20',
    title: 'Bridge 与远程集成',
    subtitle: 'IDE 双向通信与远程控制',
    coreAddition: 'Bridge 协议 × Teleport × Computer Use × 远程会话',
    keyInsight: 'Bridge 将 Claude Code 从独立 CLI 升级为 IDE 的智能内核',
    layer: 'ui-state',
    sourceFiles: ['bridge/', 'remote/', 'utils/teleport/', 'utils/computerUse/'],
  },
}

export const LEARNING_PATH = [
  'c01', 'c02', 'c03', 'c04', 'c05',
  'c06', 'c07', 'c08', 'c09',
  'c10', 'c11',
  'c12', 'c13', 'c14', 'c15', 'c16', 'c17',
  'c18', 'c19', 'c20',
]

export const LAYER_GROUPS: { layer: Layer; chapters: string[] }[] = [
  { layer: 'foundation', chapters: ['c01', 'c02'] },
  { layer: 'engine', chapters: ['c03', 'c04', 'c05'] },
  { layer: 'tools', chapters: ['c06', 'c07', 'c08', 'c09'] },
  { layer: 'security', chapters: ['c10', 'c11'] },
  { layer: 'integration', chapters: ['c12', 'c13', 'c14', 'c15', 'c16', 'c17'] },
  { layer: 'ui-state', chapters: ['c18', 'c19', 'c20'] },
]
