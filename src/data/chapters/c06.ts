import type { ChapterData } from '../chapters'

export const c06: ChapterData = {
  content: `
<h2>工具架构概述</h2>
<blockquote>Claude Code 的核心能力来自于其工具系统。每一个"工具"（Tool）都是一个独立的能力单元——文件读写、代码搜索、Bash 执行、Web 搜索等。工具架构定义了统一的接口约束、注册发现机制、上下文传递模式和特性门控策略，使得 42+ 种工具可以在同一个框架下协同工作。</blockquote>

<h3>Tool&lt;Input, Output, P&gt; 接口：30+ 属性的"超级接口"</h3>
<p><code>Tool.ts</code> 定义了工具系统最核心的泛型接口 <code>Tool&lt;Input, Output, P&gt;</code>。每个工具实现都必须满足这个接口的约束。三个泛型参数分别是：</p>
<ul>
<li><strong>Input</strong> — 工具的输入类型，由 Zod schema 定义（如 BashTool 的 <code>{ command: string, timeout?: number }</code>）</li>
<li><strong>Output</strong> — 工具的输出类型，通常是 <code>string</code> 或结构化数据</li>
<li><strong>P</strong> — 权限类型参数，用于类型安全的权限检查</li>
</ul>
<p>该接口包含 30+ 个属性和方法，按职责分为以下几组：</p>

<h4>标识与发现</h4>
<ul>
<li><code>name</code> — 工具的唯一标识符（如 <code>"Bash"</code>、<code>"Read"</code>）</li>
<li><code>aliases</code> — 别名列表，用于兼容旧名称</li>
<li><code>searchHint</code> — 搜索提示词，供 ToolSearchTool 做关键词匹配</li>
<li><code>userFacingName()</code> — 返回面向用户显示的名称</li>
</ul>

<h4>Schema 与校验</h4>
<ul>
<li><code>inputSchema</code> — Zod schema 定义，用于运行时校验输入</li>
<li><code>inputJSONSchema</code> — 转换后的 JSON Schema，发送给 API</li>
<li><code>validateInput()</code> — 自定义输入校验逻辑（超出 schema 的业务规则）</li>
</ul>

<h4>执行与结果</h4>
<ul>
<li><code>call(input, context)</code> — 核心执行方法，接收输入和 ToolUseContext</li>
<li><code>maxResultSizeChars</code> — 结果最大字符数，超出则持久化到磁盘</li>
<li><code>mapToolResultToToolResultBlockParam()</code> — 将结果转换为 API 兼容格式</li>
</ul>

<h4>权限与安全</h4>
<ul>
<li><code>checkPermissions()</code> — 检查当前上下文是否有权执行该工具</li>
<li><code>preparePermissionMatcher()</code> — 准备权限匹配器（如 Bash 的命令分类）</li>
<li><code>isReadOnly()</code> — 是否为只读工具（读文件、搜索等）</li>
<li><code>isDestructive()</code> — 是否为破坏性工具（删除文件、强制推送等）</li>
</ul>

<h4>并发与中断</h4>
<ul>
<li><code>isConcurrencySafe()</code> — 是否支持并发执行（如 GlobTool 可以并发，BashTool 不行）</li>
<li><code>interruptBehavior()</code> — 中断时的行为：<code>'abort'</code>（立即停止）或 <code>'finish'</code>（完成当前操作）</li>
</ul>

<h4>提示与渲染</h4>
<ul>
<li><code>description()</code> — 发送给 Claude 的工具描述（影响模型选择哪个工具）</li>
<li><code>prompt()</code> — 额外的提示信息，注入到系统提示词中</li>
<li><code>renderToolUseMessage()</code> — 在 UI 中渲染工具调用的消息</li>
<li><code>toAutoClassifierInput()</code> — 转换为自动分类器（权限判断）的输入</li>
</ul>

<h3>ToolUseContext："上帝上下文"</h3>
<p><code>ToolUseContext</code> 是传递给每个工具的 <code>call()</code> 方法的上下文对象，它携带了工具执行所需的一切信息：</p>
<ul>
<li><code>options</code> — 全局选项（工作目录、模型、权限模式等）</li>
<li><code>abortController</code> — 用于中断当前工具执行的 AbortController</li>
<li><code>readFileState</code> — 文件读取状态缓存（避免重复读取）</li>
<li><code>getAppState()/setAppState()</code> — 全局应用状态的读写接口</li>
<li><code>messages</code> — 当前对话的完整消息历史</li>
<li><code>agentId</code> — 当前 Agent 的标识符（主 Agent 或子 Agent）</li>
<li><code>queryTracking</code> — 查询追踪信息（用于遥测）</li>
<li><code>contentReplacementState</code> — 内容替换状态（用于大结果的磁盘持久化）</li>
</ul>

<h3>ToolResult&lt;T&gt;：结构化返回值</h3>
<p>工具的返回值不只是简单的字符串，而是一个结构化的 <code>ToolResult&lt;T&gt;</code>：</p>
<ul>
<li><code>data</code> — 实际的输出数据</li>
<li><code>newMessages</code> — 工具执行过程中生成的新消息（如 AskUserQuestionTool 收到的用户回复）</li>
<li><code>contextModifier</code> — 上下文修改器（如 SkillTool 加载 skill 后修改系统提示词）</li>
<li><code>mcpMeta</code> — MCP 元数据（如果是 MCP 工具调用）</li>
</ul>

<h3>工具注册与发现</h3>
<p><code>tools.ts</code> 是工具的注册中心，提供三个关键函数：</p>
<ul>
<li><code>getAllBaseTools()</code> — 返回所有 42+ 个内置工具实例的数组</li>
<li><code>getTools()</code> — 在 <code>getAllBaseTools()</code> 基础上，根据 deny 规则和 <code>isEnabled()</code> 过滤不可用的工具</li>
<li><code>assembleToolPool()</code> — 合并内置工具和 MCP 工具，使用缓存稳定排序确保工具顺序一致</li>
</ul>

<h3>特性门控与 DCE</h3>
<p>Claude Code 使用 <code>bun:bundle</code> 的编译时死代码消除（DCE, Dead Code Elimination）实现特性门控：</p>
<ul>
<li>不同编译目标（如 OSS vs 内部版本）会定义不同的特性标志</li>
<li>编译器在打包时将关闭的特性对应的代码完全移除</li>
<li>这意味着某些工具在特定版本中根本不存在于最终产物中，而不是运行时判断</li>
</ul>

<h3>循环依赖破解</h3>
<p>由于工具系统与其他模块（如查询循环、权限系统）存在循环依赖，Claude Code 使用了延迟 <code>require()</code> 模式：</p>
<ul>
<li>在文件顶层不导入有循环依赖的模块</li>
<li>在函数体内使用 <code>require()</code> 延迟加载</li>
<li>这确保模块初始化顺序正确，避免导入时获得 <code>undefined</code></li>
</ul>
`,

  architecture: `
<h2>工具架构图</h2>

<h3>核心类型层次</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>类型</th><th>职责</th><th>关键字段/方法</th></tr></thead>
<tbody>
<tr><td>Tool&lt;I,O,P&gt;</td><td>工具接口（30+ 属性）</td><td>name, call(), checkPermissions(), inputSchema</td></tr>
<tr><td>ToolUseContext</td><td>执行上下文（"上帝对象"）</td><td>options, abortController, messages, readFileState</td></tr>
<tr><td>ToolPermissionContext</td><td>权限上下文</td><td>mode, alwaysAllowRules, alwaysDenyRules</td></tr>
<tr><td>ToolResult&lt;T&gt;</td><td>结构化返回值</td><td>data, newMessages, contextModifier, mcpMeta</td></tr>
</tbody>
</table>
</div>

<h3>工具发现流程</h3>
<ol>
<li><strong>getAllBaseTools()</strong> — 实例化 42+ 个内置工具</li>
<li><strong>getTools(deny)</strong> — 过滤被禁用的工具（deny rules + isEnabled()）</li>
<li><strong>assembleToolPool(built-in, MCP)</strong> — 合并内置 + MCP 工具，缓存稳定排序</li>
<li><strong>发送给 API</strong> — 将工具池序列化为 JSON Schema 格式的工具定义</li>
</ol>

<h3>Tool 接口属性分组</h3>
<ul>
<li><strong>标识组 (4)</strong>：name, aliases, searchHint, userFacingName()</li>
<li><strong>Schema 组 (3)</strong>：inputSchema, inputJSONSchema, validateInput()</li>
<li><strong>执行组 (3)</strong>：call(), maxResultSizeChars, mapToolResultToToolResultBlockParam()</li>
<li><strong>权限组 (4)</strong>：checkPermissions(), preparePermissionMatcher(), isReadOnly(), isDestructive()</li>
<li><strong>并发组 (2)</strong>：isConcurrencySafe(), interruptBehavior()</li>
<li><strong>提示组 (4)</strong>：description(), prompt(), renderToolUseMessage(), toAutoClassifierInput()</li>
<li><strong>门控组 (1)</strong>：isEnabled()</li>
</ul>

<h3>特性门控机制</h3>
<p>编译时 DCE（Dead Code Elimination）流程：</p>
<ol>
<li>定义特性标志常量（如 <code>FEATURE_MCP = true</code>）</li>
<li>代码中使用 <code>if (FEATURE_MCP) { ... }</code> 条件分支</li>
<li>Bun bundler 在编译时求值常量条件</li>
<li>不可达分支被完全移除，最终产物中不包含相关代码</li>
</ol>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么 ToolUseContext 是"上帝对象"？</strong></p>
<p>在工具系统中，每个工具可能需要访问截然不同的上下文信息。BashTool 需要 abortController 来中断进程，FileReadTool 需要 readFileState 做缓存，SkillTool 需要 messages 来理解对话历史。与其让每个工具单独获取这些依赖，不如把所有可能需要的上下文打包成一个对象传入。这虽然违反了"最小知识原则"，但在实践中大幅简化了工具的编写和注册流程。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'Tool<I,O,P> 核心接口定义',
      language: 'typescript',
      code: `// Tool.ts — 简化版核心接口
import { z } from 'zod'

export interface Tool<
  Input = unknown,
  Output = unknown,
  P = unknown
> {
  // === 标识与发现 ===
  name: string
  aliases?: string[]
  searchHint?: string
  userFacingName(): string

  // === Schema ===
  inputSchema: z.ZodType<Input>
  inputJSONSchema: Record<string, unknown>
  validateInput?(input: Input): Promise<string | null>

  // === 执行 ===
  call(input: Input, context: ToolUseContext): Promise<ToolResult<Output>>
  maxResultSizeChars?: number

  // === 权限 ===
  checkPermissions(
    input: Input,
    context: ToolPermissionContext
  ): Promise<PermissionCheckResult>
  isReadOnly(): boolean
  isDestructive(): boolean

  // === 并发与中断 ===
  isConcurrencySafe(): boolean
  interruptBehavior(): 'abort' | 'finish'

  // === 提示与渲染 ===
  description(): string
  prompt?(): string
  isEnabled?(): boolean
  renderToolUseMessage?(input: Input): ToolUseMessage
}

// ToolUseContext — 工具执行的"上帝上下文"
export interface ToolUseContext {
  options: GlobalOptions
  abortController: AbortController
  readFileState: ReadFileState
  getAppState: () => AppState
  setAppState: (updater: (state: AppState) => AppState) => void
  messages: Message[]
  agentId: string
  queryTracking: QueryTracking
  contentReplacementState: ContentReplacementState
}

// ToolResult<T> — 结构化返回值
export interface ToolResult<T = string> {
  data: T
  newMessages?: Message[]
  contextModifier?: (context: SystemPromptContext) => SystemPromptContext
  mcpMeta?: McpMeta
}`
    },
    {
      title: '工具注册与发现机制',
      language: 'typescript',
      code: `// tools.ts — 工具注册中心（简化版）

// 1. 获取所有内置工具
export function getAllBaseTools(): Tool[] {
  return [
    new BashTool(),
    new FileReadTool(),
    new FileEditTool(),
    new FileWriteTool(),
    new GlobTool(),
    new GrepTool(),
    new LSPTool(),
    new WebFetchTool(),
    new WebSearchTool(),
    new NotebookEditTool(),
    new SkillTool(),
    new AskUserQuestionTool(),
    new ToolSearchTool(),
    new TodoWriteTool(),
    new EnterPlanModeTool(),
    new ExitPlanModeV2Tool(),
    // ... 42+ 工具实例
  ]
}

// 2. 按规则过滤不可用的工具
export function getTools(
  denyRules: DenyRule[] = []
): Tool[] {
  return getAllBaseTools().filter(tool => {
    // 特性门控：编译时 DCE 可能已移除某些工具
    if (tool.isEnabled && !tool.isEnabled()) return false

    // 运行时禁用规则
    if (denyRules.some(rule => matchTool(rule, tool.name))) {
      return false
    }

    return true
  })
}

// 3. 合并内置 + MCP 工具
export function assembleToolPool(
  builtInTools: Tool[],
  mcpTools: Tool[]
): Tool[] {
  const allTools = [...builtInTools, ...mcpTools]

  // 缓存稳定排序：确保相同的工具集合
  // 总是产生相同的排序顺序
  // 这对 API 缓存命中很重要
  return stableSortTools(allTools)
}

function stableSortTools(tools: Tool[]): Tool[] {
  // 内置工具保持注册顺序
  // MCP 工具按名称字母序排列
  // 合并时内置工具在前，MCP 在后
  const builtIn = tools.filter(t => !t.isMcpTool)
  const mcp = tools
    .filter(t => t.isMcpTool)
    .sort((a, b) => a.name.localeCompare(b.name))
  return [...builtIn, ...mcp]
}`
    },
    {
      title: '特性门控与循环依赖破解',
      language: 'typescript',
      code: `// === 特性门控：编译时 DCE ===

// features.ts — 特性标志（编译时常量）
// Bun bundler 会在编译时将这些替换为字面量
export const FEATURE_MCP = true        // MCP 工具支持
export const FEATURE_POWER_SHELL = false // PowerShell (仅 Windows)
export const FEATURE_WORKTREE = true    // Git worktree 支持

// 在工具注册中使用
import { FEATURE_MCP, FEATURE_POWER_SHELL } from './features'

export function getAllBaseTools(): Tool[] {
  const tools: Tool[] = [
    new BashTool(),
    new FileReadTool(),
    // ... 核心工具
  ]

  // 编译时 DCE：如果 FEATURE_POWER_SHELL = false,
  // 整个分支（包括 PowerShellTool 的 import）被移除
  if (FEATURE_POWER_SHELL) {
    tools.push(new PowerShellTool())
  }

  // 编译时 DCE：MCP 相关代码仅在启用时保留
  if (FEATURE_MCP) {
    // MCP 工具在 assembleToolPool 中动态添加
  }

  return tools
}

// === 循环依赖破解：延迟 require() ===

// 问题：Tool → QueryLoop → Tool（循环）
// 解决方案：在函数体内延迟加载

export class SkillTool implements Tool {
  async call(input: SkillInput, context: ToolUseContext) {
    // 延迟 require，避免循环依赖
    // 如果在文件顶层 import，模块初始化时
    // QueryLoop 可能还未完成导出
    const { runSubConversation } = require('../queryLoop')

    return runSubConversation({
      skill: input.skill,
      messages: context.messages,
      // ...
    })
  }
}

// 另一个常见模式：类型导入不会引起循环依赖
import type { QueryLoop } from '../queryLoop' // OK: 仅类型
// import { QueryLoop } from '../queryLoop' // 危险: 运行时导入`
    }
  ],

  interactive: `
<h2>工具架构互动解析</h2>

<h3>第 1 步：理解 30+ 属性接口的设计意图</h3>
<p>为什么一个工具接口需要 30+ 个属性？让我们从一个工具的"生命周期"来理解：</p>
<ol>
<li><strong>发现阶段</strong> — Claude 需要知道有哪些工具可用（name, description, searchHint）</li>
<li><strong>选择阶段</strong> — Claude 决定使用哪个工具（inputJSONSchema 告诉 Claude 参数格式）</li>
<li><strong>权限阶段</strong> — 系统检查是否允许执行（checkPermissions, isReadOnly, isDestructive）</li>
<li><strong>执行阶段</strong> — 实际运行工具逻辑（call, validateInput, maxResultSizeChars）</li>
<li><strong>渲染阶段</strong> — 在 UI 中展示结果（renderToolUseMessage, userFacingName）</li>
<li><strong>编排阶段</strong> — 多工具并发调度（isConcurrencySafe, interruptBehavior）</li>
</ol>
<p>每个阶段都需要工具提供不同的信息，这就是为什么接口如此"丰富"。</p>

<h3>第 2 步：ToolUseContext 的"上帝对象"模式</h3>
<p>ToolUseContext 包含了工具可能需要的所有上下文。这是一种务实的设计选择：</p>
<ul>
<li><strong>优点</strong>：新增工具时不需要修改调用方代码，只需要从 context 中取需要的数据</li>
<li><strong>优点</strong>：工具签名统一，所有工具的 call 方法参数一致</li>
<li><strong>缺点</strong>：工具可以访问它不需要的数据（如 BashTool 可以访问 readFileState）</li>
<li><strong>权衡</strong>：在 42+ 工具的规模下，统一接口的生产力收益远大于松耦合的理论优势</li>
</ul>

<h3>第 3 步：assembleToolPool 的缓存稳定排序</h3>
<p>为什么工具排序需要"缓存稳定"？这与 Anthropic API 的提示缓存有关：</p>
<ul>
<li>API 请求中的 <code>tools</code> 数组是请求的一部分</li>
<li>如果工具顺序变化，整个请求的哈希变化，缓存失效</li>
<li>通过保证相同工具集合始终以相同顺序排列，缓存命中率大幅提高</li>
<li>这是一个典型的"看不见的优化"——用户无感知但节省大量 token 成本</li>
</ul>

<h3>第 4 步：编译时 DCE vs 运行时判断</h3>
<p>传统做法是运行时 <code>if (config.enableFeature)</code>，但 Claude Code 选择了编译时 DCE：</p>
<ul>
<li><strong>运行时判断</strong>：代码仍在最终产物中，只是不执行。增加包大小和攻击面</li>
<li><strong>编译时 DCE</strong>：代码从最终产物中完全移除。包更小，不可能意外启用</li>
<li><strong>代价</strong>：需要为不同特性集合构建不同的二进制文件</li>
<li><strong>适用场景</strong>：OSS 版本 vs 内部版本等需要完全隔离的场景</li>
</ul>

<h3>第 5 步：循环依赖是如何产生的？</h3>
<p>工具系统中循环依赖的典型案例：</p>
<ol>
<li>SkillTool 需要调用 QueryLoop 来运行子对话</li>
<li>QueryLoop 需要 getTools() 来获取工具列表</li>
<li>getTools() 实例化所有工具，包括 SkillTool</li>
<li>形成闭环：SkillTool → QueryLoop → getTools() → SkillTool</li>
</ol>
<p>延迟 <code>require()</code> 打破了这个闭环：SkillTool 在定义时不导入 QueryLoop，只在 <code>call()</code> 被实际调用时才加载。此时所有模块都已完成初始化，不会得到 undefined。</p>

<h3>关键设计洞察</h3>
<ul>
<li><strong>接口驱动</strong>：30+ 属性的接口看似笨重，但确保了工具系统的统一性和可预测性</li>
<li><strong>务实 > 纯洁</strong>：ToolUseContext 的"上帝对象"模式牺牲了耦合度，换取了开发效率</li>
<li><strong>缓存意识</strong>：工具排序的稳定性直接影响 API token 成本</li>
<li><strong>编译时安全</strong>：DCE 确保不同版本之间的特性隔离在物理层面不可逆</li>
</ul>
`
}
