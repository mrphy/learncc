import type { ChapterData } from '../chapters'

export const c16: ChapterData = {
  content: `
    <h2>16.1 五种任务类型</h2>
    <p>Claude Code 的 <strong>tasks/</strong> 目录定义了五种核心任务类型，覆盖从主线程到后台处理的全部场景：</p>
    <ul>
      <li><strong>LocalMainSessionTask</strong> — 主线程任务，运行在用户当前的 REPL 会话中。这是最常见的任务类型，直接响应用户输入并产生可见输出</li>
      <li><strong>LocalAgentTask</strong> — 基于代理的任务，拥有独立的上下文窗口和工具集。通常由 AgentTool 创建，用于处理需要隔离执行环境的子任务</li>
      <li><strong>LocalShellTask</strong> — 后台 Shell 任务，在独立的终端进程中执行长时间运行的命令（如构建、测试），不阻塞主会话</li>
      <li><strong>InProcessTeammateTask</strong> — 进程内队友任务，与多代理 Swarm 系统配合使用。每个队友作为独立的异步任务在同一进程中运行</li>
      <li><strong>DreamTask</strong> — 后台"梦境"任务，用于 AI 异步知识整合。当用户空闲时，系统会启动 DreamTask 对对话历史进行反思和总结</li>
    </ul>

    <h2>16.2 任务管理工具</h2>
    <p>Claude Code 提供了一套完整的任务管理工具，通过 <strong>ScheduleCronTool/</strong> 和任务 CRUD 工具实现任务的全生命周期管理：</p>
    <ul>
      <li><strong>TaskCreateTool</strong> — 创建新任务，接受 subject（简短标题）和 description（详细描述）参数。可选 activeForm 字段用于在进度条中显示</li>
      <li><strong>TaskUpdateTool</strong> — 更新任务状态和依赖关系。支持修改 status、subject、description、owner，以及通过 addBlocks/addBlockedBy 设置依赖</li>
      <li><strong>TaskGetTool</strong> — 按 ID 获取任务详情，包括完整描述、状态、依赖关系</li>
      <li><strong>TaskListTool</strong> — 列出所有任务的摘要视图，包含 id、subject、status、owner、blockedBy</li>
      <li><strong>TaskStopTool</strong> — 停止正在运行的任务，释放其占用的资源</li>
    </ul>

    <h2>16.3 任务依赖与状态工作流</h2>
    <p>任务之间可以通过 <strong>blocks</strong> 和 <strong>blockedBy</strong> 建立依赖关系。被阻塞的任务在其依赖完成之前无法开始执行。</p>
    <p>状态工作流遵循严格的转换规则：<code>pending → in_progress → completed</code>。任何阶段都可以转为 <code>deleted</code> 状态。只有当任务确实完成所有工作（测试通过、实现完整）时才应标记为 completed。</p>

    <h2>16.4 Cron 调度系统</h2>
    <p><strong>ScheduleCronTool/</strong> 提供基于 Cron 表达式的定时调度：</p>
    <ul>
      <li><strong>CronCreateTool</strong> — 创建定时任务，使用标准 5 字段 Cron 表达式（分 时 日 月 周），在用户本地时区执行</li>
      <li><strong>CronDeleteTool</strong> — 根据 Job ID 取消已创建的定时任务</li>
      <li><strong>CronListTool</strong> — 列出所有活跃的定时任务</li>
    </ul>
    <p>Cron 任务支持两种模式：<strong>recurring</strong>（循环执行，7 天后自动过期）和 <strong>one-shot</strong>（单次执行后自动删除）。持久性方面分为 <strong>durable</strong>（写入 .claude/scheduled_tasks.json，跨会话保持）和 <strong>session-only</strong>（仅在当前会话存活）。</p>

    <h2>16.5 DreamTask 与自动梦境</h2>
    <p><strong>services/autoDream/</strong> 实现了 AI "做梦"机制：</p>
    <ul>
      <li><strong>consolidationPrompt</strong> — 梦境整合提示词，指导 AI 对对话历史进行反思、提取关键知识点和决策模式</li>
      <li><strong>consolidationLock</strong> — 梦境锁，防止多个梦境任务同时执行造成资源竞争</li>
    </ul>
    <p>当用户空闲且会话达到一定长度时，系统自动启动 DreamTask。它会在后台分析对话上下文，生成知识摘要，为后续交互提供更精准的上下文支持。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>任务与调度系统架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">任务管理工具层</h4>
          <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
            <div style="background: #16213e; padding: 10px 14px; border-radius: 8px; border: 1px solid #e94560; font-size: 13px;">TaskCreateTool</div>
            <div style="background: #16213e; padding: 10px 14px; border-radius: 8px; border: 1px solid #e94560; font-size: 13px;">TaskUpdateTool</div>
            <div style="background: #16213e; padding: 10px 14px; border-radius: 8px; border: 1px solid #e94560; font-size: 13px;">TaskGetTool</div>
            <div style="background: #16213e; padding: 10px 14px; border-radius: 8px; border: 1px solid #e94560; font-size: 13px;">TaskListTool</div>
            <div style="background: #16213e; padding: 10px 14px; border-radius: 8px; border: 1px solid #e94560; font-size: 13px;">TaskStopTool</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">五种任务类型 (tasks/)</h4>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 11px;">LocalMainSession</div>
              <div style="font-size: 10px; color: #aaa;">主线程</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 11px;">LocalAgent</div>
              <div style="font-size: 10px; color: #aaa;">代理隔离</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 11px;">LocalShell</div>
              <div style="font-size: 10px; color: #aaa;">后台命令</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 11px;">InProcessTeammate</div>
              <div style="font-size: 10px; color: #aaa;">进程内队友</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 11px;">DreamTask</div>
              <div style="font-size: 10px; color: #aaa;">异步梦境</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #48c9b0;">状态与依赖</h4>
          <div style="display: flex; justify-content: center; gap: 8px; align-items: center; margin-bottom: 12px;">
            <div style="background: #2d4a3e; padding: 8px 16px; border-radius: 20px; border: 1px solid #48c9b0; font-size: 13px;">pending</div>
            <div style="color: #48c9b0; font-size: 18px;">&#x2192;</div>
            <div style="background: #2d4a3e; padding: 8px 16px; border-radius: 20px; border: 1px solid #f0c040; font-size: 13px;">in_progress</div>
            <div style="color: #f0c040; font-size: 18px;">&#x2192;</div>
            <div style="background: #2d4a3e; padding: 8px 16px; border-radius: 20px; border: 1px solid #4ade80; font-size: 13px;">completed</div>
          </div>
          <div style="text-align: center; font-size: 12px; color: #aaa;">blocks / blockedBy 依赖关系控制执行顺序</div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #533483;">Cron 调度 &amp; AutoDream</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #2d1b4e; padding: 12px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">ScheduleCronTool</div>
              <div style="font-size: 11px; color: #aaa;">Create / Delete / List</div>
              <div style="font-size: 11px; color: #aaa;">recurring | one-shot</div>
              <div style="font-size: 11px; color: #aaa;">durable | session-only</div>
            </div>
            <div style="background: #2d1b4e; padding: 12px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">services/autoDream</div>
              <div style="font-size: 11px; color: #aaa;">consolidationPrompt</div>
              <div style="font-size: 11px; color: #aaa;">consolidationLock</div>
              <div style="font-size: 11px; color: #aaa;">后台知识整合</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: '任务创建与依赖管理',
      language: 'typescript',
      code: `// TaskCreateTool: 创建任务并设置依赖
interface TaskCreateInput {
  subject: string;       // 简短标题（祈使句式）
  description: string;   // 详细描述
  activeForm?: string;   // 进行中时的显示文本
  metadata?: Record<string, unknown>;
}

interface Task {
  id: string;
  subject: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "deleted";
  owner?: string;
  blocks: string[];      // 此任务完成后才能开始的任务
  blockedBy: string[];   // 此任务依赖的前置任务
  activeForm?: string;
}

// 创建一组有依赖关系的任务
async function createTaskPipeline(
  store: TaskStore
): Promise<void> {
  // 任务 1: 基础设施
  const t1 = store.create({
    subject: "搭建数据库 Schema",
    description: "创建用户表、权限表和会话表",
    activeForm: "搭建数据库 Schema 中"
  });

  // 任务 2: 依赖任务 1
  const t2 = store.create({
    subject: "实现 API 端点",
    description: "基于 Schema 实现 CRUD API"
  });
  store.update(t2.id, {
    addBlockedBy: [t1.id]
  });

  // 任务 3: 依赖任务 2
  const t3 = store.create({
    subject: "编写集成测试",
    description: "测试所有 API 端点"
  });
  store.update(t3.id, {
    addBlockedBy: [t2.id]
  });

  // 开始执行任务 1
  store.update(t1.id, {
    status: "in_progress"
  });
}`
    },
    {
      title: 'Cron 调度系统',
      language: 'typescript',
      code: `// CronCreateTool: 标准 5 字段 Cron 调度
interface CronCreateInput {
  cron: string;          // "M H DoM Mon DoW"
  prompt: string;        // 触发时执行的提示词
  recurring?: boolean;   // 默认 true，false 为单次
  durable?: boolean;     // 默认 false，true 持久化到磁盘
}

interface CronJob {
  id: string;
  cron: string;
  prompt: string;
  recurring: boolean;
  durable: boolean;
  nextFireTime: Date;
  createdAt: Date;
  expiresAt: Date;       // 循环任务 7 天后过期
}

// 调度器核心逻辑
class CronScheduler {
  private jobs: Map<string, CronJob> = new Map();
  private readonly STORAGE_PATH =
    ".claude/scheduled_tasks.json";

  create(input: CronCreateInput): CronJob {
    const job: CronJob = {
      id: generateId(),
      cron: input.cron,
      prompt: input.prompt,
      recurring: input.recurring !== false,
      durable: input.durable || false,
      nextFireTime: computeNextFire(input.cron),
      createdAt: new Date(),
      expiresAt: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      )
    };

    this.jobs.set(job.id, job);

    // 持久化到磁盘
    if (job.durable) {
      this.persistToDisk();
    }
    return job;
  }

  // REPL 空闲时检查并触发到期任务
  async tick(): Promise<void> {
    const now = new Date();
    for (const [id, job] of this.jobs) {
      // 过期检查
      if (now > job.expiresAt) {
        this.jobs.delete(id);
        continue;
      }
      // 触发检查
      if (now >= job.nextFireTime) {
        await this.fire(job);
        if (job.recurring) {
          job.nextFireTime = computeNextFire(job.cron);
        } else {
          this.jobs.delete(id);
        }
      }
    }
  }

  private async fire(job: CronJob): Promise<void> {
    // 将 prompt 加入 REPL 消息队列
    enqueuePrompt(job.prompt);
  }

  private persistToDisk(): void {
    const durableJobs = [...this.jobs.values()]
      .filter(j => j.durable);
    writeFileSync(
      this.STORAGE_PATH,
      JSON.stringify(durableJobs, null, 2)
    );
  }
}`
    },
    {
      title: 'DreamTask 与自动梦境整合',
      language: 'typescript',
      code: `// services/autoDream: AI 梦境知识整合
