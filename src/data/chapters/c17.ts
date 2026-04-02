import type { ChapterData } from '../chapters'

export const c17: ChapterData = {
  content: `
    <h2>17.1 Skills 系统概览</h2>
    <p>Claude Code 的 <strong>skills/</strong> 系统是一种可扩展的能力注入机制。Skills 本质上是结构化的 Markdown 文件，通过 Frontmatter 声明元数据和钩子，正文部分作为提示词注入到子对话中。</p>
    <ul>
      <li><strong>loadSkillsDir.ts</strong> — 从 <code>.claude/skills/</code> 目录加载用户自定义 Skills，支持嵌套目录和热更新</li>
      <li><strong>bundledSkills.ts</strong> — 内置 Skills 注册表，包含 17+ 个预打包的 Skills</li>
      <li><strong>SkillTool</strong> — Skills 执行工具，将 Skill 的提示词内容注入到子对话中执行，通过 skill 名称或完全限定名称（如 "plugin:skill-name"）调用</li>
      <li><strong>mcpSkillBuilders.ts</strong> — 将 MCP 服务器提供的 Prompts 转换为可调用的 Skills</li>
    </ul>

    <h2>17.2 内置 Skills 清单</h2>
    <p>Claude Code 预置了 <strong>17+ 个内置 Skills</strong>，涵盖开发工作流的各个方面：</p>
    <ul>
      <li><strong>batch</strong> — 批量处理多个文件或任务</li>
      <li><strong>claudeApi</strong> — Claude API 和 Anthropic SDK 集成指导</li>
      <li><strong>claudeInChrome</strong> — Chrome 浏览器中使用 Claude 的专用模式</li>
      <li><strong>debug</strong> — 调试辅助，提供系统状态诊断和日志分析</li>
      <li><strong>keybindings</strong> — 快捷键配置和自定义</li>
      <li><strong>loop</strong> — 循环执行：以固定间隔重复运行提示词或命令</li>
      <li><strong>remember</strong> — 记忆管理：读写 CLAUDE.md 记忆文件</li>
      <li><strong>scheduleRemoteAgents</strong> — 远程代理调度和管理</li>
      <li><strong>simplify</strong> — 代码简化：检查变更代码的复用性、质量和效率</li>
      <li><strong>skillify / skill-creator</strong> — Skill 创建工具：从模板创建新的自定义 Skill</li>
      <li><strong>stuck</strong> — 卡住检测：当 AI 陷入循环时自动介入</li>
      <li><strong>updateConfig</strong> — 通过 settings.json 配置 Claude Code 行为</li>
      <li><strong>verify / verifyContent</strong> — 验证工具：确认代码变更的正确性和完整性</li>
    </ul>

    <h2>17.3 Frontmatter 钩子注册</h2>
    <p>Skills 可以在 Markdown Frontmatter 中声明 <strong>PreToolUse</strong> 和 <strong>PostToolUse</strong> 钩子，在工具调用前后自动触发：</p>
    <ul>
      <li>Frontmatter 使用 YAML 格式声明钩子匹配规则</li>
      <li>支持按工具名称、文件模式等条件过滤</li>
      <li>钩子可以修改工具参数、拦截执行或追加后处理逻辑</li>
    </ul>

    <h2>17.4 Plugin 系统</h2>
    <p><strong>utils/plugins/</strong> 目录包含 <strong>43+ 个文件</strong>，构成了完整的插件管理系统：</p>
    <ul>
      <li><strong>pluginLoader.ts</strong> — 插件加载器，负责发现、加载和缓存插件</li>
      <li><strong>installedPluginsManager.ts</strong> — 已安装插件管理器，处理版本化的插件生命周期</li>
      <li><strong>managedPlugins.ts</strong> — 企业级托管插件，由组织管理员统一配置</li>
      <li><strong>Plugin Marketplace</strong> — 插件市场集成，支持浏览、安装和自动更新</li>
      <li><strong>blocklist</strong> — 插件黑名单机制，阻止已知有问题的插件版本</li>
    </ul>

    <h2>17.5 Slash 命令系统</h2>
    <p><strong>commands/</strong> 目录定义了 <strong>83+ 个 Slash 命令</strong>，按功能分类：</p>
    <ul>
      <li><strong>Git 操作</strong> — /commit, /pr, /review-pr 等版本控制快捷命令</li>
      <li><strong>会话管理</strong> — /clear, /compact, /resume 等会话控制命令</li>
      <li><strong>调试工具</strong> — /debug, /doctor, /bug-report 等诊断命令</li>
      <li><strong>配置管理</strong> — /config, /theme, /model 等设置命令</li>
      <li><strong>项目工具</strong> — /init, /search, /install 等项目操作命令</li>
    </ul>
    <p>每个 Slash 命令可以直接执行逻辑，也可以触发对应的 Skill。当用户输入 "/skill-name" 时，系统会查找匹配的 Skill 并通过 SkillTool 执行。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>Skills / Plugins / Commands 架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">用户入口层</h4>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <div style="background: #16213e; padding: 12px 18px; border-radius: 8px; border: 2px solid #e94560;">
              <div style="font-weight: bold;">Slash 命令 /xxx</div>
              <div style="font-size: 11px; color: #aaa;">83+ 个命令</div>
            </div>
            <div style="background: #16213e; padding: 12px 18px; border-radius: 8px; border: 2px solid #e94560;">
              <div style="font-weight: bold;">SkillTool 调用</div>
              <div style="font-size: 11px; color: #aaa;">AI 自动匹配</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">Skills 引擎</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">bundledSkills</div>
              <div style="font-size: 11px; color: #aaa;">17+ 内置 Skills</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">loadSkillsDir</div>
              <div style="font-size: 11px; color: #aaa;">.claude/skills/ 自定义</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460;">
              <div style="font-weight: bold; font-size: 13px;">mcpSkillBuilders</div>
              <div style="font-size: 11px; color: #aaa;">MCP Prompts 转 Skill</div>
            </div>
          </div>
          <div style="margin-top: 10px; background: #0d1b2a; padding: 10px; border-radius: 8px; text-align: center; border: 1px dashed #0f3460;">
            <div style="font-size: 12px; color: #8ab4f8;">Frontmatter 钩子: PreToolUse / PostToolUse</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">Plugins 生态</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">pluginLoader</div>
              <div style="font-size: 10px; color: #aaa;">加载 &amp; 缓存</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">installedMgr</div>
              <div style="font-size: 10px; color: #aaa;">版本管理</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">managedPlugins</div>
              <div style="font-size: 10px; color: #aaa;">企业托管</div>
            </div>
            <div style="background: #2d1b4e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">
              <div style="font-weight: bold;">marketplace</div>
              <div style="font-size: 10px; color: #aaa;">市场 &amp; 更新</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">commands/ — Slash 命令注册表</h4>
          <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/commit</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/pr</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/review-pr</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/clear</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/compact</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/debug</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/doctor</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">/config</div>
            <div style="background: #16213e; padding: 6px 12px; border-radius: 16px; border: 1px solid #48c9b0; font-size: 12px;">...80+</div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'Skill 加载与 Frontmatter 解析',
      language: 'typescript',
      code: `// Skill 文件结构 (.claude/skills/my-skill.md)
// ---
// name: my-custom-skill
// description: 自定义代码审查 Skill
// hooks:
//   PreToolUse:
//     - tool: Write
//       match: "**/*.ts"
//   PostToolUse:
//     - tool: Bash
// ---
// 你是一个代码审查专家。在写入 TypeScript 文件前...

interface SkillDefinition {
  name: string;
  description: string;
  content: string;       // Markdown 正文 = 提示词
  hooks?: {
    PreToolUse?: HookConfig[];
    PostToolUse?: HookConfig[];
  };
  source: "bundled" | "user" | "mcp" | "plugin";
}

interface HookConfig {
  tool: string;         // 匹配的工具名
  match?: string;       // 文件模式（glob）
}

// loadSkillsDir.ts: 从磁盘加载用户 Skills
async function loadSkillsDir(
  skillsPath: string
): Promise<SkillDefinition[]> {
  const files = await glob(skillsPath + "/**/*.md");
  const skills: SkillDefinition[] = [];

  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);

    skills.push({
      name: frontmatter.name || basename(file, ".md"),
      description: frontmatter.description || "",
      content: body,
      hooks: frontmatter.hooks,
      source: "user"
    });
  }

  return skills;
}

