import type { ChapterData } from '../chapters'

export const c07: ChapterData = {
  content: `
<h2>工具执行引擎概述</h2>
<blockquote>工具架构定义了"工具是什么"，而工具执行引擎则决定了"工具怎么跑"。它管理并发调度、流式执行、权限校验、钩子集成、结果预算控制和错误分类。这是 Claude Code 从"收到模型输出"到"产生真实副作用"的关键路径。</blockquote>

<h3>StreamingToolExecutor：流式并发执行器</h3>
<p><code>StreamingToolExecutor</code> 是工具执行引擎的顶层管理器。当 Claude 的流式回复中包含多个 tool_use 块时，该执行器负责：</p>
<ul>
<li><strong>流式缓冲</strong> — 工具调用的 JSON 参数是流式到达的（一个 token 一个 token）。执行器将这些 delta 累积到缓冲区，直到完整的 JSON 输入到达</li>
<li><strong>即时启动</strong> — 一旦某个工具的参数完整，立即开始执行，不等待其他工具</li>
<li><strong>结果排序</strong> — 多个工具可能以不同顺序完成，但结果必须按 API 中 tool_use 块的原始顺序返回，以保证对话历史的一致性</li>
<li><strong>错误隔离</strong> — 一个工具的失败不应影响其他工具的执行（除非它们是兄弟 Bash 命令）</li>
</ul>

<h3>toolOrchestration.ts：并发编排</h3>
<p><code>partitionToolCalls()</code> 是并发编排的核心函数。它将一批工具调用分为两组：</p>
<ul>
<li><strong>并发组（parallel batch）</strong> — 所有 <code>isConcurrencySafe() === true</code> 的工具调用。这些工具不会互相干扰（如多个 GlobTool 或 GrepTool 调用），可以安全地使用 <code>Promise.all()</code> 并发执行</li>
<li><strong>串行组（serial batch）</strong> — 所有 <code>isConcurrencySafe() === false</code> 的工具调用。这些工具可能有副作用或资源竞争（如 BashTool、FileWriteTool），必须逐个执行</li>
</ul>
<p>执行顺序：先执行并发组（所有并发安全的工具同时启动），再执行串行组（逐个执行）。这最大化了吞吐量，同时保证了安全性。</p>

<h3>runToolUse() 执行管线</h3>
<p><code>toolExecution.ts</code> 中的 <code>runToolUse()</code> 是单个工具调用的完整执行管线，按以下步骤执行：</p>
<ol>
<li><strong>查找工具</strong> — 根据 tool_use 块中的 name 查找匹配的工具实例</li>
<li><strong>PreToolUse 钩子</strong> — 执行所有注册的前置钩子（可拦截、修改输入或直接提供结果）</li>
<li><strong>权限检查</strong> — 调用 <code>tool.checkPermissions()</code> 判断是否允许执行</li>
<li><strong>输入校验</strong> — 先用 Zod schema 校验，再调用 <code>tool.validateInput()</code> 做业务校验</li>
<li><strong>执行工具</strong> — 调用 <code>tool.call(input, context)</code> 执行核心逻辑</li>
<li><strong>PostToolUse 钩子</strong> — 执行所有注册的后置钩子（可修改结果、触发副作用）</li>
<li><strong>构建返回值</strong> — 将 ToolResult 转换为 API 兼容的 <code>ToolResultBlockParam</code></li>
<li><strong>文件历史追踪</strong> — 如果工具修改了文件，记录变更到文件历史中</li>
</ol>

<h3>兄弟 AbortController</h3>
<p>当 Claude 同时调用多个 BashTool 时（如一个编译命令和一个测试命令），系统为同一批次的 Bash 调用创建"兄弟" AbortController：</p>
<ul>
<li>如果其中一个 Bash 命令出错（如编译失败），其兄弟进程会被立即终止</li>
<li>这避免了无意义的等待（编译都失败了，测试没有意义）</li>
<li>兄弟关系仅限于同一个 tool_use 批次中的 Bash 调用</li>
</ul>

<h3>工具结果预算</h3>
<p><code>toolResultStorage.ts</code> 管理工具结果的大小控制：</p>
<ul>
<li>每个工具有 <code>maxResultSizeChars</code> 限制（默认 30000 字符）</li>
<li>超大结果（如 <code>cat</code> 一个巨大文件）不会全部放入对话历史</li>
<li>超大结果被持久化到磁盘的临时文件中</li>
<li>对话历史中只保留一个预览（前 N 行 + "结果已截断" 提示）</li>
<li>这防止了对话 token 数的爆炸性增长</li>
</ul>

<h3>错误分类与遥测</h3>
<p>工具执行中的错误被分类为不同类型，用于遥测和用户反馈：</p>
<ul>
<li><strong>TelemetrySafeError</strong> — 可安全发送到遥测服务的错误（不包含敏感信息）</li>
<li><strong>errno 错误</strong> — 系统错误码（如 ENOENT、EACCES），映射到用户友好的消息</li>
<li><strong>稳定名称</strong> — 每种错误有一个稳定的字符串标识符，用于错误聚合和趋势分析</li>
</ul>

<h3>toolHooks.ts：钩子集成</h3>
<p>工具钩子允许在工具执行的前后注入自定义逻辑：</p>
<ul>
<li><strong>PreToolUse 钩子</strong> — 在工具执行前调用。可以拦截调用（返回替代结果）、修改输入参数、执行额外的权限检查</li>
<li><strong>PostToolUse 钩子</strong> — 在工具执行后调用。可以修改工具结果、触发通知、记录审计日志</li>
<li>钩子通过 <code>settings.json</code> 配置，以外部命令形式运行</li>
</ul>
`,

  architecture: `
<h2>工具执行引擎架构</h2>

<h3>核心模块</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>模块</th><th>职责</th><th>关键函数/类</th></tr></thead>
<tbody>
<tr><td>StreamingToolExecutor</td><td>流式并发执行管理</td><td>execute(), bufferDelta(), flushResults()</td></tr>
<tr><td>toolOrchestration.ts</td><td>并发分组编排</td><td>partitionToolCalls()</td></tr>
<tr><td>toolExecution.ts</td><td>单工具执行管线</td><td>runToolUse()</td></tr>
<tr><td>toolResultStorage.ts</td><td>大结果持久化</td><td>persistLargeResult(), getResultPreview()</td></tr>
<tr><td>toolHooks.ts</td><td>钩子集成层</td><td>runPreToolUseHooks(), runPostToolUseHooks()</td></tr>
</tbody>
</table>
</div>

<h3>runToolUse() 完整管线</h3>
<ol>
<li><strong>Find Tool</strong> → 在工具池中查找 tool_use.name 对应的工具实例</li>
<li><strong>PreToolUse Hooks</strong> → 依次执行前置钩子（可拦截或修改）</li>
<li><strong>checkPermissions()</strong> → 调用工具的权限检查方法</li>
<li><strong>validateInput()</strong> → Zod schema + 自定义校验</li>
<li><strong>tool.call()</strong> → 执行核心逻辑，传入 ToolUseContext</li>
<li><strong>PostToolUse Hooks</strong> → 依次执行后置钩子</li>
<li><strong>Build ToolResultBlockParam</strong> → 序列化为 API 格式</li>
<li><strong>Track File History</strong> → 记录文件变更</li>
</ol>

<h3>并发编排策略</h3>
<ul>
<li><strong>阶段 1：分组</strong>
  <ul>
  <li>partitionToolCalls() 遍历所有工具调用</li>
  <li>检查每个工具的 isConcurrencySafe() 返回值</li>
  <li>分为 parallelBatch 和 serialBatch</li>
  </ul>
</li>
<li><strong>阶段 2：并发执行</strong>
  <ul>
  <li>Promise.all(parallelBatch.map(runToolUse))</li>
  <li>所有并发安全的工具同时启动</li>
  </ul>
</li>
<li><strong>阶段 3：串行执行</strong>
  <ul>
  <li>for (const call of serialBatch) await runToolUse(call)</li>
  <li>有副作用的工具逐个执行</li>
  </ul>
</li>
</ul>

<h3>兄弟 Abort 机制</h3>
<p>同一批次的 Bash 工具调用共享一个 "sibling AbortController"：</p>
<ul>
<li>创建时：为每批 Bash 调用创建一个共享的 AbortController</li>
<li>触发时：任一 Bash 命令 error → controller.abort()</li>
<li>效果：所有兄弟 Bash 进程收到 SIGTERM</li>
<li>范围：仅限同一 tool_use 批次，不同批次独立</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么结果要持久化到磁盘而不是截断？</strong></p>
<p>直接截断会丢失信息——如果 Claude 需要文件末尾的内容，截断后就无法访问了。持久化到磁盘后，后续的工具调用（如带 offset 参数的 FileReadTool）仍然可以访问完整内容。对话历史中的预览只是为了让 Claude 知道"内容很长，需要分段查看"。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'runToolUse() 完整执行管线',
      language: 'typescript',
      code: `// toolExecution.ts — 简化版
export async function runToolUse(
  toolCall: ToolUseBlock,
  tools: Tool[],
  context: ToolUseContext,
  hooks: ToolHooks
): Promise<ToolResultBlockParam> {
  // 1. 查找工具
  const tool = tools.find(t =>
    t.name === toolCall.name ||
    t.aliases?.includes(toolCall.name)
  )
  if (!tool) {
    return {
      type: 'tool_result',
      tool_use_id: toolCall.id,
      content: 'Unknown tool: ' + toolCall.name,
      is_error: true,
    }
  }

  // 2. PreToolUse 钩子
  const preHookResult = await hooks.runPreToolUseHooks({
    tool,
    input: toolCall.input,
    context,
  })
  if (preHookResult?.intercepted) {
    // 钩子提供了替代结果，跳过实际执行
    return preHookResult.result
  }
  // 钩子可能修改了输入
  const input = preHookResult?.modifiedInput ?? toolCall.input

  // 3. 权限检查
  const permResult = await tool.checkPermissions(
    input,
    context.options.permissionContext
  )
  if (permResult.denied) {
    // 需要用户确认或直接拒绝
    return await handlePermissionDenial(permResult, tool, context)
  }

  // 4. 输入校验
  const parseResult = tool.inputSchema.safeParse(input)
  if (!parseResult.success) {
    return buildErrorResult(toolCall.id, parseResult.error)
  }
  if (tool.validateInput) {
    const validationError = await tool.validateInput(parseResult.data)
    if (validationError) {
      return buildErrorResult(toolCall.id, validationError)
    }
  }

  // 5. 执行工具
  let toolResult: ToolResult
  try {
    toolResult = await tool.call(parseResult.data, context)
  } catch (error) {
    // 错误分类
    const classified = classifyError(error)
    trackTelemetry('tool_error', {
      tool: tool.name,
      errorName: classified.stableName,
    })
    return buildErrorResult(toolCall.id, classified.message)
  }

  // 6. PostToolUse 钩子
  toolResult = await hooks.runPostToolUseHooks({
    tool,
    input,
    result: toolResult,
    context,
  })

  // 7. 结果预算控制
  const resultParam = await buildToolResultParam(
    toolCall.id, tool, toolResult
  )

  // 8. 文件历史追踪
  if (!tool.isReadOnly()) {
    trackFileHistory(tool.name, input, context)
  }

  return resultParam
}`
    },
    {
      title: '并发编排与兄弟 Abort',
      language: 'typescript',
      code: `// toolOrchestration.ts — 简化版

interface PartitionedCalls {
  parallelBatch: ToolUseBlock[]
  serialBatch: ToolUseBlock[]
}

export function partitionToolCalls(
  toolCalls: ToolUseBlock[],
  tools: Tool[]
): PartitionedCalls {
  const parallelBatch: ToolUseBlock[] = []
  const serialBatch: ToolUseBlock[] = []

  for (const call of toolCalls) {
    const tool = tools.find(t => t.name === call.name)
    if (tool?.isConcurrencySafe()) {
      parallelBatch.push(call)
    } else {
      serialBatch.push(call)
    }
  }

  return { parallelBatch, serialBatch }
}

// 执行编排
export async function executeToolCalls(
  toolCalls: ToolUseBlock[],
  tools: Tool[],
  context: ToolUseContext
): Promise<ToolResultBlockParam[]> {
  const { parallelBatch, serialBatch } = partitionToolCalls(
    toolCalls, tools
  )

  // 阶段 1：并发执行（所有并发安全的工具同时启动）
  const parallelResults = await Promise.all(
    parallelBatch.map(call => runToolUse(call, tools, context))
  )

  // 阶段 2：串行执行（有副作用的工具逐个执行）
  const serialResults: ToolResultBlockParam[] = []

  // 为同批次 Bash 调用创建兄弟 AbortController
  const siblingAbort = new AbortController()
  const bashCalls = serialBatch.filter(c => c.name === 'Bash')

  for (const call of serialBatch) {
    // 如果兄弟 Bash 已失败，跳过剩余 Bash 调用
    if (call.name === 'Bash' && siblingAbort.signal.aborted) {
      serialResults.push({
        type: 'tool_result',
        tool_use_id: call.id,
        content: 'Skipped: sibling Bash command failed',
        is_error: true,
      })
      continue
    }

    try {
      const result = await runToolUse(call, tools, {
        ...context,
        abortController: call.name === 'Bash'
          ? siblingAbort
          : context.abortController,
      })
      serialResults.push(result)
    } catch (error) {
      // Bash 错误触发兄弟 abort
      if (call.name === 'Bash' && bashCalls.length > 1) {
        siblingAbort.abort()
      }
      serialResults.push(buildErrorResult(call.id, error))
    }
  }

  // 按原始顺序合并结果
  return mergeResultsInOrder(
    toolCalls, parallelResults, serialResults
  )
}`
    },
    {
      title: '结果预算控制与错误分类',
      language: 'typescript',
      code: `// toolResultStorage.ts — 大结果持久化
import { writeFile, mkdtemp } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const DEFAULT_MAX_CHARS = 30_000

export async function buildToolResultParam(
  toolUseId: string,
  tool: Tool,
  result: ToolResult
): Promise<ToolResultBlockParam> {
  const maxChars = tool.maxResultSizeChars ?? DEFAULT_MAX_CHARS
  const content = typeof result.data === 'string'
    ? result.data
    : JSON.stringify(result.data)

  // 结果在预算内：直接返回
  if (content.length <= maxChars) {
    return {
      type: 'tool_result',
      tool_use_id: toolUseId,
      content,
    }
  }

  // 结果超预算：持久化到磁盘
  const tmpDir = await mkdtemp(join(tmpdir(), 'cc-result-'))
  const filePath = join(tmpDir, 'result.txt')
  await writeFile(filePath, content, 'utf-8')

  // 生成预览（前 100 行 + 截断提示）
  const lines = content.split('\\n')
  const previewLines = lines.slice(0, 100)
  const preview = [
    ...previewLines,
    '',
    '... (结果共 ' + lines.length + ' 行，' + content.length + ' 字符)',
    '完整结果已保存到: ' + filePath,
    '使用 Read 工具配合 offset 参数查看完整内容',
  ].join('\\n')

  return {
    type: 'tool_result',
    tool_use_id: toolUseId,
    content: preview,
  }
}

// 错误分类系统
export interface ClassifiedError {
  stableName: string      // 用于遥测聚合
  message: string         // 用户友好的消息
  isTelemetrySafe: boolean // 是否可安全发送
}

export function classifyError(error: unknown): ClassifiedError {
  // TelemetrySafeError：开发者标记的安全错误
  if (error instanceof TelemetrySafeError) {
    return {
      stableName: error.name,
      message: error.message,
      isTelemetrySafe: true,
    }
  }

  // 系统 errno 错误
  if (isErrnoError(error)) {
    const mapped = ERRNO_MAP[error.code] ?? {
      name: 'unknown_system_error',
      message: '系统错误: ' + error.code,
    }
    return { ...mapped, isTelemetrySafe: true }
  }

  // 未知错误：不发送详细信息到遥测
  return {
    stableName: 'unknown_error',
    message: error instanceof Error
      ? error.message
      : 'An unknown error occurred',
    isTelemetrySafe: false,
  }
}

const ERRNO_MAP: Record<string, { name: string; message: string }> = {
  ENOENT:  { name: 'file_not_found',   message: '文件或目录不存在' },
  EACCES:  { name: 'permission_denied', message: '没有访问权限' },
  EISDIR:  { name: 'is_directory',      message: '目标是目录，不是文件' },
  ENOSPC:  { name: 'no_space',          message: '磁盘空间不足' },
  EMFILE:  { name: 'too_many_files',    message: '打开的文件数过多' },
}`
    }
  ],

  interactive: `
<h2>工具执行引擎互动解析</h2>

<h3>第 1 步：理解流式工具执行的挑战</h3>
<p>Claude 的回复是流式的。当 Claude 决定调用工具时，工具的参数也是逐 token 到达的：</p>
<pre>
token 1: {"type":"tool_use","name":"Bash","input":{
token 2: "command":"ls
token 3:  -la /
token 4: tmp"}}
</pre>
<p>StreamingToolExecutor 面临的挑战：</p>
<ul>
<li>什么时候参数"完整"了？（需要解析 JSON 嵌套层级）</li>
<li>如果同时有 3 个工具调用流入，如何管理 3 个独立的缓冲区？</li>
<li>如果工具 A 先完成但工具 B 先在流中出现，结果如何排序？</li>
</ul>

<h3>第 2 步：并发编排的智慧</h3>
<p>想象 Claude 同时调用 3 个工具：2 个 Grep + 1 个 FileWrite。partitionToolCalls 会这样处理：</p>
<ul>
<li><strong>并发组</strong>：2 个 GrepTool（只读、无副作用、可并发）</li>
<li><strong>串行组</strong>：1 个 FileWriteTool（有副作用、不可并发）</li>
<li><strong>执行顺序</strong>：先并发执行 2 个 Grep（～200ms），再执行 FileWrite（～50ms）</li>
<li><strong>如果全串行</strong>：200ms + 200ms + 50ms = 450ms</li>
<li><strong>并发+串行</strong>：200ms + 50ms = 250ms（节省 44%）</li>
</ul>

<h3>第 3 步：兄弟 Abort 的实际场景</h3>
<p>Claude 经常同时调用多个 Bash 命令，比如：</p>
<ol>
<li><code>npm run build</code>（编译项目）</li>
<li><code>npm run test</code>（运行测试）</li>
<li><code>npm run lint</code>（代码检查）</li>
</ol>
<p>如果编译在第 2 秒失败了，测试和 lint 都没有意义了。兄弟 AbortController 确保编译失败后，测试和 lint 进程立即被 SIGTERM 终止，而不是白白等待它们完成。</p>

<h3>第 4 步：结果预算的必要性</h3>
<p>考虑这个场景：Claude 执行 <code>cat large_file.log</code>，文件有 100 万行。</p>
<ul>
<li><strong>无预算控制</strong>：100 万行全部进入对话历史，下一次 API 调用的 input tokens 暴增，成本飙升，可能超过 context window</li>
<li><strong>有预算控制</strong>：前 100 行作为预览放入对话历史，完整内容存磁盘。Claude 看到预览后可以说"让我读取第 500-600 行"，使用 FileReadTool 的 offset 参数精确获取</li>
<li><strong>效果</strong>：对话 token 数保持可控，Claude 仍能访问完整信息</li>
</ul>

<h3>第 5 步：钩子系统的力量</h3>
<p>PreToolUse 和 PostToolUse 钩子赋予用户扩展工具行为的能力：</p>
<ul>
<li><strong>自动审批</strong>：PreToolUse 钩子检查工具调用是否匹配白名单，自动放行</li>
<li><strong>日志审计</strong>：PostToolUse 钩子将每次工具调用记录到审计日志</li>
<li><strong>结果改写</strong>：PostToolUse 钩子过滤敏感信息（如 API Key）后再返回</li>
<li><strong>拦截替换</strong>：PreToolUse 钩子可以完全替代工具执行（如用缓存结果代替实际 Bash 调用）</li>
</ul>

<h3>关键设计洞察</h3>
<ul>
<li><strong>流式友好</strong>：整个引擎围绕"token 逐个到达"设计，而非"一次性拿到完整输入"</li>
<li><strong>渐进式并发</strong>：不是简单地全并发或全串行，而是按工具特性智能分组</li>
<li><strong>弹性预算</strong>：大结果不会炸掉对话，但完整信息不会丢失</li>
<li><strong>可观测性</strong>：错误分类、遥测追踪、文件历史记录确保问题可排查</li>
</ul>
`
}
