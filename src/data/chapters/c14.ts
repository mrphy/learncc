import type { ChapterData } from '../chapters'

export const c14: ChapterData = {
  content: `
    <h2>14.1 AgentTool 与子代理生成</h2>
    <p>Claude Code 的子代理系统通过 <strong>AgentTool.tsx</strong> 提供统一的子代理生成入口。AgentTool 是一个特殊的工具，允许主代理在需要时创建独立的子代理来执行特定任务。每个子代理拥有独立的上下文窗口、工具集合和执行环境。</p>
    <p>子代理通过 <strong>AgentDefinition</strong> 接口定义：</p>
    <ul>
      <li><code>name</code> — 代理名称，用于识别和日志记录</li>
      <li><code>prompt</code> — 代理的系统提示词，定义其角色和行为</li>
      <li><code>tools</code> — 允许使用的工具列表（可限制以保障安全）</li>
      <li><code>maxTurns</code> — 最大交互轮次限制</li>
      <li><code>mcpServers</code> — 代理专属的 MCP 服务器配置</li>
    </ul>

    <h2>14.2 runAgent 核心执行流程</h2>
    <p><strong>runAgent.ts</strong> 是子代理执行的核心模块，实现了完整的代理运行循环：</p>
    <ol>
      <li><strong>创建子代理上下文</strong> — 初始化独立的消息历史、工具注册表和权限范围</li>
      <li><strong>构建代理提示词</strong> — 将 AgentDefinition 的 prompt 与系统指令、上下文信息合并</li>
      <li><strong>过滤工具集</strong> — 根据代理定义限制可用工具，例如探索代理只能使用只读工具</li>
      <li><strong>递归调用 query()</strong> — 进入代理主循环，与 Claude 模型交互执行任务</li>
      <li><strong>产出进度</strong> — 通过 yield 机制实时报告子代理执行进度</li>
      <li><strong>返回摘要</strong> — 任务完成后生成执行摘要返回给父代理</li>
    </ol>

    <h2>14.3 分叉代理与缓存共享</h2>
    <p><strong>forkSubagent.ts</strong> 实现了基于进程分叉的子代理生成。通过 fork 机制，子代理可以共享父进程的 KV 缓存和模型连接，大幅减少冷启动时间。这对于需要频繁创建子代理的场景（如多文件处理）尤为重要。</p>

    <h2>14.4 自定义与内置代理</h2>
    <p><strong>loadAgentsDir.ts</strong> 从 <code>.claude/agents/</code> 目录加载用户自定义代理定义。系统同时内置了多个专用代理：</p>
    <ul>
      <li><strong>exploreAgent</strong> — 快速代码库探索代理，使用只读工具集快速理解代码结构</li>
      <li><strong>planAgent</strong> — 实现规划代理，制定详细的实现方案</li>
      <li><strong>generalPurposeAgent</strong> — 通用多步骤任务代理，处理不适合其他专用代理的任务</li>
      <li><strong>claudeCodeGuideAgent</strong> — Claude Code 使用指导代理</li>
      <li><strong>statuslineSetup</strong> — 状态栏配置代理</li>
      <li><strong>verificationAgent</strong> — 验证代理，用于验证任务执行结果</li>
    </ul>

    <h2>14.5 代理 MCP 与状态管理</h2>
    <p>代理的 MCP 配置支持两种引用方式：</p>
    <ul>
      <li><strong>字符串引用</strong> — 共享父代理的 MCP 连接，多个子代理复用同一连接，减少资源消耗</li>
      <li><strong>内联定义</strong> — 代理专属的 MCP 服务器，随代理生命周期创建和销毁</li>
    </ul>
    <p><strong>resumeAgent.ts</strong> 处理代理状态恢复，当代理因错误中断时可以从检查点恢复执行。<strong>agentColorManager.ts</strong> 为每个活跃代理分配唯一的显示颜色，方便在终端中区分不同代理的输出。<strong>SendMessageTool</strong> 实现代理间消息传递，允许子代理向父代理或兄弟代理发送消息。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>子代理系统架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">主代理 (Parent Agent)</h4>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <div style="background: #16213e; padding: 12px 20px; border-radius: 8px; border: 1px solid #e94560;">AgentTool.tsx</div>
            <div style="background: #16213e; padding: 12px 20px; border-radius: 8px; border: 1px solid #e94560;">SendMessageTool</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">runAgent.ts 执行引擎</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;">
            <div style="background: #16213e; padding: 8px 12px; border-radius: 6px; border: 1px solid #0f3460; font-size: 13px;">创建上下文</div>
            <span style="color: #0f3460; line-height: 36px;">&#x2192;</span>
            <div style="background: #16213e; padding: 8px 12px; border-radius: 6px; border: 1px solid #0f3460; font-size: 13px;">构建提示词</div>
            <span style="color: #0f3460; line-height: 36px;">&#x2192;</span>
            <div style="background: #16213e; padding: 8px 12px; border-radius: 6px; border: 1px solid #0f3460; font-size: 13px;">过滤工具</div>
            <span style="color: #0f3460; line-height: 36px;">&#x2192;</span>
            <div style="background: #16213e; padding: 8px 12px; border-radius: 6px; border: 1px solid #0f3460; font-size: 13px;">query() 循环</div>
            <span style="color: #0f3460; line-height: 36px;">&#x2192;</span>
            <div style="background: #16213e; padding: 8px 12px; border-radius: 6px; border: 1px solid #0f3460; font-size: 13px;">返回摘要</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">内置代理集合</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">exploreAgent</div>
              <div style="color: #aaa;">代码库探索</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">planAgent</div>
              <div style="color: #aaa;">实现规划</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">generalPurpose</div>
              <div style="color: #aaa;">通用多步骤</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">guideAgent</div>
              <div style="color: #aaa;">使用指导</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">verificationAgent</div>
              <div style="color: #aaa;">结果验证</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">自定义代理</div>
              <div style="color: #aaa;">.claude/agents/</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">MCP 连接策略 &amp; 状态管理</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; border: 1px solid #48c9b0; font-size: 13px;">
              <strong>字符串引用:</strong> 共享父连接
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; border: 1px solid #48c9b0; font-size: 13px;">
              <strong>内联定义:</strong> 代理专属连接
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'AgentDefinition 与 AgentTool',
      language: 'typescript',
      code: `// AgentDefinition: 代理定义接口
interface AgentDefinition {
  name: string;
  prompt: string;
  tools?: string[];        // 允许的工具列表
  maxTurns?: number;       // 最大交互轮次
  mcpServers?: McpConfig;  // MCP 配置
  model?: string;          // 使用的模型
}

// 内置代理定义示例
const exploreAgent: AgentDefinition = {
  name: 'exploreAgent',
  prompt: '你是一个代码库探索专家。使用只读工具快速理解'
    + '代码结构、找到关键文件和理解架构设计。'
    + '不要修改任何文件。',
  tools: ['Read', 'Glob', 'Grep', 'LSP', 'Bash'],
  maxTurns: 15
};

const planAgent: AgentDefinition = {
  name: 'planAgent',
  prompt: '你是一个实现规划专家。分析需求后制定详细的'
    + '实现方案，包括文件修改计划、测试策略和风险评估。',
  tools: ['Read', 'Glob', 'Grep', 'LSP'],
  maxTurns: 10
};

// AgentTool: 子代理生成工具
const AgentTool = {
  name: 'Agent',
  description: '创建子代理来执行复杂的多步骤任务',
  inputSchema: {
    type: 'object',
    properties: {
      agent: { type: 'string', description: '代理名称' },
      task: { type: 'string', description: '任务描述' }
    },
    required: ['agent', 'task']
  },
  execute: async (input: AgentToolInput) => {
    const definition = resolveAgent(input.agent);
    return runAgent(definition, input.task);
  }
};`
    },
    {
      title: 'runAgent 核心执行循环',
      language: 'typescript',
      code: `// runAgent.ts: 子代理核心执行流程
async function* runAgent(
  definition: AgentDefinition,
  task: string
): AsyncGenerator<AgentProgress, AgentResult> {
  // 1. 创建子代理上下文
  const context = createSubagentContext({
    parentContext: getCurrentContext(),
    agentName: definition.name
  });

  // 2. 构建代理提示词
  const systemPrompt = buildAgentPrompt(
    definition.prompt,
    context
  );

  // 3. 过滤工具集
  const tools = filterTools(
    getAllTools(),
    definition.tools  // 只保留允许的工具
  );

  // 4. 初始化消息
  const messages: Message[] = [
    { role: 'user', content: task }
  ];

  // 5. 代理执行循环
  let turns = 0;
  while (turns < (definition.maxTurns || 20)) {
    // 递归调用 query()
    const response = await query({
      systemPrompt,
      messages,
      tools,
      model: definition.model
    });

    // 产出进度更新
    yield {
      type: 'progress',
      agent: definition.name,
      turn: turns,
      content: response.content
    };

    // 检查是否完成
    if (!response.toolCalls || response.toolCalls.length === 0) {
      break;
    }

    // 执行工具调用并追加消息
    for (const call of response.toolCalls) {
      const result = await executeTool(call, context);
      messages.push(
        { role: 'assistant', content: response.content },
        { role: 'tool', content: result }
      );
    }
    turns++;
  }

  // 6. 返回执行摘要
  return {
    agent: definition.name,
    summary: messages[messages.length - 1].content,
    turnsUsed: turns
  };
}`
    },
    {
      title: 'forkSubagent 与自定义代理加载',
      language: 'typescript',
      code: `// forkSubagent.ts: 基于进程分叉的子代理
async function forkSubagent(
  definition: AgentDefinition,
  task: string
): Promise<AgentResult> {
  // 分叉当前进程，共享 KV 缓存
  const child = fork(process.argv[1], {
    env: {
      ...process.env,
      AGENT_MODE: 'subagent',
      AGENT_NAME: definition.name,
      AGENT_TASK: task,
      // 共享父进程的缓存路径
      CACHE_DIR: getCacheDir()
    }
  });

  return new Promise((resolve, reject) => {
    child.on('message', (msg: AgentMessage) => {
      if (msg.type === 'result') {
        resolve(msg.data);
      }
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(
          'Subagent exited with code ' + code
        ));
      }
    });
  });
}

