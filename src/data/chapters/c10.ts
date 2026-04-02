import type { ChapterData } from '../chapters'

export const c10: ChapterData = {
  content: `
<h2>权限系统概述</h2>
<blockquote>Claude Code 的权限系统是安全性的最后一道防线。它决定了 Claude 能做什么、不能做什么、需要用户确认后才能做什么。这套系统由 5 层决策逻辑、多种权限模式、命令分类器、沙箱适配器和交互式确认对话框构成。每一次工具调用都要经过这套系统的审查。</blockquote>

<h3>5 层权限决策</h3>
<p>当一个工具调用到达权限系统时，它按照以下 5 层顺序被评估，第一个做出决策的层"获胜"：</p>

<h4>第 1 层：全局拒绝规则（Blanket Deny Rules）</h4>
<p>最高优先级。这些规则定义了无论如何都不允许的操作：</p>
<ul>
<li>例如：禁止访问 <code>/etc/shadow</code>、禁止执行 <code>rm -rf /</code></li>
<li>这些规则由系统硬编码，用户无法覆盖</li>
<li>如果匹配，立即返回"拒绝"，后续层不再评估</li>
</ul>

<h4>第 2 层：始终允许规则（Always-Allow Rules）</h4>
<p>用户配置的自动允许规则（在 <code>settings.json</code> 中定义）：</p>
<ul>
<li>例如：<code>"always_allow": ["Read", "Glob", "Grep"]</code> 自动允许所有只读工具</li>
<li>Bash 命令可以使用模式匹配：<code>"Bash(npm test*)"</code> 允许所有以 <code>npm test</code> 开头的命令</li>
<li>如果匹配，立即返回"允许"，跳过后续层</li>
</ul>

<h4>第 3 层：始终拒绝规则（Always-Deny Rules）</h4>
<p>用户配置的自动拒绝规则：</p>
<ul>
<li>例如：<code>"always_deny": ["Bash(curl*)", "Bash(wget*)"]</code> 禁止网络下载命令</li>
<li>优先级低于 always-allow，所以如果同一工具同时在两个列表中，always-allow 获胜</li>
</ul>

<h4>第 4 层：工具自身权限检查（Tool checkPermissions()）</h4>
<p>每个工具实现自己的 <code>checkPermissions()</code> 方法：</p>
<ul>
<li>BashTool 会分析命令内容，判断是否需要用户确认</li>
<li>FileWriteTool 检查目标路径是否在工作目录内</li>
<li>这一层可以返回"允许"、"拒绝"或"需要用户确认"</li>
</ul>

<h4>第 5 层：分类器 / 用户确认（Classifier / User Prompt）</h4>
<p>如果前 4 层都没有做出明确决策，系统进入最终判断：</p>
<ul>
<li>在默认模式下，弹出交互式对话框让用户确认</li>
<li>在自动模式（YOLO/Auto）下，由分类器自动判断</li>
<li>用户确认对话框显示工具名称、输入参数和预期行为</li>
</ul>

<h3>PermissionMode：权限模式</h3>
<p>系统支持 4 种权限模式，决定了第 5 层的行为：</p>
<ul>
<li><strong>default</strong> — 默认模式。未通过前 4 层的调用会弹出用户确认对话框</li>
<li><strong>plan</strong> — 计划模式。只读工具自动允许，写操作工具直接拒绝</li>
<li><strong>bypassPermissions</strong> — 绕过权限。所有工具自动允许（仅用于内部测试）</li>
<li><strong>auto</strong> — 自动模式（YOLO 模式）。由分类器自动判断，不打扰用户</li>
</ul>

<h3>Bash 分类器（bashClassifier.ts）</h3>
<p>BashTool 的权限判断比其他工具更复杂，因为 shell 命令的风险差异极大。<code>bashClassifier.ts</code> 专门负责 Bash 命令的安全分类：</p>
<ul>
<li>结合命令的 AST 分析结果（来自 Tree-sitter）</li>
<li>判断命令是否涉及文件修改、网络访问、进程管理等高风险操作</li>
<li>为每个命令生成安全评分和风险标签</li>
<li>根据评分决定是否需要用户确认</li>
</ul>

<h3>YOLO/Auto 模式分类器（yoloClassifier.ts）</h3>
<p>在自动模式下，<code>yoloClassifier.ts</code> 负责在不打扰用户的情况下做安全判断：</p>
<ul>
<li>分析整个对话上下文（transcript-level），而不只是单个工具调用</li>
<li>考虑 Claude 为什么要执行这个操作（基于对话历史）</li>
<li>对明显安全的操作（如用户刚要求的文件编辑）自动放行</li>
<li>对可疑操作（如未预期的 <code>rm</code> 命令）仍然拒绝</li>
</ul>

<h3>拒绝追踪与回退提示（Denial Tracking）</h3>
<p>当分类器多次拒绝 Claude 的工具调用时，系统会触发回退逻辑：</p>
<ul>
<li><code>shouldFallbackToPrompting()</code> 检测重复拒绝的模式</li>
<li>如果同类操作被连续拒绝 3 次以上，回退到用户提示模式</li>
<li>这避免了分类器过于保守导致 Claude 无法完成任务</li>
</ul>

<h3>沙箱适配器（sandbox-adapter.ts）</h3>
<p>对于需要在隔离环境中执行的操作，<code>sandbox-adapter.ts</code> 提供了统一的沙箱接口：</p>
<ul>
<li>抽象不同平台的沙箱实现（macOS sandbox-exec、Linux namespaces 等）</li>
<li>限制文件系统访问范围（只能访问工作目录和显式挂载的路径）</li>
<li>限制网络访问</li>
<li>限制进程能力（不允许提权操作）</li>
</ul>

<h3>useCanUseTool React Hook</h3>
<p><code>useCanUseTool</code> 是前端侧的权限集成点，连接后端权限系统和 UI 交互：</p>
<ul>
<li>当工具调用需要用户确认时，该 hook 触发一个交互式对话框</li>
<li>对话框显示：工具名称、命令内容、预期行为、风险提示</li>
<li>用户可以选择"允许"、"拒绝"、"始终允许此类操作"</li>
<li>支持 coordinator/swarm 模式下的多 Agent 权限管理</li>
</ul>

<h3>Shell 规则匹配</h3>
<p>Bash 命令的权限规则支持模式匹配（Pattern Matching）：</p>
<ul>
<li><code>Bash(git *)</code> — 匹配所有以 <code>git</code> 开头的命令</li>
<li><code>Bash(npm run *)</code> — 匹配所有 <code>npm run</code> 命令</li>
<li><code>Bash(cd *)</code> — 匹配所有目录切换命令</li>
<li>模式使用 glob 语法，<code>*</code> 匹配任意字符序列</li>
<li>匹配在 AST 解析后进行，确保不会被引号嵌套等语法技巧绕过</li>
</ul>

<h3>PermissionDecisionReason</h3>
<p>每个权限决策都附带原因说明，用于审计和调试：</p>
<ul>
<li><code>classifier</code> — 由分类器自动判断</li>
<li><code>hook</code> — 由钩子拦截</li>
<li><code>rule</code> — 由配置规则匹配</li>
<li><code>subcommandResults</code> — 基于子命令分析结果</li>
<li><code>mode</code> — 由当前权限模式决定</li>
<li><code>sandboxOverride</code> — 沙箱覆盖</li>
<li><code>workingDir</code> — 工作目录检查</li>
<li><code>safetyCheck</code> — 安全检查</li>
</ul>
`,

  architecture: `
<h2>权限系统架构</h2>

<h3>核心模块</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>模块</th><th>职责</th><th>关键函数/类型</th></tr></thead>
<tbody>
<tr><td>utils/permissions/</td><td>权限决策引擎</td><td>hasPermissionsToUseTool()</td></tr>
<tr><td>bashClassifier.ts</td><td>Bash 命令安全分类</td><td>classifyBashCommand()</td></tr>
<tr><td>yoloClassifier.ts</td><td>自动模式安全分类</td><td>classifyTranscript()</td></tr>
<tr><td>sandbox-adapter.ts</td><td>沙箱接口适配</td><td>createSandbox(), runInSandbox()</td></tr>
<tr><td>useCanUseTool</td><td>UI 权限对话框</td><td>React Hook + Dialog</td></tr>
</tbody>
</table>
</div>

<h3>5 层权限决策流程</h3>
<ol>
<li><strong>Layer 1: Blanket Deny</strong> → 系统硬编码的绝对禁止规则
  <ul><li>匹配 → <span style="color:#e74c3c">DENY</span>（不可覆盖）</li></ul>
</li>
<li><strong>Layer 2: Always-Allow</strong> → 用户配置的自动允许
  <ul><li>匹配 → <span style="color:#27ae60">ALLOW</span></li></ul>
</li>
<li><strong>Layer 3: Always-Deny</strong> → 用户配置的自动拒绝
  <ul><li>匹配 → <span style="color:#e74c3c">DENY</span></li></ul>
</li>
<li><strong>Layer 4: Tool checkPermissions()</strong> → 工具自身的检查逻辑
  <ul><li>allow/deny/ask → 传递对应决策</li></ul>
</li>
<li><strong>Layer 5: Classifier / User Prompt</strong> → 最终裁定
  <ul>
  <li>default 模式 → 弹窗让用户确认</li>
  <li>auto 模式 → yoloClassifier 自动判断</li>
  <li>plan 模式 → 写操作直接拒绝</li>
  </ul>
</li>
</ol>

<h3>PermissionMode 行为矩阵</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>模式</th><th>只读工具</th><th>写操作工具</th><th>未知风险工具</th></tr></thead>
<tbody>
<tr><td>default</td><td>自动允许</td><td>用户确认</td><td>用户确认</td></tr>
<tr><td>plan</td><td>自动允许</td><td>直接拒绝</td><td>直接拒绝</td></tr>
<tr><td>auto</td><td>自动允许</td><td>分类器判断</td><td>分类器判断</td></tr>
<tr><td>bypassPermissions</td><td>自动允许</td><td>自动允许</td><td>自动允许</td></tr>
</tbody>
</table>
</div>

<h3>拒绝追踪与回退</h3>
<ul>
<li><strong>追踪</strong>：记录每次分类器拒绝的工具名和原因</li>
<li><strong>检测</strong>：shouldFallbackToPrompting() 检查连续拒绝次数</li>
<li><strong>回退</strong>：超过阈值（3次），切换到用户确认模式</li>
<li><strong>重置</strong>：用户做出决策后，重置计数器</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么权限系统是 5 层而不是更简单的 allow/deny 二元决策？</strong></p>
<p>单一层级无法满足不同场景的需求：系统级安全需要硬编码拒绝（第 1 层），用户偏好需要可配置规则（第 2/3 层），工具特有逻辑需要自定义检查（第 4 层），兜底策略需要分类器或人工确认（第 5 层）。每一层解决一个独立的关注点，组合在一起形成了既安全又灵活的权限体系。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: '5 层权限决策引擎',
      language: 'typescript',
      code: `// utils/permissions/hasPermissionsToUseTool.ts — 简化版

export type PermissionDecision = {
  allowed: boolean
  reason: PermissionDecisionReason
  message?: string
}

export type PermissionDecisionReason =
  | 'classifier'
  | 'hook'
  | 'rule'
  | 'subcommandResults'
  | 'mode'
  | 'sandboxOverride'
  | 'workingDir'
  | 'safetyCheck'

export async function hasPermissionsToUseTool(
  tool: Tool,
  input: unknown,
  context: ToolPermissionContext
): Promise<PermissionDecision> {
  // ===== 第 1 层：全局拒绝规则 =====
  const blanketDeny = checkBlanketDenyRules(tool, input)
  if (blanketDeny) {
    return {
      allowed: false,
      reason: 'safetyCheck',
      message: blanketDeny.message,
    }
  }

  // ===== 第 2 层：始终允许规则 =====
  if (context.alwaysAllowRules.length > 0) {
    const allowMatch = matchPermissionRule(
      tool, input, context.alwaysAllowRules
    )
    if (allowMatch) {
      return { allowed: true, reason: 'rule' }
    }
  }

  // ===== 第 3 层：始终拒绝规则 =====
  if (context.alwaysDenyRules.length > 0) {
    const denyMatch = matchPermissionRule(
      tool, input, context.alwaysDenyRules
    )
    if (denyMatch) {
      return {
        allowed: false,
        reason: 'rule',
        message: '被拒绝规则阻止: ' + denyMatch.pattern,
      }
    }
  }

  // ===== 第 4 层：工具自身权限检查 =====
  const toolPermResult = await tool.checkPermissions(input, context)
  if (toolPermResult.decided) {
    return {
      allowed: toolPermResult.allowed,
      reason: toolPermResult.reason,
      message: toolPermResult.message,
    }
  }

  // ===== 第 5 层：根据模式决定 =====
  switch (context.mode) {
    case 'plan':
      // 计划模式：只读工具允许，其余拒绝
      return tool.isReadOnly()
        ? { allowed: true, reason: 'mode' }
        : { allowed: false, reason: 'mode', message: '计划模式下不允许写操作' }

    case 'bypassPermissions':
      return { allowed: true, reason: 'mode' }

    case 'auto':
      // 自动模式：使用分类器
      return classifyForAutoMode(tool, input, context)

    case 'default':
    default:
      // 默认模式：需要用户确认
      return {
        allowed: false,
        reason: 'classifier',
        message: 'needsUserConfirmation',
      }
  }
}

function checkBlanketDenyRules(
  tool: Tool,
  input: unknown
): { message: string } | null {
  // 硬编码的绝对禁止规则
  if (tool.name === 'Bash') {
    const cmd = (input as { command: string }).command
    if (cmd.includes('rm -rf /') && !cmd.includes('rm -rf /tmp')) {
      return { message: '禁止执行可能删除根目录的命令' }
    }
  }
  return null
}`
    },
    {
      title: 'Bash 分类器与 YOLO 分类器',
      language: 'typescript',
      code: `// bashClassifier.ts — Bash 命令安全分类
export interface BashClassification {
  riskLevel: 'safe' | 'moderate' | 'dangerous'
  category: string
  requiresConfirmation: boolean
  explanation: string
}

export function classifyBashCommand(
  command: string,
  astAnalysis: CommandAnalysis
): BashClassification {
  // 已知安全命令
  if (astAnalysis.isReadOnly && !astAnalysis.hasRedirection) {
    return {
      riskLevel: 'safe',
      category: 'read-only',
      requiresConfirmation: false,
      explanation: '只读命令，无副作用',
    }
  }

  // 已知危险命令模式
  const dangerousPatterns = [
    { pattern: /rm\s+(-rf?|--recursive)/, category: 'destructive-delete' },
    { pattern: /chmod\s+777/, category: 'insecure-permissions' },
    { pattern: />\s*\/etc\//, category: 'system-file-write' },
    { pattern: /curl.*\|\s*(bash|sh)/, category: 'remote-code-execution' },
    { pattern: /git\s+push\s+.*--force/, category: 'force-push' },
  ]

  for (const { pattern, category } of dangerousPatterns) {
    if (pattern.test(command)) {
      return {
        riskLevel: 'dangerous',
        category,
        requiresConfirmation: true,
        explanation: '检测到高风险操作: ' + category,
      }
    }
  }

  // 有写操作但不是已知危险的
  if (!astAnalysis.isReadOnly || astAnalysis.hasRedirection) {
    return {
      riskLevel: 'moderate',
      category: 'write-operation',
      requiresConfirmation: true,
      explanation: '命令可能修改文件系统',
    }
  }

  return {
    riskLevel: 'safe',
    category: 'unknown-safe',
    requiresConfirmation: false,
    explanation: '未检测到风险',
  }
}

// yoloClassifier.ts — 自动模式分类
export async function classifyForAutoMode(
  tool: Tool,
  input: unknown,
  context: ToolPermissionContext
): Promise<PermissionDecision> {
  // 只读工具：始终允许
  if (tool.isReadOnly()) {
    return { allowed: true, reason: 'classifier' }
  }

  // Bash 命令：使用专用分类器
  if (tool.name === 'Bash') {
    const cmd = (input as { command: string }).command
    const analysis = analyzeCommand(cmd)
    const classification = classifyBashCommand(cmd, analysis)

    if (classification.riskLevel === 'dangerous') {
      return {
        allowed: false,
        reason: 'classifier',
        message: classification.explanation,
      }
    }

    // 中等风险：检查拒绝追踪
    if (classification.riskLevel === 'moderate') {
      if (shouldFallbackToPrompting(tool.name, context)) {
        return {
          allowed: false,
          reason: 'classifier',
          message: 'needsUserConfirmation',
        }
      }
      return { allowed: true, reason: 'classifier' }
    }
  }

  // 文件写操作：检查是否在工作目录内
  if (tool.name === 'Edit' || tool.name === 'Write') {
    const filePath = (input as { file_path: string }).file_path
    if (isWithinWorkingDir(filePath, context)) {
      return { allowed: true, reason: 'workingDir' }
    }
    return {
      allowed: false,
      reason: 'workingDir',
      message: '文件不在工作目录内',
    }
  }

  // 默认：允许
  return { allowed: true, reason: 'classifier' }
}`
    },
    {
      title: 'Shell 规则匹配与用户确认 Hook',
      language: 'typescript',
      code: `// 权限规则匹配系统

interface PermissionRule {
  pattern: string // "Bash(git *)", "Read", "Edit"
}

export function matchPermissionRule(
  tool: Tool,
  input: unknown,
  rules: PermissionRule[]
): PermissionRule | null {
  for (const rule of rules) {
    if (matchSingleRule(tool, input, rule)) {
      return rule
    }
  }
  return null
}

function matchSingleRule(
  tool: Tool,
  input: unknown,
  rule: PermissionRule
): boolean {
  // 简单工具名匹配: "Read", "Glob"
  if (!rule.pattern.includes('(')) {
    return tool.name === rule.pattern
  }

  // 带参数的匹配: "Bash(npm test*)"
  const match = rule.pattern.match(/^(\\w+)\\((.+)\\)$/)
  if (!match) return false

  const [, toolName, commandPattern] = match
  if (tool.name !== toolName) return false

  // 对 Bash 工具，匹配命令内容
  if (toolName === 'Bash') {
    const command = (input as { command: string }).command
    return globMatch(command.trim(), commandPattern)
  }

  // 对文件工具，匹配文件路径
  if (toolName === 'Read' || toolName === 'Edit' || toolName === 'Write') {
    const filePath = (input as { file_path: string }).file_path
    return globMatch(filePath, commandPattern)
  }

  return false
}

// glob 匹配：* 匹配任意字符序列
function globMatch(text: string, pattern: string): boolean {
  // 转义正则特殊字符，然后将 glob 通配符转换为正则
  const escaped = escapeRegExp(pattern)
  const regexStr = '^' + escaped
    .replace(/\\\\\\*/g, '.*')  // glob * → regex .*
    .replace(/\\\\\\?/g, '.')   // glob ? → regex .
    + '$'
  return new RegExp(regexStr).test(text)
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^$\\\\|()\\[\\]]/g, '\\\\$&')
}

