import type { ChapterData } from '../chapters'

export const c15: ChapterData = {
  content: `
    <h2>15.1 TeamCreateTool 与 TeamDeleteTool</h2>
    <p>Claude Code 的多代理协作系统通过 <strong>TeamCreateTool</strong> 和 <strong>TeamDeleteTool</strong> 提供团队管理能力：</p>
    <ul>
      <li><strong>TeamCreateTool</strong> — 创建并行工作团队。协调者代理（Coordinator）可以定义团队的组成、每个成员的任务和协作策略。团队成员以并行方式执行各自的任务，共享必要的上下文和权限</li>
      <li><strong>TeamDeleteTool</strong> — 删除团队中的工作者。当某个工作者完成任务或不再需要时，协调者可以通过此工具回收资源</li>
    </ul>
    <p>团队创建后，每个成员都是一个独立的代理实例，拥有独立的上下文窗口和工具集，但通过共享内存机制实现信息同步。</p>

    <h2>15.2 Swarm 编排架构</h2>
    <p><strong>utils/swarm/</strong> 目录包含 22+ 个文件，构成了完整的 Swarm 编排系统：</p>
    <h3>三种执行后端</h3>
    <ul>
      <li><strong>ITermBackend</strong> — iTerm2 终端后端，每个工作者在独立的 iTerm 标签页中运行，适合 macOS 开发环境下的可视化调试</li>
      <li><strong>TmuxBackend</strong> — Tmux 会话后端，每个工作者在独立的 Tmux 窗格中运行，适合远程服务器和 CI/CD 环境</li>
      <li><strong>InProcessBackend</strong> — 进程内后端，所有工作者在同一进程中运行，通过异步任务切换实现并行。资源开销最小，适合轻量级协作</li>
    </ul>

    <h2>15.3 Swarm 核心模块</h2>
    <ul>
      <li><strong>inProcessRunner.ts</strong> — 进程内队友执行器，管理工作者的生命周期、任务分配和结果收集</li>
      <li><strong>permissionSync.ts</strong> — 权限同步模块，确保所有工作者共享一致的权限状态。当一个工作者获得用户授权后，其他工作者自动继承该权限</li>
      <li><strong>teamHelpers.ts</strong> — 团队辅助函数，包括工作者状态查询、负载均衡和健康检查</li>
      <li><strong>teammateInit.ts</strong> — 队友初始化模块，处理工作者的上下文准备、工具注册和 MCP 连接</li>
      <li><strong>teammateModel.ts</strong> — 队友模型选择，根据任务类型和复杂度为每个工作者选择最合适的 AI 模型</li>
      <li><strong>teammatePromptAddendum.ts</strong> — 队友附加提示词，为工作者注入协作相关的额外指令</li>
    </ul>

    <h2>15.4 协调者模式</h2>
    <p><strong>coordinator/coordinatorMode.ts</strong> 实现了多代理编排的协调者模式。协调者负责：</p>
    <ul>
      <li>分析任务并拆解为可并行执行的子任务</li>
      <li>创建工作者团队并分配任务</li>
      <li>监控工作者进度，处理失败和重试</li>
      <li>汇总所有工作者的结果，生成最终输出</li>
    </ul>

    <h2>15.5 团队内存同步与安全</h2>
    <p><strong>services/teamMemorySync/</strong> 提供团队级别的内存同步服务：</p>
    <ul>
      <li>工作者之间共享关键发现和上下文信息</li>
      <li>防止重复工作和冲突操作</li>
      <li>内置秘密扫描（Secret Scanning），防止敏感信息在工作者之间泄露</li>
    </ul>
    <p><strong>tasks/InProcessTeammateTask/</strong> 定义了进程内队友的任务类型，管理任务的创建、执行和完成生命周期。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>Teams/Swarm 多代理协作架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">协调者层 (Coordinator)</h4>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <div style="background: #16213e; padding: 12px 16px; border-radius: 8px; border: 2px solid #e94560;">
              <div style="font-weight: bold;">coordinatorMode.ts</div>
              <div style="font-size: 12px; color: #aaa;">任务拆解 &amp; 编排</div>
            </div>
            <div style="background: #16213e; padding: 12px 16px; border-radius: 8px; border: 1px solid #e94560;">TeamCreateTool</div>
            <div style="background: #16213e; padding: 12px 16px; border-radius: 8px; border: 1px solid #e94560;">TeamDeleteTool</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">Swarm 编排层 (utils/swarm/)</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">ITermBackend</div>
              <div style="font-size: 11px; color: #aaa;">iTerm2 标签页</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">TmuxBackend</div>
              <div style="font-size: 11px; color: #aaa;">Tmux 窗格</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">InProcessBackend</div>
              <div style="font-size: 11px; color: #aaa;">进程内异步</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: #0d1b2a; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; border: 1px solid #1b4965;">teammateInit</div>
            <div style="background: #0d1b2a; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; border: 1px solid #1b4965;">teammateModel</div>
            <div style="background: #0d1b2a; padding: 8px; border-radius: 6px; text-align: center; font-size: 12px; border: 1px solid #1b4965;">teammatePrompt</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">工作者层 (Workers)</h4>
          <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <div style="background: #2d1b4e; padding: 12px 16px; border-radius: 8px; border: 1px solid #533483; min-width: 100px; text-align: center;">
              <div style="font-weight: bold;">Worker A</div>
              <div style="font-size: 11px; color: #aaa;">前端重构</div>
            </div>
            <div style="background: #2d1b4e; padding: 12px 16px; border-radius: 8px; border: 1px solid #533483; min-width: 100px; text-align: center;">
              <div style="font-weight: bold;">Worker B</div>
              <div style="font-size: 11px; color: #aaa;">后端 API</div>
            </div>
            <div style="background: #2d1b4e; padding: 12px 16px; border-radius: 8px; border: 1px solid #533483; min-width: 100px; text-align: center;">
              <div style="font-weight: bold;">Worker C</div>
              <div style="font-size: 11px; color: #aaa;">测试编写</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">共享层</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #48c9b0; font-size: 13px;">
              <div style="font-weight: bold;">permissionSync</div>
              <div style="font-size: 11px; color: #aaa;">权限同步</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #48c9b0; font-size: 13px;">
              <div style="font-weight: bold;">teamMemorySync</div>
              <div style="font-size: 11px; color: #aaa;">内存同步</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #48c9b0; font-size: 13px;">
              <div style="font-weight: bold;">secretScanning</div>
              <div style="font-size: 11px; color: #aaa;">秘密扫描</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'TeamCreateTool 与协调者模式',
      language: 'typescript',
      code: `// TeamCreateTool: 创建并行工作团队
const TeamCreateTool = {
  name: 'TeamCreate',
  description: '创建一个并行工作团队来执行多个子任务',
  inputSchema: {
    type: 'object',
    properties: {
      workers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            task: { type: 'string' },
            tools: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      },
      backend: {
        type: 'string',
        enum: ['iterm', 'tmux', 'in-process']
      }
    }
  },
  execute: async (input: TeamCreateInput) => {
    const backend = selectBackend(input.backend);
    const workers = await Promise.all(
      input.workers.map(w =>
        backend.spawnWorker({
          name: w.name,
          task: w.task,
          tools: w.tools
        })
      )
    );
    return { teamId: generateId(), workers };
  }
};