const consolidationPrompt = [
  "回顾本次对话的完整历史。",
  "提取关键技术决策和发现。",
  "识别用户的编码偏好和风格。",
  "总结项目结构和架构特征。",
  "生成简洁的知识摘要用于后续参考。"
].join("\\n");

// 梦境锁：防止并发执行
class ConsolidationLock {
  private locked = false;
  private lockHolder: string | null = null;

  acquire(taskId: string): boolean {
    if (this.locked) return false;
    this.locked = true;
    this.lockHolder = taskId;
    return true;
  }

  release(taskId: string): void {
    if (this.lockHolder === taskId) {
      this.locked = false;
      this.lockHolder = null;
    }
  }
}

// DreamTask: 后台知识整合任务
class DreamTask {
  private lock = new ConsolidationLock();

  async execute(
    conversationHistory: Message[]
  ): Promise<DreamResult | null> {
    const taskId = "dream-" + Date.now();

    // 尝试获取锁
    if (!this.lock.acquire(taskId)) {
      return null; // 已有梦境任务在执行
    }

    try {
      // 构建整合上下文
      const context = conversationHistory
        .filter(m => m.role !== "system")
        .map(m => m.role + ": " + summarize(m.content))
        .join("\\n");

      // 执行 AI 反思
      const result = await callModel({
        system: consolidationPrompt,
        messages: [
          { role: "user", content: context }
        ]
      });

      // 保存知识摘要
      return {
        summary: result.content,
        timestamp: Date.now(),
        messageCount: conversationHistory.length
      };
    } finally {
      this.lock.release(taskId);
    }
  }
}

