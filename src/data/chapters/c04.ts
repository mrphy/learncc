import type { ChapterData } from '../chapters'

export const c04: ChapterData = {
  content: `
<h2>查询循环概述</h2>
<blockquote>查询循环是 Claude Code 的核心执行引擎——一个精密的 AsyncGenerator 状态机，编排着从 API 调用到工具执行的完整生命周期。每次迭代包含 10 个精心排列的步骤，处理上下文管理、错误恢复和停止条件判断。</blockquote>

<h3>AsyncGenerator 模式</h3>
<p><code>query()</code> 是查询循环的外层包装函数，它返回一个 <code>AsyncGenerator</code>，yield 出三种事件类型：</p>
<ul>
<li><strong>StreamEvent</strong> — 流式 token 事件，用于实时渲染</li>
<li><strong>RequestStartEvent</strong> — API 请求开始事件，用于 UI 加载状态</li>
<li><strong>Message</strong> — 完整的助理消息或工具结果消息</li>
</ul>
<p><code>query()</code> 内部调用 <code>queryLoop()</code>，后者是真正的状态机实现。</p>

<h3>queryLoop() 内部状态</h3>
<p><code>queryLoop()</code> 维护一个 <code>State</code> 对象，包含以下关键字段：</p>
<ul>
<li><strong>messages</strong> — 当前对话的完整消息历史</li>
<li><strong>toolUseContext</strong> — 工具执行上下文，包含当前工具调用的元数据</li>
<li><strong>autoCompactTracking</strong> — 自动压缩追踪，记录 token 增长趋势以决定何时触发压缩</li>
<li><strong>maxOutputTokensRecoveryCount</strong> — 最大输出 token 恢复计数器，<strong>上限为 3 次</strong>。当 API 返回 <code>max_output_tokens</code> 停止原因时，系统最多重试 3 次</li>
<li><strong>turnCount</strong> — 当前轮次计数，用于限制最大对话轮数</li>
<li><strong>transition</strong> — 状态转换标志，控制循环的继续/终止</li>
<li><strong>stopHookActive</strong> — 停止钩子激活标志，当 post-sampling 钩子返回停止信号时设为 true</li>
</ul>

<h3>10 步迭代管道</h3>
<p>每次循环迭代包含以下 10 个步骤，顺序经过精心设计：</p>
<ol>
<li><strong>Skill 发现预取</strong> — 异步预取可能用到的 Skill 定义，与后续步骤并行</li>
<li><strong>工具结果预算</strong> — <code>applyToolResultBudget()</code> 对过长的工具输出进行截断，防止 token 爆炸</li>
<li><strong>Snip 压缩</strong> — 对历史消息中的大文本块进行"剪切"，用摘要替换全文</li>
<li><strong>Micro-compact</strong> — 微压缩，移除消息中的冗余空白和格式</li>
<li><strong>上下文折叠</strong> — 将老旧的对话轮次折叠为摘要，减少 token 消耗</li>
<li><strong>自动压缩</strong> — 当 token 使用量接近上下文窗口限制时，触发激进的上下文压缩</li>
<li><strong>系统提示词组装</strong> — 重新组装系统提示词（可能包含新发现的 Skill 等动态内容）</li>
<li><strong>API 流式调用</strong> — 向 Claude API 发送请求并处理流式响应</li>
<li><strong>工具执行</strong> — 解析 Claude 返回的工具调用，执行工具并收集结果</li>
<li><strong>Post-sampling 钩子</strong> — 执行用户定义的后采样钩子（如代码审查、安全检查）</li>
</ol>

<h3>错误恢复机制</h3>
<p>查询循环内置了多种错误恢复策略：</p>
<ul>
<li><strong>max_output_tokens 恢复</strong>（最多 3 次）— 当 Claude 的输出被截断时，系统会自动发送"继续"消息，让 Claude 从断点继续。<code>maxOutputTokensRecoveryCount</code> 限制为 3 次，防止无限循环</li>
<li><strong>响应式压缩</strong> — 当 API 返回 <code>prompt_too_long</code> 错误时，立即触发上下文压缩并重试</li>
<li><strong>prompt_too_long 处理</strong> — 如果压缩后仍然超长，系统会尝试更激进的压缩策略（移除中间轮次，仅保留首尾）</li>
</ul>

<h3>"思考规则"（Rules of Thinking）</h3>
<p>当 Claude 返回 thinking blocks（扩展思考块）时，查询循环会应用特殊的处理规则：</p>
<ul>
<li>thinking blocks 不计入 <code>messages</code> 历史（避免 token 浪费）</li>
<li>thinking 内容会被记录到 transcript 但不会发送回 API</li>
<li>连续的 thinking blocks 会被合并以减少消息碎片</li>
</ul>

<h3>停止条件</h3>
<p>查询循环在以下条件下终止：</p>
<ul>
<li><strong>最大轮数</strong> — <code>turnCount</code> 达到配置的 <code>maxTurns</code></li>
<li><strong>Token 预算</strong> — 累计消耗超过配置的 <code>budget</code> 限制</li>
<li><strong>停止钩子</strong> — post-sampling 钩子返回 <code>{ stop: true }</code></li>
<li><strong>用户取消</strong> — AbortController 被触发</li>
<li><strong>Claude 主动结束</strong> — 返回 <code>end_turn</code> 停止原因且无工具调用</li>
</ul>
`,

  architecture: `
<h2>查询循环架构</h2>

<h3>状态机概览</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>State 字段</th><th>类型</th><th>初始值</th><th>更新时机</th></tr></thead>
<tbody>
<tr><td>messages</td><td>Message[]</td><td>传入的历史</td><td>每轮 API 响应后</td></tr>
<tr><td>toolUseContext</td><td>ToolUseContext</td><td>{}</td><td>工具执行前后</td></tr>
<tr><td>autoCompactTracking</td><td>CompactTracker</td><td>{ tokenHistory: [] }</td><td>每轮 API 调用后</td></tr>
<tr><td>maxOutputTokensRecoveryCount</td><td>number</td><td>0</td><td>max_output_tokens 恢复时 +1</td></tr>
<tr><td>turnCount</td><td>number</td><td>0</td><td>每轮 +1</td></tr>
<tr><td>transition</td><td>'continue' | 'stop'</td><td>'continue'</td><td>停止条件检查后</td></tr>
<tr><td>stopHookActive</td><td>boolean</td><td>false</td><td>post-sampling 钩子返回后</td></tr>
</tbody>
</table>
</div>

<h3>10 步管道流程图</h3>
<p>每次迭代的 10 个步骤形成一个管道：</p>
<ol>
<li><code>prefetchSkills()</code> → 异步预取（不阻塞后续步骤）</li>
<li><code>applyToolResultBudget()</code> → 截断过长的工具输出</li>
<li><code>snipCompact()</code> → 剪切大文本块</li>
<li><code>microCompact()</code> → 移除冗余空白</li>
<li><code>contextCollapse()</code> → 折叠老旧轮次</li>
<li><code>autoCompact()</code> → 基于 token 增长趋势的自动压缩</li>
<li><code>assembleSystemPrompt()</code> → 组装系统提示词</li>
<li><code>streamApiCall()</code> → API 流式调用</li>
<li><code>executeTools()</code> → 工具执行</li>
<li><code>runPostSamplingHooks()</code> → 后采样钩子</li>
</ol>

<h3>错误恢复流程</h3>
<ul>
<li><strong>max_output_tokens</strong>：API 响应 → 检查 stop_reason → recoveryCount < 3 → 发送 "continue" → 重试</li>
<li><strong>prompt_too_long</strong>：API 错误 → 触发 reactiveCompact() → 重试 → 仍然失败 → aggressiveCompact() → 重试</li>
<li><strong>网络错误</strong>：由 API 客户端层处理（见第 5 章），查询循环只处理语义级错误</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么 10 步管道的顺序如此重要？</strong></p>
<p>Skill 预取放在最前面是因为它是异步的，可以与后续步骤并行。上下文压缩步骤（2-6）必须在 API 调用（8）之前执行，否则可能因 token 超限而失败。工具执行（9）必须在 API 响应（8）之后，因为需要解析 Claude 的工具调用指令。这个顺序是经过多次迭代优化的结果。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'query() 外层包装与 queryLoop() 状态机',
      language: 'typescript',
      code: `// query.ts — 简化版
export async function* query(
  opts: QueryOptions
): AsyncGenerator<StreamEvent | RequestStartEvent | Message> {
  // 外层 query() 是一个薄包装
  yield* queryLoop({
    messages: opts.messages,
    systemPrompt: opts.systemPrompt,
    model: opts.model,
    tools: opts.tools,
    canUseTool: opts.canUseTool,
    abortSignal: opts.abortSignal,
    usage: opts.usage,
  })
}

// queryLoop 内部状态类型
interface State {
  messages: Message[]
  toolUseContext: ToolUseContext
  autoCompactTracking: {
    tokenHistory: number[]
    lastCompactAt: number
  }
  maxOutputTokensRecoveryCount: number  // 上限 3
  turnCount: number
  transition: 'continue' | 'stop'
  stopHookActive: boolean
}

async function* queryLoop(
  opts: QueryLoopOptions
): AsyncGenerator<StreamEvent | RequestStartEvent | Message> {
  // 初始化状态
  const state: State = {
    messages: opts.messages,
    toolUseContext: {},
    autoCompactTracking: { tokenHistory: [], lastCompactAt: 0 },
    maxOutputTokensRecoveryCount: 0,
    turnCount: 0,
    transition: 'continue',
    stopHookActive: false,
  }

  // 主循环
  while (state.transition === 'continue') {
    state.turnCount++

    // 检查停止条件
    if (state.turnCount > opts.maxTurns) {
      state.transition = 'stop'
      break
    }

    // 执行 10 步管道（见下一个示例）
    yield* executeIterationPipeline(state, opts)
  }
}`
    },
    {
      title: '10 步迭代管道',
      language: 'typescript',
      code: `// query/pipeline.ts — 简化版
async function* executeIterationPipeline(
  state: State,
  opts: QueryLoopOptions
): AsyncGenerator<StreamEvent | RequestStartEvent | Message> {

  // === 步骤 1: Skill 发现预取（异步，不阻塞） ===
  const skillPrefetch = prefetchSkillDiscovery(state.messages)

  // === 步骤 2: 工具结果预算 ===
  applyToolResultBudget(state.messages, {
    maxToolResultTokens: 50_000,  // 单个工具输出上限 50K tokens
  })

  // === 步骤 3: Snip 压缩 ===
  snipCompact(state.messages)  // 将大文本块替换为摘要

  // === 步骤 4: Micro-compact ===
  microCompact(state.messages)  // 移除冗余空白和格式

  // === 步骤 5: 上下文折叠 ===
  contextCollapse(state.messages, {
    preserveRecentTurns: 4,  // 保留最近 4 轮
  })

  // === 步骤 6: 自动压缩（基于 token 增长趋势） ===
  const compacted = await autoCompact(state.messages, state.autoCompactTracking)
  if (compacted) {
    state.autoCompactTracking.lastCompactAt = state.turnCount
  }

  // === 步骤 7: 系统提示词组装 ===
  await skillPrefetch  // 等待 Skill 预取完成
  const systemPrompt = assembleSystemPrompt(opts, state)

  // === 步骤 8: API 流式调用 ===
  yield { type: 'requestStart' } as RequestStartEvent
  const response = await streamApiCall({
    model: opts.model,
    system: systemPrompt,
    messages: state.messages,
    tools: opts.tools,
    abortSignal: opts.abortSignal,
  })

  // yield 流式事件
  for await (const event of response.stream) {
    yield event as StreamEvent
  }
  const assistantMessage = response.finalMessage
  yield assistantMessage

  // === 步骤 9: 工具执行 ===
  const toolCalls = extractToolCalls(assistantMessage)
  if (toolCalls.length > 0) {
    const toolResults = await executeTools(toolCalls, opts.canUseTool)
    state.messages.push(...toolResults)
    for (const result of toolResults) yield result
  } else {
    // 无工具调用 → Claude 主动结束
    state.transition = 'stop'
  }

  // === 步骤 10: Post-sampling 钩子 ===
  const hookResult = await runPostSamplingHooks(assistantMessage)
  if (hookResult?.stop) {
    state.stopHookActive = true
    state.transition = 'stop'
  }

  // 错误恢复：max_output_tokens
  if (response.stopReason === 'max_output_tokens') {
    if (state.maxOutputTokensRecoveryCount < 3) {
      state.maxOutputTokensRecoveryCount++
      state.messages.push({ role: 'user', content: 'Continue.' })
      // transition 保持 'continue'，进入下一轮
    } else {
      state.transition = 'stop'  // 超过 3 次重试上限
    }
  }

  // 更新 token 追踪
  state.autoCompactTracking.tokenHistory.push(
    response.usage.inputTokens
  )
}`
    },
    {
      title: '错误恢复策略',
      language: 'typescript',
      code: `// query/errorRecovery.ts — 简化版

// max_output_tokens 恢复
function handleMaxOutputTokens(
  state: State,
  response: ApiResponse
): void {
  if (response.stopReason !== 'max_output_tokens') return

  if (state.maxOutputTokensRecoveryCount < 3) {
    // 还有重试机会
    state.maxOutputTokensRecoveryCount++
    state.messages.push({
      role: 'user',
      content: 'Your response was cut off. Please continue from where you stopped.',
    })
    // state.transition 保持 'continue'
  } else {
    // 已重试 3 次，放弃
    state.transition = 'stop'
  }
}

// prompt_too_long 响应式压缩
async function handlePromptTooLong(
  state: State,
  error: ApiError
): Promise<boolean> {
  // 第一次尝试：温和压缩
  const gentleResult = await reactiveCompact(state.messages, {
    strategy: 'preserve-recent',
    targetReduction: 0.3,  // 减少 30% token
  })

  if (gentleResult.success) return true  // 重试

  // 第二次尝试：激进压缩
  const aggressiveResult = await aggressiveCompact(state.messages, {
    strategy: 'keep-first-last',  // 仅保留首尾消息
    targetReduction: 0.6,  // 减少 60% token
  })

  return aggressiveResult.success  // 成功则重试，否则放弃
}

// 停止条件检查
function checkStopConditions(state: State, opts: QueryLoopOptions): void {
  // 最大轮数
  if (state.turnCount >= opts.maxTurns) {
    state.transition = 'stop'
    return
  }

  // Token 预算
  if (opts.usage.totalTokens >= opts.budget) {
    state.transition = 'stop'
    return
  }

  // 停止钩子
  if (state.stopHookActive) {
    state.transition = 'stop'
    return
  }
}`
    }
  ],

  interactive: `
<h2>查询循环互动解析</h2>

<h3>第 1 步：理解 10 步管道</h3>
<p>想象你正在和 Claude 进行一个长对话（已经 50 轮），然后发送了新消息。此时 10 步管道是如何保护系统不崩溃的？</p>
<ul>
<li>步骤 2-6（压缩步骤）会逐层削减 token 消耗：先截断过长的工具输出，再压缩旧消息，最后在必要时折叠历史轮次</li>
<li>步骤 6（自动压缩）会检查 token 增长趋势——如果最近几轮 token 增长速度过快，会提前触发压缩，而不是等到 API 报错</li>
</ul>

<h3>第 2 步：max_output_tokens 的 3 次重试</h3>
<p>当 Claude 写一段很长的代码，输出被截断时：</p>
<ol>
<li>第 1 次：系统发送"继续"，Claude 从断点继续</li>
<li>第 2 次：如果又被截断，再次发送"继续"</li>
<li>第 3 次：最后一次机会</li>
<li>第 4 次截断：系统放弃，将已有内容返回给用户</li>
</ol>
<p>为什么限制 3 次？因为无限重试可能导致费用失控，而且 3 次恢复后输出已经足够长（约 16K * 4 = 64K tokens），几乎覆盖所有实际场景。</p>

<h3>第 3 步：压缩策略的层次</h3>
<p>查询循环的 5 种压缩策略形成一个渐进的"防线"：</p>
<ol>
<li><strong>工具结果预算</strong> — 最温和，只截断单个工具的过长输出</li>
<li><strong>Snip 压缩</strong> — 将大文本块替换为摘要标记</li>
<li><strong>Micro-compact</strong> — 移除冗余空白，最小化改变</li>
<li><strong>上下文折叠</strong> — 折叠旧轮次，保留最近 4 轮</li>
<li><strong>自动压缩</strong> — 最激进，可能重写整个对话历史的摘要</li>
</ol>

<h3>第 4 步：停止条件的安全网</h3>
<p>查询循环有 5 种停止条件，形成多层安全网：</p>
<ul>
<li><strong>用户取消</strong>（Ctrl+C）— 最即时的停止方式</li>
<li><strong>Claude 主动结束</strong> — 正常情况下的停止</li>
<li><strong>最大轮数</strong> — 防止无限循环</li>
<li><strong>Token 预算</strong> — 防止费用失控</li>
<li><strong>停止钩子</strong> — 外部系统的停止信号（如 CI 超时）</li>
</ul>

<h3>关键设计洞察</h3>
<ul>
<li><strong>渐进式压缩</strong>：从温和到激进的 5 层压缩策略，确保在最小改变的前提下保持 token 可控</li>
<li><strong>有限重试</strong>：max_output_tokens 的 3 次重试上限，平衡了完整性和成本</li>
<li><strong>Skill 预取并行</strong>：步骤 1 的异步预取与步骤 2-6 并行，避免阻塞管道</li>
<li><strong>状态机清晰</strong>：State 类型明确定义了所有可变状态，transition 字段统一控制流程转换</li>
</ul>
`
}
