import type { ChapterData } from '../chapters'

export const c05: ChapterData = {
  content: `
<h2>API 客户端概述</h2>
<blockquote>API 客户端层是 Claude Code 与 Anthropic 云端 Claude 模型之间的桥梁。它封装了流式通信、重试逻辑、Thinking 模式管理、提示缓存优化和用量追踪等复杂逻辑，向上层提供简洁的接口。</blockquote>

<h3>流式通信：@anthropic-ai/sdk 与 BetaMessageStream</h3>
<p>Claude Code 使用 Anthropic 官方 TypeScript SDK（<code>@anthropic-ai/sdk</code>）进行 API 通信。核心的流式调用使用 <code>BetaMessageStream</code>：</p>
<ul>
<li>SDK 的 <code>messages.stream()</code> 方法返回一个 <code>BetaMessageStream</code> 对象</li>
<li>该流对象实现了 <code>AsyncIterable</code> 接口，可以用 <code>for await</code> 逐个消费 token</li>
<li>流式事件包括：<code>content_block_start</code>、<code>content_block_delta</code>、<code>content_block_stop</code>、<code>message_stop</code></li>
<li>支持 <code>AbortSignal</code> 参数，允许用户在流式传输过程中取消请求</li>
</ul>

<h3>Thinking 模式</h3>
<p>Claude Code 支持三种 Thinking（扩展思考）模式，通过 <code>max_thinking_length</code> 参数控制：</p>
<ul>
<li><strong>adaptive（自适应）</strong> — 默认模式。系统根据任务复杂度自动决定是否启用 Thinking。简单任务（如文件读取）不启用，复杂任务（如代码重构）自动启用。通过设置 <code>budget_tokens</code> 让模型自行决定</li>
<li><strong>enabled（始终启用）</strong> — 强制每次请求都启用 Thinking。设置固定的 <code>max_thinking_length</code> 值，确保 Claude 总是先思考再回答</li>
<li><strong>disabled（禁用）</strong> — 完全关闭 Thinking。不发送 thinking 相关参数，适用于对延迟敏感的场景</li>
</ul>

<h3>提示缓存断点检测</h3>
<p><code>promptCacheBreakDetection.ts</code> 实现了智能的提示缓存优化。Anthropic API 支持在消息中插入 <code>cache_control</code> 断点，被缓存的前缀在后续请求中可以复用，极大降低 token 成本：</p>
<ul>
<li>系统分析消息历史，在<strong>不太可能变化的位置</strong>插入缓存断点</li>
<li>典型的缓存断点位置：系统提示词末尾、长对话中的早期消息</li>
<li>缓存命中时，input tokens 的计费可降低约 90%</li>
<li>断点检测算法会避免在频繁变化的消息附近插入断点</li>
</ul>

<h3>重试逻辑</h3>
<p>API 客户端内置了健壮的重试机制：</p>
<ul>
<li><strong>指数退避 + 抖动</strong>：基础延迟 × 2^(重试次数) + 随机抖动，避免雷群效应</li>
<li><strong>可配置的最大重试次数</strong>：默认 3 次，可通过配置调整</li>
<li><strong>可重试的错误类型</strong>：429（频率限制）、500/502/503（服务器错误）、网络超时</li>
<li><strong>不可重试的错误</strong>：400（请求格式错误）、401（认证失败）、403（权限不足）</li>
</ul>

<h3>模型回退</h3>
<p>当配置的主模型不可用时，系统支持自动回退：</p>
<ul>
<li>典型的回退链：<code>claude-sonnet-4-20250514</code> → <code>claude-opus-4-20250514</code></li>
<li>回退触发条件：模型过载（529）、模型不可用（404）</li>
<li>回退决策记录在日志中，方便排查</li>
</ul>

<h3>工具 Schema 转换</h3>
<p>Claude Code 内部使用 Zod schema 定义工具的输入参数。在发送 API 请求前，需要将 Zod schema 转换为 Anthropic API 兼容的 JSON Schema 格式：</p>
<ul>
<li>使用 <code>zodToJsonSchema()</code> 转换函数</li>
<li>处理 Zod 特有的类型（如 <code>z.enum</code>、<code>z.union</code>）到标准 JSON Schema 的映射</li>
<li>移除 Zod 元数据，只保留 API 需要的 <code>type</code>、<code>properties</code>、<code>required</code> 等字段</li>
</ul>

<h3>消息规范化</h3>
<p>在发送消息到 API 之前，系统会对消息进行规范化处理：</p>
<ul>
<li>合并相邻的同角色消息（API 要求消息交替 user/assistant）</li>
<li>移除内部元数据字段（如 UI 渲染标记）</li>
<li>转换 thinking blocks 的格式</li>
<li>处理图片和文件附件的编码</li>
</ul>

<h3>Beta 标志传播</h3>
<p>Claude Code 会向 API 请求中附加特定的 Beta 标志头，以启用实验性功能（如 extended thinking、tool use 增强等）。这些标志通过 SDK 的 <code>betas</code> 参数传播。</p>

<h3>preconnectAnthropicApi()</h3>
<p>在 <code>init()</code> 阶段，系统会提前建立到 Anthropic API 的 TCP+TLS 连接。这个预热操作可以节省首次 API 调用约 100-200ms 的连接建立延迟，因为 TLS 握手（特别是 TLS 1.3 的 0-RTT）需要多次网络往返。</p>

<h3>用量追踪</h3>
<p>API 客户端在每次请求后记录详细的 token 用量：</p>
<ul>
<li><strong>input tokens</strong> — 输入 token 数（包含系统提示词和对话历史）</li>
<li><strong>output tokens</strong> — 输出 token 数（Claude 的回复）</li>
<li><strong>cache creation tokens</strong> — 创建缓存的 token 数</li>
<li><strong>cache read tokens</strong> — 从缓存读取的 token 数</li>
<li>按模型分别统计，支持跨模型的总计计算</li>
</ul>
`,

  architecture: `
<h2>API 客户端架构</h2>

<h3>核心模块</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>模块</th><th>职责</th><th>关键函数</th></tr></thead>
<tbody>
<tr><td>services/api/claude.ts</td><td>主 API 客户端</td><td>callClaude(), streamClaude()</td></tr>
<tr><td>services/api/retry.ts</td><td>重试逻辑</td><td>withRetry(), calculateBackoff()</td></tr>
<tr><td>services/api/thinking.ts</td><td>Thinking 模式管理</td><td>getThinkingConfig()</td></tr>
<tr><td>services/api/promptCacheBreakDetection.ts</td><td>缓存断点检测</td><td>insertCacheBreakpoints()</td></tr>
<tr><td>services/api/toolSchemaConversion.ts</td><td>Zod→JSON Schema</td><td>convertToolSchemas()</td></tr>
<tr><td>services/api/messageNormalization.ts</td><td>消息格式化</td><td>normalizeMessages()</td></tr>
<tr><td>services/api/usage.ts</td><td>用量追踪</td><td>trackUsage(), getUsageSummary()</td></tr>
</tbody>
</table>
</div>

<h3>请求生命周期</h3>
<p>一次完整的 API 调用经过以下层：</p>
<ol>
<li><strong>QueryLoop</strong> → 调用 <code>streamClaude()</code></li>
<li><strong>消息规范化</strong> → <code>normalizeMessages()</code> 处理消息格式</li>
<li><strong>工具 Schema 转换</strong> → <code>convertToolSchemas()</code> Zod→JSON Schema</li>
<li><strong>缓存断点插入</strong> → <code>insertCacheBreakpoints()</code> 优化 token 费用</li>
<li><strong>Thinking 配置</strong> → <code>getThinkingConfig()</code> 决定是否启用 Thinking</li>
<li><strong>重试包装</strong> → <code>withRetry()</code> 处理瞬态故障</li>
<li><strong>SDK 调用</strong> → <code>anthropic.beta.messages.stream()</code> 实际发送请求</li>
<li><strong>流式处理</strong> → 逐 token yield 给查询循环</li>
<li><strong>用量记录</strong> → <code>trackUsage()</code> 记录 token 消耗</li>
</ol>

<h3>Thinking 模式决策树</h3>
<ul>
<li>配置 = <code>adaptive</code>
  <ul>
  <li>→ 设置 <code>thinking: { type: 'enabled', budget_tokens: N }</code></li>
  <li>→ 模型自行决定思考深度</li>
  </ul>
</li>
<li>配置 = <code>enabled</code>
  <ul>
  <li>→ 设置固定 <code>max_thinking_length</code></li>
  <li>→ 模型始终先思考</li>
  </ul>
</li>
<li>配置 = <code>disabled</code>
  <ul>
  <li>→ 不发送 thinking 参数</li>
  <li>→ 模型直接回复</li>
  </ul>
</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么要做 TCP+TLS 预连接？</strong></p>
<p>TLS 1.3 握手需要至少 1 个 RTT（往返时延），如果包含证书验证和 OCSP Stapling，可能需要 2-3 个 RTT。在 100ms 延迟的网络上，这就是 200-300ms 的固定开销。通过在 init() 阶段预连接，这个开销被完全隐藏在用户输入第一条消息之前，首次 API 调用的感知延迟大幅降低。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: '流式 API 调用与 BetaMessageStream',
      language: 'typescript',
      code: `// services/api/claude.ts — 简化版
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: getApiKey(),
  // TCP+TLS 预连接在 init() 阶段完成
})