// 自动触发条件
function shouldStartDream(
  state: AppState
): boolean {
  const idleTime = Date.now() - state.lastUserInput;
  const messageCount = state.conversationLength;
  // 空闲 2 分钟且对话超过 20 条消息
  return idleTime > 120_000 && messageCount > 20;
}`
    }
  ],
  interactive: `
    <h3>任务调度交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 创建任务流水线</h4>
        <p>用户要求实现一个完整功能。Claude Code 自动创建三个有序任务：数据库 Schema → API 实现 → 集成测试。通过 blockedBy 建立依赖，确保执行顺序。</p>
        <div class="code-highlight">
          <pre>Task #1 [pending] "搭建数据库 Schema"
Task #2 [pending] "实现 API 端点" (blockedBy: #1)
Task #3 [pending] "编写集成测试" (blockedBy: #2)</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 逐步执行与状态流转</h4>
        <p>Task #1 开始执行，状态变为 in_progress。完成后标记为 completed，Task #2 自动解除阻塞变为可执行状态。</p>
        <div class="code-highlight">
          <pre>Task #1 [completed] &#x2714;
Task #2 [in_progress] &#x2192; 阻塞解除，开始执行
Task #3 [pending] (blockedBy: #2) 等待中...</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 设置 Cron 定时任务</h4>
        <p>用户请求"每天早上 9 点检查部署状态"。CronCreateTool 创建一个 durable 循环任务，写入磁盘持久化，跨会话保持运行。</p>
        <div class="code-highlight">
          <pre>CronJob {
  id: "cj_abc123",
  cron: "3 9 * * *",      // 每天 9:03（避开整点）
  prompt: "检查所有服务的部署状态并汇报",
  recurring: true,
  durable: true,           // 持久化到磁盘
  expiresAt: "7天后"       // 自动过期
}</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 后台梦境整合</h4>
        <p>用户空闲 2 分钟后，DreamTask 自动启动。在后台分析对话历史，提取知识要点，生成知识摘要。下次用户提问时，这些摘要提供更精准的上下文。</p>
        <div class="code-highlight">
          <pre>DreamTask 启动:
  - 分析 35 条对话消息
  - 提取 8 个关键技术决策
  - 识别用户偏好: TypeScript, React, 函数式风格
  - 生成知识摘要 (512 tokens)
  - 写入 CLAUDE.md 记忆文件</pre>
        </div>
      </div>
    </div>
  `
}
