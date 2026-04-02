import type { ChapterData } from '../chapters'

export const c11: ChapterData = {
  content: `
    <h2>11.1 Hook 类型与触发时机</h2>
    <p>Claude Code 的 Hook 系统提供了 <strong>6 种生命周期钩子</strong>，允许开发者在关键节点注入自定义逻辑。这些钩子覆盖了从会话启动到工具调用、停止、上下文压缩的完整生命周期：</p>
    <ul>
      <li><strong>SessionStart</strong> — 会话初始化时触发，用于环境准备、配置加载</li>
      <li><strong>PreToolUse</strong> — 工具调用前触发，可拦截、修改或拒绝工具调用</li>
      <li><strong>PostToolUse</strong> — 工具调用后触发，可处理结果、记录日志</li>
      <li><strong>Stop</strong> — 代理停止时触发，用于清理资源、保存状态</li>
      <li><strong>PreCompact</strong> — 上下文压缩前触发，可自定义压缩策略</li>
      <li><strong>PostCompact</strong> — 上下文压缩后触发，可恢复关键信息</li>
    </ul>
    <p>每个 Hook 返回的结果遵循 <code>hookResponseSchema</code>，包含 <code>ok</code>（是否成功）和 <code>reason</code>（失败原因）两个字段，提供统一的错误处理接口。</p>

    <h2>11.2 三种执行方式</h2>
    <p>Hook 系统支持三种不同的执行方式，适用于不同的使用场景：</p>
    <ul>
      <li><strong>execAgentHook</strong> — 使用 Claude 作为子代理执行 Hook，适合需要 AI 推理的复杂逻辑。会启动一个独立的代理实例来处理 Hook 逻辑</li>
      <li><strong>execHttpHook</strong> — 通过 HTTP Webhook 调用外部服务，适合与现有基础设施集成。支持超时控制和错误重试</li>
      <li><strong>execPromptHook</strong> — 基于 Prompt 的执行方式，将 Hook 逻辑嵌入到当前对话上下文中执行</li>
    </ul>

    <h2>11.3 核心辅助模块</h2>
    <p><strong>hookHelpers.ts</strong> 提供了关键的辅助功能：</p>
    <ul>
      <li><code>addArgumentsToPrompt</code> — 支持 <code>$ARGUMENTS</code>、<code>$0</code>、<code>$1</code> 等变量替换，将运行时参数注入到 Hook Prompt 中</li>
      <li><code>registerStructuredOutputEnforcement</code> — 注册结构化输出强制机制，确保 Hook 返回符合预期的 JSON Schema</li>
    </ul>
    <p><strong>hookEvents.ts</strong> 负责 Hook 事件分发，将系统事件路由到对应的 Hook 处理器。<strong>hooksConfigManager.ts</strong> 管理 Hook 配置，支持从多个来源（项目配置、用户配置、企业配置）聚合 Hook 定义。</p>

    <h2>11.4 Skill 与异步注册</h2>
    <p><strong>registerFrontmatterHooks.ts</strong> 从 Skill 的 frontmatter 中解析并注册 Hook 定义，使得 Skill 可以声明式地定义自己的生命周期行为。<strong>registerSkillHooks.ts</strong> 处理 Skill 级别的 Hook 注册逻辑。</p>
    <p><strong>AsyncHookRegistry</strong> 提供异步 Hook 注册和执行能力，支持动态添加和移除 Hook 处理器，适合运行时需要动态调整 Hook 行为的场景。</p>
    <p><strong>sessionHooks.ts</strong> 维护会话范围的 Hook 状态，确保每个会话拥有独立的 Hook 上下文，避免跨会话干扰。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>Hook 生命周期架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">Hook 事件触发层</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">SessionStart</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">PreToolUse</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">PostToolUse</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">Stop</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">PreCompact</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">PostCompact</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">hookEvents.ts 事件分发</h4>
          <p style="color: #aaa; font-size: 14px;">解析配置 &#x2192; 匹配事件类型 &#x2192; 路由到执行器</p>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">三种执行引擎</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div class="arch-box" style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #533483;">
              <div style="font-weight: bold;">execAgentHook</div>
              <div style="font-size: 12px; color: #aaa;">Claude 子代理</div>
            </div>
            <div class="arch-box" style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #533483;">
              <div style="font-weight: bold;">execHttpHook</div>
              <div style="font-size: 12px; color: #aaa;">HTTP Webhook</div>
            </div>
            <div class="arch-box" style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #533483;">
              <div style="font-weight: bold;">execPromptHook</div>
              <div style="font-size: 12px; color: #aaa;">Prompt 注入</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">hookHelpers.ts 结果处理</h4>
          <p style="color: #aaa; font-size: 14px;">hookResponseSchema { ok, reason } &#x2192; 统一返回格式</p>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'Hook 定义与配置结构',
      language: 'typescript',
      code: `// hookResponseSchema: Hook 统一返回结构
const hookResponseSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', description: 'Hook 是否执行成功' },
    reason: { type: 'string', description: '失败原因描述' }
  },
  required: ['ok']
};