// coordinatorMode.ts: 协调者编排模式
async function coordinatorMode(
  task: string,
  context: CoordinatorContext
): Promise<CoordinatorResult> {
  // 1. 分析任务，拆解为子任务
  const subtasks = await analyzeAndDecompose(task);

  // 2. 创建工作者团队
  const team = await TeamCreateTool.execute({
    workers: subtasks.map(st => ({
      name: st.name,
      task: st.description,
      tools: st.requiredTools
    })),
    backend: context.preferredBackend || 'in-process'
  });

  // 3. 监控进度
  const results = await monitorTeam(team.teamId);

  // 4. 汇总结果
  return {
    summary: aggregateResults(results),
    teamId: team.teamId
  };
}`
    },
    {
      title: 'Swarm 执行后端与进程内运行器',
      language: 'typescript',
      code: `// 三种执行后端接口
interface SwarmBackend {
  spawnWorker(config: WorkerConfig): Promise<Worker>;
  killWorker(workerId: string): Promise<void>;
  getWorkerStatus(workerId: string): WorkerStatus;
}

// InProcessBackend: 进程内后端
class InProcessBackend implements SwarmBackend {
  private workers = new Map<string, InProcessWorker>();

  async spawnWorker(
    config: WorkerConfig
  ): Promise<Worker> {
    const worker = new InProcessWorker(config);
    this.workers.set(worker.id, worker);

    // 初始化队友
    await teammateInit(worker, {
      tools: config.tools,
      model: teammateModel.select(config.task),
      prompt: config.task
        + '\\n'
        + teammatePromptAddendum.get()
    });

    // 异步启动执行
    worker.run().catch(err => {
      worker.status = 'failed';
      worker.error = err;
    });

    return worker;
  }

  async killWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (worker) {
      await worker.abort();
      this.workers.delete(workerId);
    }
  }

  getWorkerStatus(workerId: string): WorkerStatus {
    const worker = this.workers.get(workerId);
    return worker?.status || 'unknown';
  }
}

// TmuxBackend: Tmux 会话后端
class TmuxBackend implements SwarmBackend {
  async spawnWorker(
    config: WorkerConfig
  ): Promise<Worker> {
    // 创建 Tmux 窗格
    const paneId = await execCommand(
      'tmux split-window -h -P -F "#{pane_id}"'
    );
    // 在窗格中启动 Claude Code 子进程
    await execCommand(
      'tmux send-keys -t ' + paneId
      + ' "claude --agent-mode --task '
      + escapeShell(config.task) + '" Enter'
    );
    return { id: paneId, status: 'running' };
  }