// 拒绝追踪与回退
const denialCounts = new Map<string, number>()

export function shouldFallbackToPrompting(
  toolName: string,
  context: ToolPermissionContext
): boolean {
  const key = toolName
  const count = denialCounts.get(key) ?? 0
  return count >= 3 // 连续拒绝 3 次后回退到用户确认
}

export function trackDenial(toolName: string): void {
  const count = denialCounts.get(toolName) ?? 0
  denialCounts.set(toolName, count + 1)
}

export function resetDenials(toolName: string): void {
  denialCounts.delete(toolName)
}

// useCanUseTool — React Hook (简化版)
export function useCanUseTool(toolCall: ToolUseBlock) {
  const [decision, setDecision] = useState<PermissionDecision | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    async function check() {
      const result = await hasPermissionsToUseTool(
        toolCall.tool, toolCall.input, getPermissionContext()
      )

      if (result.message === 'needsUserConfirmation') {
        setShowDialog(true) // 弹出确认对话框
      } else {
        setDecision(result)
      }
    }
    check()
  }, [toolCall])

  const handleUserDecision = (
    allowed: boolean,
    alwaysAllow: boolean
  ) => {
    setDecision({ allowed, reason: 'classifier' })
    if (alwaysAllow) {
      // 将规则添加到 always-allow 列表
      addAlwaysAllowRule(toolCall.tool.name, toolCall.input)
    }
    setShowDialog(false)
  }

  return { decision, showDialog, handleUserDecision }
}`
    }
  ],

  interactive: `