// loadAgentsDir.ts: 加载自定义代理
async function loadAgentsDir(
  dir: string
): Promise<AgentDefinition[]> {
  const agentsPath = join(dir, '.claude', 'agents');
  const files = await readdir(agentsPath).catch(() => []);
  const agents: AgentDefinition[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const content = await readFile(
      join(agentsPath, file), 'utf-8'
    );
    // 解析 frontmatter 获取代理配置
    const { frontmatter, body } = parseFrontmatter(content);
    agents.push({
      name: frontmatter.name || basename(file, '.md'),
      prompt: body,
      tools: frontmatter.tools,
      maxTurns: frontmatter.maxTurns,
      mcpServers: frontmatter.mcpServers
    });
  }
  return agents;
}

// agentColorManager.ts: 代理颜色分配
class AgentColorManager {
  private colors = [
    '#e94560', '#0f3460', '#533483',
    '#48c9b0', '#f39c12', '#3498db'
  ];
  private assignments = new Map<string, string>();

  getColor(agentName: string): string {
    if (!this.assignments.has(agentName)) {
      const idx = this.assignments.size % this.colors.length;
      this.assignments.set(agentName, this.colors[idx]);
    }
    return this.assignments.get(agentName)!;
  }
}`
    }
  ],
  interactive: `
    <h3>子代理执行交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 主代理决定委派任务</h4>
        <p>当主代理判断当前任务需要独立探索代码库时，调用 AgentTool 创建一个 exploreAgent 子代理。主代理提供明确的任务描述。</p>
        <div class="code-highlight">
          <pre>// 主代理调用 AgentTool