export async function* streamClaude(opts: {
  model: string
  system: string
  messages: Message[]
  tools: ToolDefinition[]
  abortSignal?: AbortSignal
  usage: UsageTracker
}): AsyncGenerator<StreamEvent> {
  // 1. 消息规范化
  const normalizedMessages = normalizeMessages(opts.messages)

  // 2. 工具 Schema 转换（Zod → JSON Schema）
  const apiTools = convertToolSchemas(opts.tools)

  // 3. 缓存断点插入
  const messagesWithCache = insertCacheBreakpoints(normalizedMessages)

  // 4. Thinking 配置
  const thinkingConfig = getThinkingConfig(opts.model)

  // 5. 带重试的流式调用
  const stream = await withRetry(async () => {
    return anthropic.beta.messages.stream({
      model: opts.model,
      max_tokens: 16384,
      system: [{ type: 'text', text: opts.system, cache_control: { type: 'ephemeral' } }],
      messages: messagesWithCache,
      tools: apiTools,
      ...thinkingConfig,
      betas: ['prompt-caching-2024-07-31', 'extended-thinking-2025-01-24'],
    }, {
      signal: opts.abortSignal,
    })
  }, { maxRetries: 3 })

  // 6. yield 流式事件
  for await (const event of stream) {
    yield {
      type: event.type,
      data: event,
    } as StreamEvent
  }

  // 7. 获取最终消息并记录用量
  const finalMessage = await stream.finalMessage()
  opts.usage.track({
    model: opts.model,
    inputTokens: finalMessage.usage.input_tokens,
    outputTokens: finalMessage.usage.output_tokens,
    cacheCreationTokens: finalMessage.usage.cache_creation_input_tokens ?? 0,
    cacheReadTokens: finalMessage.usage.cache_read_input_tokens ?? 0,
  })

  return finalMessage
}`
    },
    {
      title: '重试逻辑与指数退避',
      language: 'typescript',
      code: `// services/api/retry.ts — 简化版