<h2>权限系统互动解析</h2>

<h3>第 1 步：理解 5 层决策的必要性</h3>
<p>让我们用一个具体例子走过 5 层决策：Claude 调用 <code>Bash("git push --force origin main")</code></p>
<ol>
<li><strong>第 1 层（全局拒绝）</strong>：虽然危险，但不在硬编码禁止列表中 → 通过</li>
<li><strong>第 2 层（始终允许）</strong>：用户配置了 <code>Bash(git *)</code> → 匹配！但等等...这真的安全吗？</li>
</ol>
<p>这就是 5 层设计的问题：如果用户配置了过于宽泛的 always-allow 规则，<code>git push --force</code> 会被自动允许。Claude Code 的文档强调：<strong>不要使用过于宽泛的规则</strong>。正确的做法是 <code>Bash(git status*)</code>、<code>Bash(git log*)</code> 这样的精确规则。</p>

<h3>第 2 步：Bash 分类器的深度分析</h3>
<p>Bash 分类器不是简单的黑名单匹配，而是理解命令语义：</p>
<ul>
<li><code>cat file.txt</code> → safe（只读）</li>
<li><code>cat file.txt > output.txt</code> → moderate（有重定向，可能覆盖文件）</li>
<li><code>cat file.txt | grep pattern</code> → safe（管道不产生副作用）</li>
<li><code>$(cat file.txt)</code> → moderate（命令替换，结果可能被执行）</li>
</ul>
<p>关键洞察：同一个 <code>cat</code> 命令在不同上下文中有不同的风险等级。这就是为什么需要 AST 分析而不是简单的命令名匹配。</p>