// Hook 配置定义示例 (settings.json)
const hookConfig = {
  hooks: {
    PreToolUse: [
      {
        // 匹配特定工具
        matcher: 'Bash',
        // 使用 prompt 方式执行
        type: 'prompt',
        prompt: '检查即将执行的命令是否安全: $ARGUMENTS'
      },
      {
        matcher: '*',
        type: 'http',
        url: 'https://audit.example.com/hook',
        timeout: 5000
      }
    ],
    PostToolUse: [
      {
        matcher: 'Write',
        type: 'prompt',
        prompt: '验证写入的文件内容是否符合规范'
      }
    ],
    SessionStart: [
      {
        type: 'command',
        command: 'echo "Session initialized at $(date)"'
      }
    ]
  }
};`
    },
    {
      title: 'Hook 执行流程与参数替换',
      language: 'typescript',
      code: `// addArgumentsToPrompt: 参数替换引擎
function addArgumentsToPrompt(
  prompt: string,
  args: string[]
): string {
  let result = prompt;
  // 替换 $ARGUMENTS 为完整参数字符串
  result = result.replace(
    /\\$ARGUMENTS/g,
    args.join(' ')
  );
  // 替换 $0, $1, $2... 为对应位置参数
  for (let i = 0; i < args.length; i++) {
    result = result.replace(
      new RegExp('\\\\$' + i, 'g'),
      args[i]
    );
  }
  return result;
}

// Hook 事件分发核心逻辑
async function dispatchHookEvent(
  event: HookEvent,
  context: HookContext
): Promise<HookResponse[]> {
  const configs = hooksConfigManager
    .getHooksForEvent(event.type);
  const results: HookResponse[] = [];

  for (const config of configs) {
    // 检查 matcher 是否匹配当前工具
    if (config.matcher && !matchTool(
      config.matcher, event.toolName
    )) continue;

    let result: HookResponse;
    switch (config.type) {
      case 'agent':
        result = await execAgentHook(config, context);
        break;
      case 'http':
        result = await execHttpHook(config, context);
        break;
      case 'prompt':
        result = await execPromptHook(config, context);
        break;
    }
    results.push(result);
    // 如果任何 Hook 返回不通过则中断
    if (!result.ok) break;
  }
  return results;
}`
    },
    {
      title: 'AsyncHookRegistry 与 Skill 注册',
      language: 'typescript',
      code: `// AsyncHookRegistry: 异步 Hook 注册表
class AsyncHookRegistry {
  private hooks: Map<string, HookHandler[]> = new Map();

  register(event: string, handler: HookHandler): void {
    const handlers = this.hooks.get(event) || [];
    handlers.push(handler);
    this.hooks.set(event, handlers);
  }

  unregister(event: string, handler: HookHandler): void {
    const handlers = this.hooks.get(event) || [];
    this.hooks.set(
      event,
      handlers.filter(h => h !== handler)
    );
  }

  async execute(
    event: string,
    context: HookContext
  ): Promise<HookResponse[]> {
    const handlers = this.hooks.get(event) || [];
    return Promise.all(
      handlers.map(h => h(context))
    );
  }
}

// registerFrontmatterHooks: 从 Skill frontmatter 注册
function registerFrontmatterHooks(
  skill: SkillDefinition,
  registry: AsyncHookRegistry
): void {
  const frontmatter = skill.frontmatter;
  if (!frontmatter?.hooks) return;

  for (const [event, hookDefs] of
    Object.entries(frontmatter.hooks)
  ) {
    for (const def of hookDefs) {
      registry.register(event, async (ctx) => {
        // 使用 skill 上下文执行 hook
        return execPromptHook({
          prompt: addArgumentsToPrompt(
            def.prompt, ctx.args || []
          ),
          skillContext: skill.name
        }, ctx);
      });
    }
  }
}

// registerStructuredOutputEnforcement
function registerStructuredOutputEnforcement(
  registry: AsyncHookRegistry
): void {
  registry.register('PostToolUse', async (ctx) => {
    if (!ctx.expectedSchema) return { ok: true };
    const valid = validateSchema(
      ctx.result, ctx.expectedSchema
    );
    return {
      ok: valid,
      reason: valid ? undefined
        : 'Output does not match expected schema'
    };
  });
}`
    }
  ],
  interactive: `
    <h3>Hook 生命周期交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: Hook 事件触发</h4>
        <p>当用户请求执行 Bash 命令时，系统首先触发 <code>PreToolUse</code> 事件。事件包含工具名称（Bash）、参数（命令内容）和当前上下文。</p>
        <div class="code-highlight">
          <pre>// 系统内部触发流程
hookEvents.dispatch({
  type: 'PreToolUse',
  toolName: 'Bash',
  args: ['rm -rf /tmp/cache'],
  context: currentSession
});</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 配置匹配与路由</h4>
        <p>hooksConfigManager 查找所有匹配 PreToolUse + Bash 的 Hook 配置。支持通配符 <code>*</code> 匹配所有工具，也支持精确匹配特定工具名。</p>
        <div class="code-highlight">
          <pre>// 匹配逻辑
matcher: 'Bash'  // 精确匹配 Bash 工具
matcher: '*'     // 匹配所有工具
matcher: 'Write|Edit'  // 匹配多个工具</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 执行引擎选择</h4>
        <p>根据配置的 type 字段选择执行引擎。execPromptHook 适合简单检查，execAgentHook 适合复杂推理，execHttpHook 适合外部集成。</p>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 结果处理</h4>
        <p>所有 Hook 返回统一的 <code>{ ok, reason }</code> 结构。如果任一 Hook 返回 <code>ok: false</code>，则工具调用被拦截，reason 会展示给用户解释拦截原因。</p>
        <div class="code-highlight">
          <pre>// 拦截示例
{ ok: false, reason: '检测到危险命令: rm -rf，已拦截执行' }
// 通过示例
{ ok: true }</pre>
        </div>
      </div>
    </div>
  `
}