AgentTool.execute({
  agent: 'exploreAgent',
  task: '分析 src/services/ 目录的架构设计，找到所有服务间的依赖关系'
})</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: runAgent 初始化子代理</h4>
        <p>runAgent 创建独立的执行上下文，构建针对探索任务优化的提示词，并将工具集限制为只读工具（Read、Glob、Grep、LSP）。子代理无法修改任何文件。</p>
        <div class="code-highlight">
          <pre>// 工具过滤
允许的工具: Read, Glob, Grep, LSP, Bash
禁止的工具: Write, Edit, NotebookEdit（只读模式）</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 子代理自主执行</h4>
        <p>子代理进入独立的执行循环，自主使用工具探索代码库。每个交互轮次会通过 yield 向父代理报告进度。子代理最多执行 15 轮（exploreAgent 的 maxTurns 限制）。</p>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 结果摘要返回</h4>
        <p>子代理完成探索后，生成结构化的执行摘要返回给主代理。摘要包含发现的架构信息、关键文件列表和依赖关系图。主代理据此继续后续工作。</p>
        <div class="code-highlight">
          <pre>// 返回结果
{
  agent: 'exploreAgent',
  summary: '发现 12 个服务模块，核心依赖链...',
  turnsUsed: 8
}</pre>
        </div>
      </div>
    </div>
  `
}