// bundledSkills.ts: 内置 Skills 注册表
const bundledSkills: SkillDefinition[] = [
  {
    name: "simplify",
    description: "审查变更代码的质量和效率",
    content: "检查代码复用性、质量和效率...",
    source: "bundled"
  },
  {
    name: "loop",
    description: "以固定间隔循环执行命令",
    content: "按照指定的时间间隔重复运行...",
    source: "bundled"
  }
  // ... 15+ 更多内置 Skills
];`
    },
    {
      title: 'SkillTool 执行与 Plugin 加载',
      language: 'typescript',
      code: `// SkillTool: 执行 Skill 的核心工具
class SkillTool {
  private registry: Map<string, SkillDefinition>;

  async execute(input: {
    skill: string;
    args?: string;
  }): Promise<SkillResult> {
    // 按名称或完全限定名查找 Skill
    const skill = this.findSkill(input.skill);
    if (!skill) {
      throw new Error(
        "Skill not found: " + input.skill
      );
    }

    // 将 Skill 内容注入子对话
    const subConversation = createSubConversation({
      systemPrompt: skill.content,
      userMessage: input.args || "",
      tools: getAvailableTools()
    });

    // 执行子对话
    return await runSubConversation(subConversation);
  }

  private findSkill(name: string): SkillDefinition | undefined {
    // 完全限定名: "plugin:skill-name"
    if (name.includes(":")) {
      return this.registry.get(name);
    }
    // 短名称匹配
    return this.registry.get(name)
      || [...this.registry.values()].find(
        s => s.name === name
      );
  }
}

