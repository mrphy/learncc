import type { ChapterData } from '../chapters'

export const c13: ChapterData = {
  content: `
    <h2>13.1 CLAUDE.md 多层加载</h2>
    <p>Claude Code 的内存系统从多个位置加载 <strong>CLAUDE.md</strong> 文件，形成分层的上下文配置体系：</p>
    <ul>
      <li><strong>项目级</strong> — 项目根目录的 <code>CLAUDE.md</code>，包含项目特定的指令、架构说明和编码规范</li>
      <li><strong>用户级</strong> — <code>~/.claude/CLAUDE.md</code>，包含用户个人偏好和通用指令</li>
      <li><strong>企业级</strong> — 组织管理员配置的 CLAUDE.md，强制所有成员遵循的规范</li>
    </ul>
    <p>多层 CLAUDE.md 按优先级合并，企业级覆盖用户级，项目级具有最高优先级用于项目特定配置。</p>

    <h2>13.2 MEMORY.md 系统</h2>
    <p><strong>memdir/memdir.ts</strong> 实现了 MEMORY.md 内存系统，用于持久化跨会话的关键信息：</p>
    <ul>
      <li><code>ENTRYPOINT_NAME</code> — 入口文件名标识</li>
      <li><code>MAX_ENTRYPOINT_LINES = 200</code> — 入口文件最大行数限制</li>
      <li><code>MAX_ENTRYPOINT_BYTES = 25000</code> — 入口文件最大字节数限制</li>
      <li><code>truncateEntrypointContent</code> — 当内容超出限制时的截断策略，保留最重要的信息</li>
    </ul>

    <h2>13.3 内存类型分类</h2>
    <p>系统将内存分为四种类型，每种类型有不同的生命周期和用途：</p>
    <ul>
      <li><strong>user</strong> — 用户级内存，跨项目持久化的个人偏好和习惯</li>
      <li><strong>feedback</strong> — 反馈内存，来自用户纠正和指导的学习记录</li>
      <li><strong>project</strong> — 项目内存，项目特定的上下文信息和决策记录</li>
      <li><strong>reference</strong> — 参考内存，外部文档和知识的引用</li>
    </ul>
    <p><strong>findRelevantMemories.ts</strong> 通过语义搜索在海量内存中找到与当前任务最相关的记忆片段。</p>

    <h2>13.4 四级压缩级联</h2>
    <p>Claude Code 实现了 <strong>4 级上下文压缩策略</strong>，从轻量到重量级逐步释放上下文空间：</p>
    <ol>
      <li><strong>snipCompact</strong> — 激进的旧消息移除（需启用 HISTORY_SNIP 特性标志）。直接删除最早的对话消息，释放大量空间但丢失历史上下文</li>
      <li><strong>microCompact</strong> — 轻量级工具结果裁剪（始终运行）。保留工具调用记录但截断过长的输出结果，如大文件内容、长日志输出</li>
      <li><strong>contextCollapse</strong> — 读时投影压缩（需启用 CONTEXT_COLLAPSE 特性标志）。不修改实际消息，而是在读取时动态折叠不活跃的消息段</li>
      <li><strong>autoCompact</strong> — 完整压缩，使用分叉代理生成对话摘要。这是最彻底的压缩方式，会启动一个子代理来总结当前对话的关键信息</li>
    </ol>

    <h2>13.5 压缩后恢复与内存提取</h2>
    <p><strong>compact.ts</strong> 中定义了关键常量：</p>
    <ul>
      <li><code>POST_COMPACT_MAX_FILES_TO_RESTORE = 5</code> — 压缩后最多恢复 5 个最近文件的上下文</li>
      <li><code>POST_COMPACT_TOKEN_BUDGET = 50000</code> — 压缩后文件恢复的 Token 预算上限</li>
    </ul>
    <p><strong>sessionMemoryCompact.ts</strong> 在压缩后从对话中提取关键记忆，保存到 MEMORY.md 中，确保重要信息不会因压缩而丢失。<strong>extractMemories</strong> 服务负责智能识别值得记忆的信息片段。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>内存与上下文管理架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">CLAUDE.md 多层加载</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">
              <div style="font-weight: bold;">企业级</div>
              <div style="font-size: 12px; color: #aaa;">组织强制规范</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">
              <div style="font-weight: bold;">用户级</div>
              <div style="font-size: 12px; color: #aaa;">~/.claude/CLAUDE.md</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; text-align: center; border: 1px solid #e94560;">
              <div style="font-weight: bold;">项目级</div>
              <div style="font-size: 12px; color: #aaa;">./CLAUDE.md</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">MEMORY.md + 内存类型系统</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">user</div>
            <div style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">feedback</div>
            <div style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">project</div>
            <div style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">reference</div>
          </div>
          <p style="text-align: center; color: #aaa; margin-top: 8px; font-size: 13px;">findRelevantMemories() 语义搜索</p>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">四级压缩级联</h4>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <div style="background: #2d1b4e; padding: 10px 14px; border-radius: 8px; border: 1px solid #533483; font-size: 13px;">
              <strong>L1</strong> snipCompact
            </div>
            <span style="color: #533483;">&#x2192;</span>
            <div style="background: #2d1b4e; padding: 10px 14px; border-radius: 8px; border: 1px solid #533483; font-size: 13px;">
              <strong>L2</strong> microCompact
            </div>
            <span style="color: #533483;">&#x2192;</span>
            <div style="background: #2d1b4e; padding: 10px 14px; border-radius: 8px; border: 1px solid #533483; font-size: 13px;">
              <strong>L3</strong> contextCollapse
            </div>
            <span style="color: #533483;">&#x2192;</span>
            <div style="background: #2d1b4e; padding: 10px 14px; border-radius: 8px; border: 1px solid #533483; font-size: 13px;">
              <strong>L4</strong> autoCompact
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">压缩后恢复</h4>
          <p style="color: #aaa; font-size: 14px;">sessionMemoryCompact &#x2192; extractMemories &#x2192; MEMORY.md 持久化</p>
          <p style="color: #aaa; font-size: 12px;">MAX_FILES_TO_RESTORE=5 | TOKEN_BUDGET=50000</p>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'MEMORY.md 系统与内存类型',
      language: 'typescript',
      code: `// memdir.ts 核心常量与逻辑
const ENTRYPOINT_NAME = 'MEMORY.md';
const MAX_ENTRYPOINT_LINES = 200;
const MAX_ENTRYPOINT_BYTES = 25000;

// 截断入口内容，保留最重要的信息
function truncateEntrypointContent(
  content: string
): string {
  const lines = content.split('\\n');
  if (lines.length <= MAX_ENTRYPOINT_LINES &&
      Buffer.byteLength(content) <= MAX_ENTRYPOINT_BYTES) {
    return content;
  }

  // 优先保留最近添加的内存（文件末尾）
  let truncated = lines
    .slice(-MAX_ENTRYPOINT_LINES)
    .join('\\n');

  // 字节数检查
  while (Buffer.byteLength(truncated) > MAX_ENTRYPOINT_BYTES) {
    const parts = truncated.split('\\n');
    parts.shift(); // 移除最旧的一行
    truncated = parts.join('\\n');
  }
  return truncated;
}

// 内存类型定义
type MemoryType = 'user' | 'feedback' | 'project' | 'reference';

interface MemoryEntry {
  type: MemoryType;
  content: string;
  timestamp: number;
  source: string;  // 来源标识
  relevanceScore?: number;
}

// findRelevantMemories: 语义搜索相关内存
async function findRelevantMemories(
  query: string,
  memories: MemoryEntry[],
  topK: number = 10
): Promise<MemoryEntry[]> {
  const scored = memories.map(m => ({
    ...m,
    relevanceScore: computeSimilarity(query, m.content)
  }));
  scored.sort((a, b) =>
    (b.relevanceScore || 0) - (a.relevanceScore || 0)
  );
  return scored.slice(0, topK);
}`
    },
    {
      title: '四级压缩级联实现',
      language: 'typescript',
      code: `// 压缩后恢复常量
const POST_COMPACT_MAX_FILES_TO_RESTORE = 5;
const POST_COMPACT_TOKEN_BUDGET = 50000;

// L1: snipCompact - 激进的旧消息移除
function snipCompact(
  messages: Message[],
  targetTokens: number
): Message[] {
  if (!isFeatureEnabled('HISTORY_SNIP')) {
    return messages;
  }
  // 从最旧的消息开始删除
  const result = [...messages];
  let currentTokens = countTokens(result);
  while (currentTokens > targetTokens && result.length > 2) {
    result.shift();
    currentTokens = countTokens(result);
  }
  return result;
}

// L2: microCompact - 轻量级工具结果裁剪（始终运行）
function microCompact(messages: Message[]): Message[] {
  return messages.map(msg => {
    if (msg.type !== 'tool_result') return msg;
    // 截断过长的工具输出
    if (msg.content.length > 10000) {
      return {
        ...msg,
        content: msg.content.slice(0, 5000)
          + '\\n... [已截断] ...\\n'
          + msg.content.slice(-2000)
      };
    }
    return msg;
  });
}

// L4: autoCompact - 使用分叉代理生成摘要
async function autoCompact(
  messages: Message[],
  context: CompactContext
): Promise<CompactResult> {
  // 启动子代理进行摘要
  const summary = await forkAgent({
    prompt: '请总结以下对话的关键信息...',
    messages: messages,
    maxTokens: 2000
  });

  // 压缩后恢复最近文件
  const recentFiles = getRecentlyAccessedFiles(messages)
    .slice(0, POST_COMPACT_MAX_FILES_TO_RESTORE);

  return {
    summary: summary,
    restoredFiles: recentFiles,
    tokenBudget: POST_COMPACT_TOKEN_BUDGET
  };
}`
    },
    {
      title: '会话内存提取与持久化',
      language: 'typescript',
      code: `// sessionMemoryCompact.ts: 压缩后内存提取
async function sessionMemoryCompact(
  messages: Message[],
  existingMemories: MemoryEntry[]
): Promise<MemoryEntry[]> {
  // 使用 AI 提取值得记忆的信息
  const extracted = await extractMemories(messages);

  // 过滤重复内存
  const newMemories = extracted.filter(
    mem => !existingMemories.some(
      existing => isSimilar(existing.content, mem.content)
    )
  );

  // 写入 MEMORY.md
  const memoryContent = newMemories
    .map(m => formatMemoryEntry(m))
    .join('\\n');

  await appendToMemoryFile(memoryContent);
  return [...existingMemories, ...newMemories];
}

// extractMemories: 智能记忆提取服务
async function extractMemories(
  messages: Message[]
): Promise<MemoryEntry[]> {
  const memories: MemoryEntry[] = [];

  // 提取用户纠正（feedback 类型）
  for (const msg of messages) {
    if (isUserCorrection(msg)) {
      memories.push({
        type: 'feedback',
        content: msg.content,
        timestamp: Date.now(),
        source: 'user_correction'
      });
    }
  }

  // 提取项目发现（project 类型）
  const projectInsights = await analyzeForInsights(
    messages
  );
  for (const insight of projectInsights) {
    memories.push({
      type: 'project',
      content: insight,
      timestamp: Date.now(),
      source: 'auto_extract'
    });
  }

  return memories;
}

// CLAUDE.md 多层加载
async function loadClaudeMd(): Promise<string> {
  const layers: string[] = [];

  // 企业级（最低优先级）
  const enterprise = await loadEnterpriseClaude();
  if (enterprise) layers.push(enterprise);

  // 用户级
  const user = await loadFile('~/.claude/CLAUDE.md');
  if (user) layers.push(user);

  // 项目级（最高优先级）
  const project = await loadFile('./CLAUDE.md');
  if (project) layers.push(project);

  return layers.join('\\n---\\n');
}`
    }
  ],
  interactive: `
    <h3>上下文压缩交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 上下文空间监控</h4>
        <p>系统持续监控当前上下文窗口的 Token 使用量。当使用量接近模型上下文窗口限制时（如 200K tokens 中已使用 180K），触发压缩流程。</p>
        <div class="code-highlight">
          <pre>// Token 监控
currentTokens: 182,400 / 200,000
usage: 91.2%  // 超过阈值，触发压缩</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 级联压缩执行</h4>
        <p>压缩按级联顺序执行。<strong>microCompact</strong> 始终运行，截断过长的工具输出。如果仍然空间不足，根据特性标志决定是否启用 snipCompact 和 contextCollapse。最后才使用 autoCompact 进行完整压缩。</p>
        <div class="code-highlight">
          <pre>L2 microCompact: 182K &#x2192; 165K tokens  // 截断工具输出
L3 contextCollapse: 165K &#x2192; 140K tokens  // 折叠不活跃段
L4 autoCompact: 140K &#x2192; 45K tokens  // AI 摘要压缩</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 内存提取与保存</h4>
        <p>压缩过程中，<code>sessionMemoryCompact</code> 从即将被压缩的消息中提取关键记忆。用户的纠正被标记为 feedback 类型，项目发现被标记为 project 类型，确保重要信息不丢失。</p>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 压缩后恢复</h4>
        <p>autoCompact 完成后，系统恢复最近 5 个文件的上下文（受 50000 Token 预算限制），确保代理能继续当前工作。摘要包含关键决策、文件修改记录和待完成任务。</p>
      </div>
    </div>
  `
}