interface RetryConfig {
  maxRetries: number
  baseDelay: number      // 默认 1000ms
  maxDelay: number        // 默认 30000ms
  jitterFactor: number    // 默认 0.1
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    jitterFactor = 0.1,
  } = config

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // 不可重试的错误：立即抛出
      if (!isRetryableError(error)) {
        throw error
      }

      // 最后一次尝试失败：抛出
      if (attempt === maxRetries) break

      // 计算退避延迟
      const delay = calculateBackoff(attempt, baseDelay, maxDelay, jitterFactor)
      await sleep(delay)
    }
  }

  throw lastError
}

function calculateBackoff(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitterFactor: number
): number {
  // 指数退避：baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt)

  // 加上随机抖动，避免雷群效应
  const jitter = exponentialDelay * jitterFactor * Math.random()

  // 不超过最大延迟
  return Math.min(exponentialDelay + jitter, maxDelay)
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Anthropic.APIError) {
    // 可重试：429(频率限制)、500/502/503(服务器错误)
    return [429, 500, 502, 503].includes(error.status)
  }
  // 网络超时也可重试
  if (error instanceof Error && error.message.includes('ETIMEDOUT')) {
    return true
  }
  return false
}`
    },
    {
      title: 'Thinking 模式配置与用量追踪',
      language: 'typescript',
      code: `// services/api/thinking.ts — 简化版
type ThinkingMode = 'adaptive' | 'enabled' | 'disabled'

export function getThinkingConfig(model: string): ThinkingParams {
  const mode = getSettingValue<ThinkingMode>('thinkingMode', 'adaptive')
  const maxThinkingTokens = getSettingValue<number>(
    'maxThinkingTokens', 10000
  )

  switch (mode) {
    case 'adaptive':
      // 自适应模式：让模型自行决定思考深度
      return {
        thinking: {
          type: 'enabled',
          budget_tokens: maxThinkingTokens,
        }
      }

    case 'enabled':
      // 始终启用：设置固定的思考长度
      return {
        thinking: {
          type: 'enabled',
          budget_tokens: maxThinkingTokens,
        }
      }

    case 'disabled':
      // 完全禁用：不发送 thinking 参数
      return {}
  }
}

// services/api/usage.ts — 用量追踪
export interface UsageRecord {
  model: string
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
}

export class UsageTracker {
  private records: UsageRecord[] = []

  track(record: UsageRecord): void {
    this.records.push(record)
  }