<h3>第 3 步：YOLO 模式的安全边界</h3>
<p>Auto/YOLO 模式并不是"允许一切"。它的核心原则是：</p>
<ul>
<li><strong>自动允许</strong>：与用户明确要求一致的操作（"帮我编辑 config.ts" → 允许编辑 config.ts）</li>
<li><strong>自动拒绝</strong>：明显危险的操作（rm -rf、curl | bash）</li>
<li><strong>回退确认</strong>：不确定的操作连续被拒绝 3 次后，切换到人工确认</li>
</ul>
<p>这意味着即使在 YOLO 模式下，用户仍然有安全保护。分类器的目标是"像一个有经验的开发者那样判断"。</p>

<h3>第 4 步：沙箱的隔离机制</h3>
<p>沙箱为不信任的命令提供了一个隔离的执行环境：</p>
<ul>
<li><strong>文件系统隔离</strong>：命令只能看到工作目录及其子目录，无法访问 ~/.ssh、/etc 等</li>
<li><strong>网络隔离</strong>：可选地禁止网络访问</li>
<li><strong>进程隔离</strong>：命令无法提升权限或影响其他进程</li>
<li><strong>使用场景</strong>：执行不受信任的构建脚本、运行测试等</li>
</ul>

<h3>第 5 步：用户确认对话框的设计</h3>
<p>权限确认对话框提供了三个选项：</p>
<ul>
<li><strong>"允许"</strong> — 本次允许，下次同类操作仍需确认</li>
<li><strong>"拒绝"</strong> — 本次拒绝，Claude 收到错误信息并调整策略</li>
<li><strong>"始终允许"</strong> — 将此操作模式添加到 always-allow 规则，后续自动放行</li>
</ul>
<p>这种渐进式信任模型让用户可以：</p>
<ol>
<li>初始保持谨慎（每次都确认）</li>
<li>逐渐建立信任（对常用操作设置"始终允许"）</li>
<li>最终达到高效状态（大多数操作自动放行，只有异常操作需要确认）</li>
</ol>

<h3>关键设计洞察</h3>
<ul>
<li><strong>纵深防御</strong>：5 层决策确保即使某一层被绕过，后续层仍能拦截</li>
<li><strong>可配置性</strong>：用户可以通过规则精确控制权限边界</li>
<li><strong>渐进信任</strong>：从"全部确认"到"大部分自动"的平滑过渡</li>
<li><strong>安全分类</strong>：Bash 分类器理解命令语义，而非简单的模式匹配</li>
<li><strong>回退机制</strong>：分类器不确定时回退到人工确认，避免过度阻塞</li>
</ul>
`
}