// pluginLoader.ts: 插件加载与缓存
class PluginLoader {
  private cache = new Map<string, Plugin>();

  async loadPlugin(
    pluginId: string
  ): Promise<Plugin> {
    // 检查缓存
    if (this.cache.has(pluginId)) {
      return this.cache.get(pluginId)!;
    }

    // 从 marketplace 或本地加载
    const manifest = await this.fetchManifest(pluginId);

    // 黑名单检查
    if (isBlocklisted(pluginId, manifest.version)) {
      throw new Error(
        "Plugin " + pluginId + " is blocklisted"
      );
    }

    const plugin = await this.instantiate(manifest);
    this.cache.set(pluginId, plugin);
    return plugin;
  }
}

// installedPluginsManager.ts: 版本化管理
class InstalledPluginsManager {
  private plugins: Map<string, InstalledPlugin>;

  async install(
    pluginId: string,
    version: string
  ): Promise<void> {
    const plugin = await PluginLoader.loadPlugin(
      pluginId
    );
    this.plugins.set(pluginId, {
      ...plugin,
      installedVersion: version,
      installedAt: new Date()
    });
  }

  async checkUpdates(): Promise<UpdateInfo[]> {
    const updates: UpdateInfo[] = [];
    for (const [id, plugin] of this.plugins) {
      const latest = await fetchLatestVersion(id);
      if (latest !== plugin.installedVersion) {
        updates.push({
          pluginId: id,
          current: plugin.installedVersion,
          latest
        });
      }
    }
    return updates;
  }
}`
    },
    {
      title: 'Slash 命令注册与路由',
      language: 'typescript',
      code: `// commands/ 目录: Slash 命令定义
interface SlashCommand {
  name: string;           // 命令名（不含 /）
  description: string;
  aliases?: string[];     // 别名
  category: CommandCategory;
  execute: (
    args: string,
    context: CommandContext
  ) => Promise<void>;
}