  getSummary(): UsageSummary {
    const byModel = new Map<string, ModelUsage>()

    for (const record of this.records) {
      const existing = byModel.get(record.model) ?? {
        inputTokens: 0, outputTokens: 0,
        cacheCreationTokens: 0, cacheReadTokens: 0,
      }
      byModel.set(record.model, {
        inputTokens: existing.inputTokens + record.inputTokens,
        outputTokens: existing.outputTokens + record.outputTokens,
        cacheCreationTokens: existing.cacheCreationTokens + record.cacheCreationTokens,
        cacheReadTokens: existing.cacheReadTokens + record.cacheReadTokens,
      })
    }

    return {
      byModel: Object.fromEntries(byModel),
      totalTokens: this.records.reduce(
        (sum, r) => sum + r.inputTokens + r.outputTokens, 0
      ),
    }
  }

  get totalTokens(): number {
    return this.records.reduce(
      (sum, r) => sum + r.inputTokens + r.outputTokens, 0
    )
  }
}`
    }
  ],

  interactive: `
<h2>API 客户端互动解析</h2>

<h3>第 1 步：理解流式传输</h3>
<p>为什么 Claude Code 使用流式 API 而不是普通的请求/响应模式？</p>
<p>想象 Claude 生成一段 2000 token 的代码。非流式模式下，用户需要等待 <strong>10-20 秒</strong>才能看到任何输出。流式模式下，第一个 token 通常在 <strong>200-500ms</strong> 内到达，用户立即看到 Claude 开始"打字"。这种<strong>感知延迟</strong>的降低对用户体验至关重要。</p>

<h3>第 2 步：Thinking 模式的权衡</h3>
<p>三种 Thinking 模式各有适用场景：</p>
<ul>
<li><strong>adaptive</strong> — 最推荐。简单问题（"这个文件在哪？"）不浪费 Thinking token；复杂问题（"重构这个模块"）自动启用深度思考。token 节省可达 30-50%</li>
<li><strong>enabled</strong> — 适用于"我知道接下来的任务很复杂"的场景，确保 Claude 不会跳过思考步骤</li>
<li><strong>disabled</strong> — 适用于低延迟场景，如 Tab 补全或简单的问答</li>
</ul>

<h3>第 3 步：提示缓存的经济学</h3>
<p>假设你的系统提示词有 5000 tokens，对话已进行 20 轮（约 10000 tokens 的历史）。每次新的 API 调用都需要重新发送这 15000 tokens。</p>
<ul>
<li><strong>无缓存</strong>：每次请求计费 15000 input tokens</li>
<li><strong>有缓存</strong>：首次请求计费 15000 tokens + 缓存创建费用；后续请求中被缓存的部分（如系统提示词的 5000 tokens）计费降低约 90%</li>
<li><strong>实际效果</strong>：20 轮对话可节省约 40-60% 的 input token 费用</li>
</ul>

<h3>第 4 步：重试策略的数学</h3>
<p>指数退避 + 抖动的实际延迟序列（假设 baseDelay=1000ms）：</p>
<ol>
<li>第 1 次重试：1000ms × 2^0 + 抖动 ≈ 1.0-1.1s</li>
<li>第 2 次重试：1000ms × 2^1 + 抖动 ≈ 2.0-2.2s</li>
<li>第 3 次重试：1000ms × 2^2 + 抖动 ≈ 4.0-4.4s</li>
</ol>
<p>总等待时间约 7-8 秒。如果 3 次都失败，说明问题不是瞬态的，继续重试没有意义。</p>

<h3>第 5 步：预连接的时机</h3>
<p><code>preconnectAnthropicApi()</code> 在 <code>init()</code> 阶段调用，此时用户还没有输入第一条消息。当用户开始输入时，TCP 连接和 TLS 握手已经完成。这意味着：</p>
<ul>
<li>用户按下回车的<strong>瞬间</strong>，API 请求就可以发出</li>
<li>没有 200ms 的 TLS 握手等待</li>
<li>首次 token 到达时间（Time to First Token）大幅降低</li>
</ul>

<h3>关键设计洞察</h3>
<ul>
<li><strong>层次化抽象</strong>：消息规范化 → Schema 转换 → 缓存优化 → 重试 → SDK 调用，每层只关注自己的职责</li>
<li><strong>成本意识</strong>：提示缓存、Thinking 模式选择、token 追踪都是为了优化 API 调用成本</li>
<li><strong>延迟优化</strong>：流式传输 + TCP 预连接 + 缓存，三管齐下降低感知延迟</li>
<li><strong>健壮性</strong>：指数退避重试 + 模型回退，确保在不稳定网络下也能工作</li>
</ul>
`
}
