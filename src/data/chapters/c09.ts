import type { ChapterData } from '../chapters'

export const c09: ChapterData = {
  content: `
<h2>计划与工作流工具概述</h2>
<blockquote>除了直接操作文件和代码的工具之外，Claude Code 还有一组"元工具"——它们不直接修改代码，而是帮助 Claude 规划工作、与用户交互、管理任务、加载技能。这些工具构成了 Claude Code 的"工作流引擎"，使其从简单的代码生成器进化为一个能自主规划和执行复杂任务的 AI 代理。</blockquote>

<h3>Plan 模式：探索与执行的分离</h3>
<p>Claude Code 支持在两种模式之间切换：</p>
<ul>
<li><strong>正常模式（Normal）</strong> — Claude 可以使用所有工具，包括写文件、执行命令等有副作用的操作</li>
<li><strong>计划模式（Plan）</strong> — Claude 只能使用只读工具（读文件、搜索、Grep），不能修改任何内容</li>
</ul>

<h4>EnterPlanModeTool</h4>
<p>当 Claude 遇到复杂任务时，它可以调用 <code>EnterPlanModeTool</code> 进入计划模式：</p>
<ul>
<li>系统自动禁用所有非只读工具</li>
<li>Claude 可以自由探索代码库，理解架构和依赖关系</li>
<li>不用担心误操作——物理上无法执行写操作</li>
</ul>

<h4>ExitPlanModeV2Tool</h4>
<p>计划完成后，Claude 调用 <code>ExitPlanModeV2Tool</code> 退出计划模式：</p>
<ul>
<li>关键特性：<code>allowedPrompts</code> 参数——Claude 可以声明"我打算执行的操作清单"</li>
<li>这个清单显示给用户，让用户在 Claude 开始执行前审查计划</li>
<li>退出后恢复所有工具的可用性</li>
</ul>

<h3>SkillTool：技能加载系统</h3>
<p>SkillTool 是 Claude Code 的"能力扩展机制"。技能（Skill）本质上是预定义的提示词模板，可以注入到对话中增强 Claude 在特定领域的表现。</p>

<h4>技能来源</h4>
<ul>
<li><strong>用户自定义技能</strong> — 存储在 <code>.claude/skills/</code> 目录中，用户或团队编写</li>
<li><strong>内置技能</strong> — 与 Claude Code 一起打包发布的 <code>bundled/</code> 技能</li>
</ul>

<h4>17 个内置技能</h4>
<p>Claude Code 自带 17 个内置技能，覆盖常见的开发工作流：</p>
<ul>
<li><strong>batch</strong> — 批量处理：对多个文件或目标执行相同操作</li>
<li><strong>claudeApi</strong> — Claude API 使用指南：帮助生成调用 Anthropic API 的代码</li>
<li><strong>claudeInChrome</strong> — Chrome 扩展开发辅助</li>
<li><strong>debug</strong> — 调试辅助：分析错误堆栈、建议调试策略</li>
<li><strong>keybindings</strong> — 快捷键配置辅助</li>
<li><strong>loop</strong> — 循环执行：定时重复执行某个操作</li>
<li><strong>remember</strong> — 记忆管理：将信息写入 CLAUDE.md 以持久化</li>
<li><strong>scheduleRemoteAgents</strong> — 远程代理调度</li>
<li><strong>simplify</strong> — 代码简化：审查并简化复杂代码</li>
<li><strong>skillify</strong> — 技能创建：帮助用户编写新技能</li>
<li><strong>stuck</strong> — 困境突破：当 Claude 陷入循环时提供新思路</li>
<li><strong>updateConfig</strong> — 配置更新辅助</li>
<li><strong>verify</strong> — 验证工具：运行测试和检查以验证变更</li>
</ul>

<h4>技能执行机制</h4>
<p>当 Claude 调用 SkillTool 时：</p>
<ol>
<li>根据技能名称查找技能定义文件</li>
<li>读取技能的提示词模板</li>
<li>将提示词注入到子对话中</li>
<li>在子对话上下文中执行技能逻辑</li>
<li>将结果返回主对话</li>
</ol>

<h3>ToolSearchTool：延迟工具发现</h3>
<p>并非所有工具都需要在每次对话开始时就发送给 Claude。一些不常用的工具被标记为 <code>shouldDefer: true</code>，表示它们可以被延迟加载：</p>
<ul>
<li>这些工具在初始的 <code>tools</code> 数组中不出现</li>
<li>当 Claude 需要时，调用 <code>ToolSearchTool</code> 搜索可用工具</li>
<li>搜索基于 <code>searchHint</code> 关键词匹配</li>
<li>找到后，工具被添加到当前会话的工具池中</li>
<li>这减少了每次 API 调用的 token 数（工具定义也消耗 input tokens）</li>
</ul>

<h3>AskUserQuestionTool：结构化用户交互</h3>
<p>当 Claude 需要用户输入时，它不是简单地在回复中提问，而是通过 <code>AskUserQuestionTool</code> 发起结构化的交互：</p>
<ul>
<li><strong>question</strong> — 向用户展示的问题文本</li>
<li><strong>options</strong> — 可选项列表（如 ["是", "否", "跳过"]），渲染为按钮</li>
<li><strong>multiSelect</strong> — 是否允许多选</li>
<li><strong>preview</strong> — 预览内容（如即将应用的 diff）</li>
</ul>
<p>这提供了比纯文本对话更丰富的交互体验。</p>

<h3>TodoWriteTool：任务跟踪</h3>
<p>对于复杂的多步骤任务，Claude 可以使用 <code>TodoWriteTool</code> 创建和管理任务列表：</p>
<ul>
<li>创建带有 subject 和 description 的任务项</li>
<li>标记任务状态：pending → in_progress → completed</li>
<li>设置任务间的依赖关系（blocks/blockedBy）</li>
<li>任务列表对用户可见，展示当前进度</li>
</ul>
<p>这使得 Claude 在处理复杂任务时更加透明和有组织。</p>

<h3>BriefTool：文件上传支持</h3>
<p><code>BriefTool</code> 支持用户通过文件上传/附件的方式向 Claude 提供信息：</p>
<ul>
<li>支持拖拽文件到终端</li>
<li>支持粘贴剪贴板内容</li>
<li>文件内容被转换为对话中的消息</li>
</ul>
`,

  architecture: `
<h2>计划与工作流工具架构</h2>

<h3>核心模块</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>工具</th><th>职责</th><th>模式影响</th></tr></thead>
<tbody>
<tr><td>EnterPlanModeTool</td><td>进入计划模式（只读探索）</td><td>禁用写操作工具</td></tr>
<tr><td>ExitPlanModeV2Tool</td><td>退出计划模式（带操作清单）</td><td>恢复所有工具</td></tr>
<tr><td>SkillTool</td><td>加载和执行技能</td><td>注入提示词到子对话</td></tr>
<tr><td>ToolSearchTool</td><td>搜索延迟加载的工具</td><td>添加工具到当前池</td></tr>
<tr><td>AskUserQuestionTool</td><td>结构化用户交互</td><td>暂停等待用户输入</td></tr>
<tr><td>TodoWriteTool</td><td>任务列表管理</td><td>展示进度给用户</td></tr>
<tr><td>BriefTool</td><td>文件附件支持</td><td>文件内容注入对话</td></tr>
</tbody>
</table>
</div>

<h3>Plan 模式状态机</h3>
<ul>
<li><strong>Normal Mode</strong>
  <ul>
  <li>所有工具可用</li>
  <li>Claude 调用 EnterPlanModeTool →</li>
  </ul>
</li>
<li><strong>Plan Mode</strong>
  <ul>
  <li>仅只读工具可用（Read, Glob, Grep, LSP...）</li>
  <li>Claude 自由探索代码库</li>
  <li>Claude 调用 ExitPlanModeV2Tool(allowedPrompts) →</li>
  </ul>
</li>
<li><strong>Back to Normal Mode</strong>
  <ul>
  <li>所有工具恢复</li>
  <li>allowedPrompts 展示给用户</li>
  <li>Claude 按计划执行</li>
  </ul>
</li>
</ul>

<h3>SkillTool 执行流程</h3>
<ol>
<li><strong>查找技能</strong> → 搜索 .claude/skills/ 和 bundled/ 目录</li>
<li><strong>读取定义</strong> → 解析技能文件中的提示词模板</li>
<li><strong>注入上下文</strong> → 将提示词注入子对话的系统提示中</li>
<li><strong>执行子对话</strong> → 延迟 require(queryLoop) 启动子 QueryLoop</li>
<li><strong>返回结果</strong> → 子对话的输出作为 ToolResult 返回主对话</li>
</ol>

<h3>工具延迟加载策略</h3>
<ul>
<li><strong>始终加载</strong>：BashTool, FileReadTool, FileEditTool, FileWriteTool, GlobTool, GrepTool（核心工具，几乎每次都用）</li>
<li><strong>延迟加载（shouldDefer=true）</strong>：NotebookEditTool, WebSearchTool, LSPTool 等（按需发现）</li>
<li><strong>触发条件</strong>：Claude 调用 ToolSearchTool，或系统检测到相关文件类型</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么 Plan 模式要在工具层面禁用而不是提示词层面？</strong></p>
<p>仅靠提示词"请不要修改文件"是不可靠的——模型可能在复杂推理中忘记这个约束。在工具层面禁用意味着即使 Claude 尝试调用 FileWriteTool，工具系统也会返回错误。这是"能力限制"而非"行为建议"，提供了硬性保证。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'Plan 模式切换实现',
      language: 'typescript',
      code: `// tools/EnterPlanModeTool.ts — 简化版
export class EnterPlanModeTool implements Tool {
  name = 'EnterPlanMode'

  inputSchema = z.object({
    reason: z.string().optional()
      .describe('进入计划模式的原因'),
  })

  description() {
    return '进入计划模式。在此模式下你只能使用只读工具来探索' +
      '代码库，不能修改任何文件。适用于需要先理解代码结构再动手的场景。'
  }

  async call(
    input: { reason?: string },
    context: ToolUseContext
  ): Promise<ToolResult> {
    // 切换全局模式为 Plan
    context.setAppState(state => ({
      ...state,
      permissionMode: 'plan' as PermissionMode,
    }))

    return {
      data: '已进入计划模式。你现在只能使用只读工具（Read, Glob, Grep, LSP 等）。' +
        '请充分探索代码库，制定完整的实施计划后再退出。',
    }
  }

  isReadOnly() { return true }
  isConcurrencySafe() { return true }
}

// tools/ExitPlanModeV2Tool.ts — 简化版
export class ExitPlanModeV2Tool implements Tool {
  name = 'ExitPlanMode'

  inputSchema = z.object({
    plan: z.string().describe('制定的实施计划'),
    allowedPrompts: z.array(z.string()).optional()
      .describe('计划执行的操作清单，展示给用户审查'),
  })

  async call(
    input: { plan: string; allowedPrompts?: string[] },
    context: ToolUseContext
  ): Promise<ToolResult> {
    // 恢复正常模式
    context.setAppState(state => ({
      ...state,
      permissionMode: 'default' as PermissionMode,
    }))

    // 构建计划摘要
    let summary = '计划已制定:\\n\\n' + input.plan
    if (input.allowedPrompts?.length) {
      summary += '\\n\\n计划执行的操作:\\n'
      summary += input.allowedPrompts
        .map((p, i) => (i + 1) + '. ' + p)
        .join('\\n')
    }

    return {
      data: summary,
      // contextModifier 可以将计划注入后续的系统提示词
      contextModifier: (ctx) => ({
        ...ctx,
        activePlan: input.plan,
      }),
    }
  }

  // 只在 Plan 模式下可用
  isEnabled() {
    return getAppState().permissionMode === 'plan'
  }
}`
    },
    {
      title: 'SkillTool 技能加载与执行',
      language: 'typescript',
      code: `// tools/SkillTool.ts — 简化版
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

interface SkillDefinition {
  name: string
  description: string
  prompt: string
  source: 'user' | 'bundled'
}

export class SkillTool implements Tool {
  name = 'Skill'

  inputSchema = z.object({
    skill: z.string().describe('要执行的技能名称'),
    args: z.string().optional().describe('传给技能的参数'),
  })

  description() {
    return '执行一个预定义的技能。技能提供特定领域的专业能力。'
  }

  async call(
    input: { skill: string; args?: string },
    context: ToolUseContext
  ): Promise<ToolResult> {
    // 1. 查找技能
    const skill = await this.findSkill(input.skill, context)
    if (!skill) {
      const available = await this.listSkills(context)
      return {
        data: '未找到技能 "' + input.skill + '"。可用技能:\\n' +
          available.map(s => '  - ' + s.name + ': ' + s.description).join('\\n'),
      }
    }

    // 2. 构建技能提示词
    const skillPrompt = this.buildPrompt(skill, input.args)

    // 3. 延迟加载 queryLoop（避免循环依赖）
    const { runSubConversation } = require('../services/queryLoop')

    // 4. 在子对话中执行技能
    const result = await runSubConversation({
      systemPromptModifier: (basePrompt: string) =>
        basePrompt + '\\n\\n' + skillPrompt,
      messages: context.messages,
      tools: context.options.tools,
      abortSignal: context.abortController.signal,
    })

    return {
      data: result.output,
      contextModifier: skill.contextModifier,
    }
  }

  private async findSkill(
    name: string,
    context: ToolUseContext
  ): Promise<SkillDefinition | null> {
    // 先搜索用户自定义技能
    const userSkillPath = join(context.options.cwd, '.claude/skills', name)
    try {
      const content = await readFile(userSkillPath + '.md', 'utf-8')
      return { name, prompt: content, description: '', source: 'user' }
    } catch {}

    // 再搜索内置技能
    const bundledSkills = await this.getBundledSkills()
    return bundledSkills.find(s =>
      s.name === name || s.name.includes(name)
    ) ?? null
  }

  private async getBundledSkills(): Promise<SkillDefinition[]> {
    // 17 个内置技能
    return [
      { name: 'batch', description: '批量处理多个文件', prompt: '...', source: 'bundled' },
      { name: 'debug', description: '调试辅助', prompt: '...', source: 'bundled' },
      { name: 'simplify', description: '代码简化', prompt: '...', source: 'bundled' },
      { name: 'verify', description: '验证变更', prompt: '...', source: 'bundled' },
      { name: 'stuck', description: '困境突破', prompt: '...', source: 'bundled' },
      // ... 共 17 个
    ]
  }
}`
    },
    {
      title: 'ToolSearchTool 延迟发现与 AskUserQuestionTool',
      language: 'typescript',
      code: `// tools/ToolSearchTool.ts — 简化版
export class ToolSearchTool implements Tool {
  name = 'ToolSearch'

  inputSchema = z.object({
    query: z.string().describe('搜索关键词'),
  })

  description() {
    return '搜索可用但未加载的工具。' +
      '某些工具（如 NotebookEdit、WebSearch）' +
      '不是默认加载的，需要通过搜索发现。'
  }

  async call(
    input: { query: string },
    context: ToolUseContext
  ): Promise<ToolResult> {
    // 获取所有延迟加载的工具
    const deferredTools = getAllBaseTools().filter(
      t => t.shouldDefer === true
    )

    // 关键词匹配
    const matches = deferredTools.filter(tool => {
      const searchText = [
        tool.name,
        tool.searchHint ?? '',
        tool.description(),
      ].join(' ').toLowerCase()

      return input.query.toLowerCase().split(/\\s+/).some(
        keyword => searchText.includes(keyword)
      )
    })

    if (matches.length === 0) {
      return { data: '未找到匹配 "' + input.query + '" 的工具。' }
    }

    // 将找到的工具添加到当前会话
    context.setAppState(state => ({
      ...state,
      additionalTools: [
        ...(state.additionalTools ?? []),
        ...matches,
      ],
    }))

    return {
      data: '找到 ' + matches.length + ' 个工具:\\n' +
        matches.map(t =>
          '  - ' + t.name + ': ' + t.description().slice(0, 100)
        ).join('\\n') +
        '\\n\\n这些工具已添加到当前会话，可以直接使用。',
    }
  }
}

// tools/AskUserQuestionTool.ts — 简化版
export class AskUserQuestionTool implements Tool {
  name = 'AskUserQuestion'

  inputSchema = z.object({
    question: z.string().describe('向用户提出的问题'),
    options: z.array(z.string()).optional()
      .describe('选项列表，渲染为按钮'),
    multiSelect: z.boolean().optional()
      .describe('是否允许多选'),
    preview: z.string().optional()
      .describe('预览内容（如 diff）'),
  })

  async call(
    input: {
      question: string
      options?: string[]
      multiSelect?: boolean
      preview?: string
    },
    context: ToolUseContext
  ): Promise<ToolResult> {
    // 等待用户通过 UI 回复
    // 这会暂停 QueryLoop 直到用户输入
    const userResponse = await waitForUserInput({
      prompt: input.question,
      options: input.options,
      multiSelect: input.multiSelect,
      preview: input.preview,
    })

    return {
      data: userResponse.text,
      newMessages: [{
        role: 'user',
        content: userResponse.text,
      }],
    }
  }

  isReadOnly() { return true }
  isConcurrencySafe() { return false }
}`
    }
  ],

  interactive: `
<h2>计划与工作流工具互动解析</h2>

<h3>第 1 步：为什么需要 Plan 模式？</h3>
<p>考虑一个复杂任务："重构这个项目的认证系统"。如果 Claude 直接开始修改代码，可能会：</p>
<ul>
<li>在不了解全貌的情况下修改了关键文件</li>
<li>遗漏了某些依赖该模块的地方</li>
<li>做出与项目惯例不一致的设计决策</li>
</ul>
<p>Plan 模式解决了这个问题：</p>
<ol>
<li>Claude 先进入 Plan 模式，只能读和搜索</li>
<li>它浏览认证相关的所有文件，理解架构</li>
<li>它搜索所有调用认证 API 的地方，了解影响范围</li>
<li>制定完整计划后退出 Plan 模式</li>
<li>按计划有序地修改代码</li>
</ol>
<p>这模拟了优秀程序员的工作方式：先理解，后动手。</p>

<h3>第 2 步：Skill 系统的设计哲学</h3>
<p>为什么用"注入提示词"而不是"编写代码"来实现技能？</p>
<ul>
<li><strong>灵活性</strong>：任何人都可以用自然语言编写技能，不需要编程知识</li>
<li><strong>组合性</strong>：技能可以使用所有已有工具，不需要重新实现功能</li>
<li><strong>可维护性</strong>：修改技能只需要编辑一个 .md 文件，不需要重新编译</li>
<li><strong>安全性</strong>：技能在同一个权限体系下运行，不会绕过安全检查</li>
</ul>

<h3>第 3 步：延迟工具加载的经济学</h3>
<p>每个工具的 JSON Schema 定义大约消耗 200-500 input tokens。42 个工具就是 8400-21000 tokens。</p>
<ul>
<li>如果用户只需要文件编辑，加载 WebSearchTool 和 NotebookEditTool 是浪费</li>
<li>延迟加载可以将初始工具数减少到 ~20 个，节省约 50% 的工具定义 tokens</li>
<li>在长对话中（每轮都发送工具定义），累积节省可达数万 tokens</li>
</ul>

<h3>第 4 步：AskUserQuestionTool vs 直接在回复中提问</h3>
<p>Claude 可以在回复中直接写"请告诉我你想要哪种方案"，但 AskUserQuestionTool 提供了更好的体验：</p>
<ul>
<li><strong>选项按钮</strong>：用户可以点击而不是打字，减少输入错误</li>
<li><strong>多选支持</strong>：用户可以同时选择多个选项</li>
<li><strong>预览</strong>：在用户做决定之前展示变更的效果</li>
<li><strong>结构化</strong>：用户的回复被结构化为 ToolResult，而不是需要 Claude 解析的自然语言</li>
</ul>

<h3>第 5 步：TodoWriteTool 的透明性价值</h3>
<p>当 Claude 处理一个"把项目从 JavaScript 迁移到 TypeScript"这样的大任务时：</p>
<ul>
<li>Claude 创建 15 个子任务（如"迁移 utils/", "迁移 components/", "更新 tsconfig"...）</li>
<li>用户可以在 UI 中看到任务列表和进度</li>
<li>Claude 标记完成的任务，用户知道还剩多少工作</li>
<li>如果会话中断，任务列表帮助 Claude 快速回忆进度</li>
</ul>
<p>这种透明性建立了用户对 AI 代理的信任——用户始终知道 Claude 在做什么、还要做什么。</p>

<h3>关键设计洞察</h3>
<ul>
<li><strong>能力控制 > 行为建议</strong>：Plan 模式在工具层面限制能力，而非依赖提示词约束</li>
<li><strong>提示词即代码</strong>：Skill 系统用自然语言模板代替代码，降低了扩展门槛</li>
<li><strong>按需加载</strong>：延迟工具发现平衡了能力完备性和 token 成本</li>
<li><strong>结构化交互</strong>：AskUserQuestionTool 将自然语言对话升级为结构化工具调用</li>
<li><strong>透明执行</strong>：TodoWriteTool 让 AI 代理的工作过程对用户可见</li>
</ul>
`
}