type CommandCategory =
  | "git"
  | "session"
  | "debug"
  | "config"
  | "project";

// 示例: /commit 命令
const commitCommand: SlashCommand = {
  name: "commit",
  description: "分析变更并创建 Git 提交",
  category: "git",
  execute: async (args, ctx) => {
    // 触发 commit Skill
    await ctx.skillTool.execute({
      skill: "commit",
      args: args
    });
  }
};

// 命令路由器
class CommandRouter {
  private commands = new Map<string, SlashCommand>();

  register(cmd: SlashCommand): void {
    this.commands.set(cmd.name, cmd);
    // 注册别名
    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        this.commands.set(alias, cmd);
      }
    }
  }

  async route(
    input: string,
    ctx: CommandContext
  ): Promise<boolean> {
    if (!input.startsWith("/")) return false;

    const parts = input.slice(1).split(" ");
    const cmdName = parts[0];
    const args = parts.slice(1).join(" ");

    const cmd = this.commands.get(cmdName);
    if (!cmd) {
      // 尝试模糊匹配
      const fuzzy = this.fuzzyMatch(cmdName);
      if (fuzzy) {
        await fuzzy.execute(args, ctx);
        return true;
      }
      return false;
    }

    await cmd.execute(args, ctx);
    return true;
  }

  private fuzzyMatch(
    name: string
  ): SlashCommand | undefined {
    const candidates = [...this.commands.entries()]
      .filter(([k]) => k.startsWith(name));
    return candidates.length === 1
      ? candidates[0][1]
      : undefined;
  }

  listByCategory(
    cat: CommandCategory
  ): SlashCommand[] {
    return [...this.commands.values()]
      .filter(c => c.category === cat);
  }
}`
    }
  ],
  interactive: `
    <h3>Skills 与 Plugins 交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 用户输入 Slash 命令</h4>
        <p>用户在 REPL 中输入 <code>/simplify</code>。CommandRouter 识别这是一个 Slash 命令，查找匹配的内置 Skill。</p>
        <div class="code-highlight">
          <pre>用户输入: /simplify
CommandRouter.route("/simplify")
  &#x2192; 查找命令: "simplify"
  &#x2192; 匹配到 bundled Skill: "simplify"
  &#x2192; 触发 SkillTool.execute({ skill: "simplify" })</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: Skill 内容注入</h4>
        <p>SkillTool 读取 simplify Skill 的 Markdown 内容，将其作为系统提示词注入子对话。子对话拥有完整的工具访问能力。</p>
        <div class="code-highlight">
          <pre>子对话创建:
  systemPrompt: "检查变更代码的复用性、质量和效率。
    找到问题后立即修复..."
  tools: [Read, Write, Grep, Glob, Bash, LSP]
  context: 当前 git diff 中的变更文件</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: Frontmatter 钩子触发</h4>
        <p>如果 Skill 声明了 PreToolUse 钩子（如匹配 Write 工具 + *.ts 文件），则在每次工具调用前自动执行钩子逻辑。</p>
        <div class="code-highlight">
          <pre>Skill 钩子触发:
  PreToolUse: Write "src/auth/login.ts"
    &#x2192; 匹配 hooks.PreToolUse[0]: tool=Write, match="**/*.ts"
    &#x2192; 执行前置检查: 代码风格验证
    &#x2192; 通过 &#x2714; 继续执行 Write 工具</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: Plugin 自动更新</h4>
        <p>InstalledPluginsManager 在启动时检查已安装插件的更新。发现新版本后提示用户，同时检查黑名单确保安全。</p>
        <div class="code-highlight">
          <pre>Plugin 更新检查:
  my-linter-plugin: v1.2.0 &#x2192; v1.3.0 (可更新)
  code-formatter:   v2.0.1 &#x2192; v2.0.1 (最新)
  unsafe-plugin:    v0.9.0 &#x2192; BLOCKLISTED (已拦截)

自动更新: my-linter-plugin &#x2192; v1.3.0 &#x2714;</pre>
        </div>
      </div>
    </div>
  `
}
