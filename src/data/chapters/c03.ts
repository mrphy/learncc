import type { ChapterData } from '../chapters'

export const c03: ChapterData = {
  content: `
<h2>查询引擎概述</h2>
<blockquote>QueryEngine 是 Claude Code 的"大脑"，它管理着每次对话的完整生命周期——从消息构建到 API 调用，从工具执行到结果记录。每个 REPL 会话拥有一个 QueryEngine 实例，它维护着对话状态、token 追踪和权限管理。</blockquote>

<h3>QueryEngine 类的核心状态</h3>
<p><code>QueryEngine</code> 类是一个有状态的查询管理器，内部维护以下关键状态：</p>
<ul>
<li><strong>mutableMessages</strong> — 可变的消息数组，存储整个对话历史。这是一个引用类型，外部持有者可以观察到 QueryEngine 对它的修改</li>
<li><strong>abortController</strong> — 用于取消正在进行的 API 请求。用户按下 Ctrl+C 或 Escape 时触发 abort</li>
<li><strong>permissionDenials</strong> — 记录用户拒绝过的权限请求，避免在同一会话中重复询问</li>
<li><strong>totalUsage</strong> — Token 消耗追踪器，按模型分别记录 input/output/cache tokens，用于费用计算和上下文管理</li>
<li><strong>readFileState</strong> — LRU（最近最少使用）文件缓存，存储最近读取的文件内容，避免重复读取同一文件</li>
<li><strong>discoveredSkillNames</strong> — 已发现的 Skill 名称集合，用于 Skill 系统的去重</li>
<li><strong>loadedNestedMemoryPaths</strong> — 已加载的嵌套 CLAUDE.md 记忆文件路径集合，防止循环引用</li>
</ul>

<h3>submitMessage() 异步生成器</h3>
<p><code>submitMessage()</code> 是 QueryEngine 的核心公开方法，它返回一个 <code>AsyncGenerator</code>，逐步 yield 出 SDK 消息供 UI 层消费。其完整生命周期：</p>
<ol>
<li><strong>清除追踪状态</strong> — 重置 permissionDenials 等临时状态</li>
<li><strong>包装 canUseTool</strong> — 将权限检查函数与当前上下文绑定，创建带缓存的工具权限检查器</li>
<li><strong>获取系统提示词片段</strong> — 调用 <code>fetchSystemPromptParts()</code> 组装系统提示词的各个部分</li>
<li><strong>处理用户输入</strong> — 将用户的文本消息转换为 API 兼容的消息格式</li>
<li><strong>调用 query()</strong> — 进入查询循环，开始与 Claude API 的交互</li>
<li><strong>yield SDK 消息</strong> — 将从 API 返回的消息逐个 yield 出去，供 UI 实时渲染</li>
<li><strong>记录会话转录</strong> — 将完整的对话记录保存到 transcript 文件</li>
</ol>

<h3>系统提示词组装</h3>
<p>系统提示词不是一个静态字符串，而是由多个来源动态组装：</p>
<ul>
<li><strong>基础提示词</strong> — Claude Code 的核心行为指令</li>
<li><strong>工具说明</strong> — 当前可用工具的使用说明</li>
<li><strong>CLAUDE.md 记忆</strong> — 项目级和用户级的记忆文件内容</li>
<li><strong>MCP 工具说明</strong> — 已连接的 MCP 服务器提供的工具说明</li>
<li><strong>上下文信息</strong> — 当前工作目录、git 状态等环境信息</li>
<li><strong>用户自定义指令</strong> — 通过配置注入的自定义系统提示词</li>
</ul>

<h3>Coordinator 用户上下文注入</h3>
<p>当 Claude Code 以 Coordinator（协调者）模式运行时，系统会注入额外的上下文信息，包括当前项目的目录结构摘要、最近的 git 变更记录、以及其他 Agent 的执行状态。这使得 Coordinator 能够做出更好的任务分配决策。</p>

<h3>SDK 消息转换与 yield</h3>
<p>QueryEngine 将 Anthropic SDK 返回的原始消息对象转换为统一的内部格式，然后通过 <code>yield*</code> 逐个发射给调用者。这种 AsyncGenerator 模式使得 UI 层可以实时渲染流式响应，而不需要等待整个回复完成。</p>

<h3>QueryEngineConfig 类型</h3>
<p><code>QueryEngineConfig</code> 定义了创建 QueryEngine 时所需的配置：</p>
<ul>
<li><code>model</code> — 使用的模型名称</li>
<li><code>maxTurns</code> — 最大对话轮数</li>
<li><code>systemPrompt</code> — 基础系统提示词</li>
<li><code>tools</code> — 可用工具列表</li>
<li><code>permissionMode</code> — 权限检查模式</li>
<li><code>budget</code> — Token 预算限制</li>
<li><code>onMessage</code> — 消息回调函数</li>
</ul>
`,

  architecture: `
<h2>查询引擎架构</h2>

<h3>QueryEngine 状态管理</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>状态字段</th><th>类型</th><th>用途</th><th>生命周期</th></tr></thead>
<tbody>
<tr><td>mutableMessages</td><td>Message[]</td><td>对话历史</td><td>整个会话</td></tr>
<tr><td>abortController</td><td>AbortController</td><td>请求取消</td><td>每次 submitMessage</td></tr>
<tr><td>permissionDenials</td><td>Set&lt;string&gt;</td><td>权限拒绝记录</td><td>每次 submitMessage 重置</td></tr>
<tr><td>totalUsage</td><td>UsageTracker</td><td>Token 消耗追踪</td><td>整个会话累加</td></tr>
<tr><td>readFileState</td><td>LRUCache</td><td>文件内容缓存</td><td>整个会话（LRU 淘汰）</td></tr>
<tr><td>discoveredSkillNames</td><td>Set&lt;string&gt;</td><td>已发现 Skill</td><td>整个会话</td></tr>
<tr><td>loadedNestedMemoryPaths</td><td>Set&lt;string&gt;</td><td>已加载记忆路径</td><td>整个会话</td></tr>
</tbody>
</table>
</div>

<h3>submitMessage() 调用链</h3>
<p>消息提交的调用链如下：</p>
<ul>
<li><strong>REPL UI</strong> → <code>queryEngine.submitMessage(userInput)</code>
  <ul>
  <li>→ 清除临时状态</li>
  <li>→ 包装 canUseTool 权限检查</li>
  <li>→ fetchSystemPromptParts() 组装系统提示词</li>
  <li>→ <strong>query()</strong>（进入查询循环）
    <ul>
    <li>→ queryLoop()（内部循环）</li>
    <li>→ API 调用 + 工具执行</li>
    <li>→ yield StreamEvent</li>
    </ul>
  </li>
  <li>→ recordTranscript() 保存转录</li>
  </ul>
</li>
</ul>

<h3>与其他模块的关系</h3>
<ul>
<li><strong>QueryEngine</strong> → 调用 <code>query()</code> 进入查询循环</li>
<li><strong>QueryEngine</strong> → 使用 <code>fetchSystemPromptParts()</code> 组装提示词</li>
<li><strong>QueryEngine</strong> → 通过 <code>canUseTool()</code> 检查工具权限</li>
<li><strong>QueryEngine</strong> → 与 <code>UsageTracker</code> 协作追踪 token 消耗</li>
<li><strong>REPL</strong> → 持有 QueryEngine 实例，消费 AsyncGenerator 输出</li>
</ul>
`,

  codeExamples: [
    {
      title: 'QueryEngine 类核心结构',
      language: 'typescript',
      code: `// QueryEngine.ts — 简化版
export class QueryEngine {
  // 核心状态
  private mutableMessages: Message[] = []
  private abortController: AbortController | null = null
  private permissionDenials = new Set<string>()
  private totalUsage: UsageTracker = createUsageTracker()
  private readFileState = new LRUCache<string, FileContent>({
    max: 100  // 最多缓存 100 个文件
  })
  private discoveredSkillNames = new Set<string>()
  private loadedNestedMemoryPaths = new Set<string>()

  // 配置
  private config: QueryEngineConfig

  constructor(config: QueryEngineConfig) {
    this.config = config
  }

  // 取消当前查询
  abort(): void {
    this.abortController?.abort()
  }

  // 获取 token 使用统计
  getUsage(): UsageSummary {
    return this.totalUsage.getSummary()
  }

  // 核心方法：提交消息（见下一个示例）
  async *submitMessage(userInput: string): AsyncGenerator<Message> {
    // ...
  }
}`
    },
    {
      title: 'submitMessage() 完整生命周期',
      language: 'typescript',
      code: `// QueryEngine.ts — submitMessage 简化版
async *submitMessage(
  userInput: string
): AsyncGenerator<Message> {
  // 1. 清除上一轮的临时状态
  this.permissionDenials.clear()

  // 2. 创建新的 AbortController
  this.abortController = new AbortController()

  // 3. 包装工具权限检查
  const canUseTool = wrapCanUseTool(
    this.config.permissionMode,
    this.permissionDenials
  )

  // 4. 组装系统提示词（多源合并）
  const systemPromptParts = await fetchSystemPromptParts({
    tools: this.config.tools,
    memories: this.loadedNestedMemoryPaths,
    cwd: process.cwd(),
    skills: this.discoveredSkillNames,
  })

  // 5. 添加用户消息到对话历史
  this.mutableMessages.push({
    role: 'user',
    content: userInput,
  })

  // 6. 进入查询循环，yield 所有响应消息
  const queryGen = query({
    messages: this.mutableMessages,
    systemPrompt: systemPromptParts.join('\\n'),
    model: this.config.model,
    tools: this.config.tools,
    canUseTool,
    abortSignal: this.abortController.signal,
    usage: this.totalUsage,
    readFileState: this.readFileState,
  })

  // 7. 逐个 yield SDK 消息供 UI 消费
  for await (const event of queryGen) {
    if (event.type === 'message') {
      this.mutableMessages.push(event.message)
      yield event.message
    }
  }

  // 8. 记录会话转录
  await recordTranscript(this.mutableMessages)
}`
    },
    {
      title: '系统提示词多源组装',
      language: 'typescript',
      code: `// fetchSystemPromptParts — 简化版
async function fetchSystemPromptParts(opts: {
  tools: Tool[]
  memories: Set<string>
  cwd: string
  skills: Set<string>
}): Promise<string[]> {
  const parts: string[] = []

  // 1. 基础系统提示词
  parts.push(BASE_SYSTEM_PROMPT)

  // 2. 工具使用说明
  for (const tool of opts.tools) {
    parts.push(formatToolDescription(tool))
  }

  // 3. CLAUDE.md 项目记忆
  const projectMemory = await loadClaudeMd(opts.cwd)
  if (projectMemory) {
    parts.push(\`<project-memory>\\n\${projectMemory}\\n</project-memory>\`)
  }

  // 4. 用户级记忆（~/.claude/CLAUDE.md）
  const userMemory = await loadUserClaudeMd()
  if (userMemory) {
    parts.push(\`<user-memory>\\n\${userMemory}\\n</user-memory>\`)
  }

  // 5. 环境上下文
  parts.push(\`Current directory: \${opts.cwd}\`)
  parts.push(\`Platform: \${process.platform}\`)

  // 6. Coordinator 模式额外上下文
  if (isCoordinatorMode()) {
    parts.push(await getCoordinatorContext())
  }

  return parts
}`
    }
  ],

  interactive: `
<h2>查询引擎互动解析</h2>

<h3>第 1 步：理解 AsyncGenerator 模式</h3>
<p>为什么 <code>submitMessage()</code> 返回 <code>AsyncGenerator</code> 而不是 <code>Promise</code>？</p>
<p>因为 Claude 的响应是<strong>流式的</strong>。如果使用 Promise，UI 必须等到整个回复完成才能显示，用户会看到长时间的"思考中..."。AsyncGenerator 让 UI 可以在每个 token 到达时立即渲染，实现打字机效果。</p>

<h3>第 2 步：状态的生命周期</h3>
<p>注意不同状态字段的生命周期差异：</p>
<ul>
<li><code>totalUsage</code> 在整个会话中<strong>持续累加</strong>，因为用户需要看到总费用</li>
<li><code>permissionDenials</code> 在每次 <code>submitMessage</code> 时<strong>清除</strong>，因为用户可能改变了主意</li>
<li><code>readFileState</code> 使用 <strong>LRU 缓存</strong>，自动淘汰最久未使用的文件内容</li>
</ul>

<h3>第 3 步：权限检查的包装</h3>
<p><code>wrapCanUseTool()</code> 为什么要每次 submitMessage 时重新包装？因为它需要捕获当前轮次的 <code>permissionDenials</code> 引用。当用户拒绝某个工具后，该拒绝记录仅在当前轮次有效——下一轮用户可能会允许它。</p>

<h3>第 4 步：系统提示词的动态性</h3>
<p>每次调用 <code>fetchSystemPromptParts()</code> 都会重新组装系统提示词。这意味着：</p>
<ul>
<li>如果用户在对话中修改了 <code>CLAUDE.md</code>，下一轮对话就会使用更新后的内容</li>
<li>新发现的 Skill 会自动添加到系统提示词中</li>
<li>环境上下文（如 cd 到新目录）会实时反映</li>
</ul>

<h3>核心设计洞察</h3>
<ul>
<li><strong>有状态但可控</strong>：QueryEngine 维护必要的状态，但每个状态都有明确的生命周期规则</li>
<li><strong>流式优先</strong>：AsyncGenerator 模式贯穿整个消息管道，从 API 到 UI</li>
<li><strong>权限即时性</strong>：权限决策不会跨轮持久化，尊重用户的即时意愿</li>
</ul>
`
}