  async killWorker(workerId: string): Promise<void> {
    await execCommand('tmux kill-pane -t ' + workerId);
  }

  getWorkerStatus(workerId: string): WorkerStatus {
    // 检查 Tmux 窗格是否存在
    return 'running';
  }
}`
    },
    {
      title: '权限同步与团队内存',
      language: 'typescript',
      code: `// permissionSync.ts: 工作者间权限同步
class PermissionSync {
  private sharedPermissions = new Map<string, boolean>();
  private listeners: PermissionListener[] = [];

  // 当一个工作者获得权限时，广播给所有工作者
  grantPermission(
    workerId: string,
    permission: string
  ): void {
    this.sharedPermissions.set(permission, true);
    // 通知所有其他工作者
    for (const listener of this.listeners) {
      listener.onPermissionGranted(permission);
    }
  }

  // 检查权限是否已被任一工作者获得
  hasPermission(permission: string): boolean {
    return this.sharedPermissions.get(permission) || false;
  }

  subscribe(listener: PermissionListener): void {
    this.listeners.push(listener);
  }
}

// teamMemorySync: 团队内存同步服务
class TeamMemorySync {
  private sharedMemory: SharedMemoryEntry[] = [];

  // 工作者共享发现
  shareDiscovery(
    workerId: string,
    discovery: string
  ): void {
    // 秘密扫描：检查是否包含敏感信息
    if (containsSecrets(discovery)) {
      console.warn(
        'Secret detected in worker ' + workerId
        + ' output, redacting...'
      );
      discovery = redactSecrets(discovery);
    }

    this.sharedMemory.push({
      workerId,
      content: discovery,
      timestamp: Date.now()
    });
  }

  // 获取所有共享内存
  getSharedMemories(): SharedMemoryEntry[] {
    return [...this.sharedMemory];
  }

  // 检查是否有工作者已经处理过某个文件
  isFileBeingProcessed(filePath: string): boolean {
    return this.sharedMemory.some(
      m => m.content.includes(filePath)
        && m.content.includes('processing')
    );
  }
}

// teammatePromptAddendum.ts: 队友附加指令
const teammatePromptAddendum = {
  get(): string {
    return [
      '你是团队中的一个工作者。',
      '与其他工作者协作完成任务。',
      '通过共享内存报告重要发现。',
      '避免修改其他工作者正在处理的文件。',
      '完成任务后生成简洁的结果摘要。'
    ].join('\\n');
  }
};`
    }
  ],
  interactive: `
    <h3>多代理协作交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 协调者分析任务</h4>
        <p>用户请求："重构整个认证模块，更新 API、前端组件和测试"。协调者分析任务后，识别出三个可并行执行的子任务。</p>
        <div class="code-highlight">
          <pre>// 任务拆解结果
subtasks: [
  { name: 'api-worker', task: '重构认证 API 端点' },
  { name: 'frontend-worker', task: '更新前端认证组件' },
  { name: 'test-worker', task: '编写新的测试用例' }
]</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 创建工作者团队</h4>
        <p>TeamCreateTool 根据环境选择执行后端。本地开发使用 InProcessBackend，CI 环境使用 TmuxBackend。每个工作者被分配独立的工具集和上下文。</p>
        <div class="code-highlight">
          <pre>// InProcessBackend 模式
Worker A [api-worker]:      工具: Read, Write, Bash, Grep
Worker B [frontend-worker]: 工具: Read, Write, Glob, LSP
Worker C [test-worker]:     工具: Read, Write, Bash</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 并行执行与同步</h4>
        <p>三个工作者并行执行各自任务。permissionSync 确保权限共享——当 api-worker 获得写入 src/auth/ 的权限后，其他工作者自动继承。teamMemorySync 共享关键发现，防止冲突。</p>
        <div class="code-highlight">
          <pre>// 权限同步
api-worker 获得权限: Write src/auth/api.ts
&#x2192; frontend-worker 自动继承 Write 权限
&#x2192; test-worker 自动继承 Write 权限

// 内存同步
api-worker 共享: "API 接口签名已变更为..."
&#x2192; frontend-worker 读取并调整调用方式
&#x2192; test-worker 读取并更新测试断言</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 结果汇总</h4>
        <p>所有工作者完成后，协调者汇总结果。包括修改的文件列表、测试执行结果和潜在的冲突检测。最终生成完整的重构报告返回给用户。</p>
        <div class="code-highlight">
          <pre>// 汇总报告
{
  filesModified: 12,
  testsAdded: 8,
  testsPassed: '8/8',
  conflicts: 0,
  summary: '认证模块重构完成...'
}</pre>
        </div>
      </div>
    </div>
  `
}
