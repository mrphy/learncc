import type { ChapterData } from '../chapters'

export const c02: ChapterData = {
  content: `
<h2>配置系统概述</h2>
<blockquote>Claude Code 拥有业界罕见的 7 层配置优先级体系，从 CLI 标志到全局默认值，每一层都有明确的覆盖语义。配置系统不仅支持个人开发者的灵活定制，还通过 MDM 企业策略实现了大规模部署管控。</blockquote>

<h3>7 层配置优先级</h3>
<p>配置的合并遵循<strong>高优先级覆盖低优先级</strong>的原则，从高到低依次为：</p>
<ol>
<li><strong>CLI flags</strong> — 命令行参数（如 <code>--model opus</code>），拥有最高优先级</li>
<li><strong>Policy / MDM</strong> — 企业策略配置，通过 macOS <code>plutil</code> 或 Windows 注册表读取，不可被用户覆盖</li>
<li><strong>Remote managed</strong> — 远程托管配置，来自服务器下发的策略</li>
<li><strong>Flag file</strong> — 功能标志文件，用于 A/B 测试和灰度发布</li>
<li><strong>Project</strong> — 项目级配置 <code>.claude/settings.json</code>，存储在仓库根目录</li>
<li><strong>User</strong> — 用户级配置 <code>~/.claude/settings.json</code>，跨项目生效</li>
<li><strong>Global</strong> — 全局默认配置 <code>~/.claude.json</code>，最低优先级</li>
</ol>

<h3>getInitialSettings() 合并逻辑</h3>
<p><code>getInitialSettings()</code> 是配置系统的核心入口函数。它按优先级顺序读取所有配置源，使用深度合并（deep merge）策略将它们组合成最终的配置对象。关键设计：</p>
<ul>
<li>数组类型的配置项（如 <code>allowedTools</code>）使用<strong>合并</strong>而非覆盖</li>
<li>对象类型的配置项（如 <code>mcpServers</code>）使用<strong>深度合并</strong></li>
<li>标量值（如 <code>model</code>）使用<strong>高优先级覆盖</strong></li>
<li>MDM 策略中的某些字段具有<strong>强制性</strong>，即使 CLI 也无法覆盖</li>
</ul>

<h3>MDM 企业策略</h3>
<p>MDM（Mobile Device Management）是 Claude Code 支持企业部署的关键特性。在启动阶段，<code>startMdmRawRead()</code> 会异步启动一个子进程来读取企业策略：</p>
<ul>
<li><strong>macOS</strong>：通过 <code>plutil -extract ... -o - /Library/Managed Preferences/com.anthropic.claude-code.plist</code> 读取托管首选项</li>
<li><strong>Windows</strong>：通过注册表查询 <code>HKLM\\SOFTWARE\\Policies\\Anthropic\\ClaudeCode</code></li>
<li>MDM 策略可以强制锁定模型选择、禁用特定工具、配置代理服务器等</li>
</ul>

<h3>Zod v4 Schema 验证</h3>
<p>所有配置文件在加载时都会通过 Zod v4 schema 进行严格验证。<code>SettingsJson</code> 类型定义了配置的完整结构：</p>
<ul>
<li><code>permissions</code> — 权限模式设置</li>
<li><code>allowedTools</code> — 允许使用的工具白名单</li>
<li><code>denyTools</code> — 禁止使用的工具黑名单</li>
<li><code>mcpServers</code> — MCP 服务器配置映射</li>
<li><code>hooks</code> — 生命周期钩子配置</li>
<li><code>model</code> — 默认模型设置</li>
<li><code>customApiKeyResponses</code> — 自定义 API 密钥行为</li>
</ul>
<p>验证失败时会给出详细的错误信息并回退到默认值，避免因配置错误导致应用崩溃。</p>

<h3>配置变更检测</h3>
<p><code>changeDetector.ts</code> 实现了文件系统监控，使用 <code>fs.watch</code> 监听配置文件变更。当用户在编辑器中修改 <code>.claude/settings.json</code> 时，系统能在毫秒级感知变更并自动重新加载配置，无需重启 Claude Code。</p>

<h3>环境变量处理</h3>
<p><code>applySafeConfigEnvironmentVariables()</code> 在信任链建立之前执行，仅应用被标记为"安全"的环境变量。这个设计避免了恶意项目通过 <code>.env</code> 文件注入危险的环境变量。</p>

<h3>settingsCache 性能优化</h3>
<p>由于配置读取在热路径上频繁调用（每次工具调用都需要检查权限），系统使用 <code>settingsCache</code> 缓存解析后的配置对象。缓存在检测到文件变更时自动失效，确保一致性与性能的平衡。</p>
`,

  architecture: `
<h2>配置系统架构</h2>

<h3>配置合并流程</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>优先级</th><th>配置源</th><th>读取方式</th><th>合并策略</th></tr></thead>
<tbody>
<tr><td>1 (最高)</td><td>CLI flags</td><td>Commander.js 解析</td><td>直接覆盖</td></tr>
<tr><td>2</td><td>MDM Policy</td><td>plutil / reg query 子进程</td><td>强制覆盖（部分字段）</td></tr>
<tr><td>3</td><td>Remote managed</td><td>HTTP API 请求</td><td>深度合并</td></tr>
<tr><td>4</td><td>Flag file</td><td>文件系统读取</td><td>深度合并</td></tr>
<tr><td>5</td><td>Project settings</td><td>.claude/settings.json</td><td>深度合并</td></tr>
<tr><td>6</td><td>User settings</td><td>~/.claude/settings.json</td><td>深度合并</td></tr>
<tr><td>7 (最低)</td><td>Global defaults</td><td>~/.claude.json</td><td>基础值</td></tr>
</tbody>
</table>
</div>

<h3>核心模块关系</h3>
<ul>
<li><strong>utils/settings/</strong> — 配置系统主目录
  <ul>
  <li><code>settings.ts</code> — getInitialSettings(), getCurrentSettings()</li>
  <li><code>config.ts</code> — enableConfigs(), 配置文件路径解析</li>
  <li><code>changeDetector.ts</code> — 文件监控与缓存失效</li>
  <li><code>settingsCache.ts</code> — 解析结果缓存</li>
  </ul>
</li>
<li><strong>schemas/</strong> — Zod v4 验证 schema
  <ul>
  <li><code>SettingsJsonSchema</code> — 主配置 schema</li>
  <li><code>McpServerSchema</code> — MCP 服务器配置 schema</li>
  <li><code>HooksSchema</code> — 钩子配置 schema</li>
  </ul>
</li>
<li><strong>mdm.ts</strong> — MDM 企业策略读取与解析</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么用 7 层而不是简单的覆盖？</strong></p>
<p>Claude Code 需要同时满足个人开发者和企业 IT 管理员的需求。个人开发者需要项目级和用户级的灵活配置；企业 IT 需要通过 MDM 策略强制执行安全策略（如禁止使用某些工具、锁定模型选择）。7 层体系让这两种需求和谐共存，MDM 策略可以覆盖用户设置，但 CLI 标志仍然在开发/调试时拥有最高优先级。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: '7 层配置合并 — getInitialSettings()',
      language: 'typescript',
      code: `// utils/settings/settings.ts — 简化版
export function getInitialSettings(cliFlags?: Partial<SettingsJson>): SettingsJson {
  // 第 7 层：全局默认值
  const globalDefaults = loadJsonSafe<SettingsJson>(
    path.join(os.homedir(), '.claude.json'),
    SettingsJsonSchema
  )

  // 第 6 层：用户级配置
  const userSettings = loadJsonSafe<SettingsJson>(
    path.join(os.homedir(), '.claude', 'settings.json'),
    SettingsJsonSchema
  )

  // 第 5 层：项目级配置
  const projectSettings = loadJsonSafe<SettingsJson>(
    path.join(findProjectRoot(), '.claude', 'settings.json'),
    SettingsJsonSchema
  )

  // 第 4 层：Flag file
  const flagFileSettings = loadFlagFileSettings()

  // 第 3 层：远程托管配置
  const remoteSettings = getRemoteManagedSettings()

  // 第 2 层：MDM 企业策略
  const mdmPolicy = getMdmSettings()

  // 深度合并，高优先级覆盖低优先级
  let merged = deepMerge(
    globalDefaults,
    userSettings,
    projectSettings,
    flagFileSettings,
    remoteSettings
  )

  // MDM 策略的强制字段不可覆盖
  merged = applyMdmEnforcement(merged, mdmPolicy)

  // 第 1 层：CLI 标志（最高优先级）
  if (cliFlags) {
    merged = deepMerge(merged, cliFlags)
  }

  return merged
}`
    },
    {
      title: 'MDM 企业策略读取',
      language: 'typescript',
      code: `// mdm.ts — macOS 通过 plutil 读取托管首选项
let mdmRawReadPromise: Promise<string> | null = null

export function startMdmRawRead(): void {
  if (process.platform === 'darwin') {
    // 异步启动 plutil 子进程（与模块导入并行）
    mdmRawReadPromise = execAsync(
      'plutil -extract . json -o - ' +
      '/Library/Managed\\ Preferences/com.anthropic.claude-code.plist'
    ).then(({ stdout }) => stdout)
     .catch(() => '{}')  // 无 MDM 策略时返回空对象
  } else if (process.platform === 'win32') {
    // Windows 通过注册表读取
    mdmRawReadPromise = execAsync(
      'reg query "HKLM\\\\SOFTWARE\\\\Policies\\\\Anthropic\\\\ClaudeCode" /s'
    ).then(({ stdout }) => parseRegistryOutput(stdout))
     .catch(() => '{}')
  }
}

export async function getMdmSettings(): Promise<Partial<SettingsJson>> {
  if (!mdmRawReadPromise) return {}
  const raw = await mdmRawReadPromise
  const parsed = JSON.parse(raw)
  // 通过 Zod 验证 MDM 策略格式
  return MdmPolicySchema.safeParse(parsed).data ?? {}
}`
    },
    {
      title: 'Zod v4 Schema 验证与 SettingsJson 类型',
      language: 'typescript',
      code: `// schemas/settingsSchema.ts
import { z } from 'zod/v4'

const McpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  type: z.enum(['stdio', 'sse']).default('stdio'),
})

export const SettingsJsonSchema = z.object({
  // 权限控制
  permissions: z.object({
    allow: z.array(z.string()).default([]),
    deny: z.array(z.string()).default([]),
  }).optional(),

  // 工具白名单 / 黑名单
  allowedTools: z.array(z.string()).optional(),
  denyTools: z.array(z.string()).optional(),

  // MCP 服务器配置
  mcpServers: z.record(McpServerSchema).optional(),

  // 生命周期钩子
  hooks: z.record(z.object({
    command: z.string(),
    timeout: z.number().default(30000),
  })).optional(),

  // 模型设置
  model: z.string().optional(),
  maxThinkingTokens: z.number().optional(),

  // 自定义 API 密钥
  customApiKeyResponses: z.record(z.string()).optional(),
}).passthrough()  // 允许未知字段，向前兼容

export type SettingsJson = z.infer<typeof SettingsJsonSchema>

// 安全加载配置文件
function loadJsonSafe<T>(filePath: string, schema: z.ZodType<T>): T {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    const result = schema.safeParse(parsed)
    if (result.success) return result.data
    // 验证失败：记录警告并返回默认值
    logWarning('Config validation failed:', result.error.issues)
    return schema.parse({})  // 返回默认值
  } catch {
    return schema.parse({})  // 文件不存在或格式错误
  }
}`
    }
  ],

  interactive: `
<h2>配置系统互动解析</h2>

<h3>第 1 步：理解优先级</h3>
<p>想象一个场景：你在公司使用 Claude Code。IT 部门通过 MDM 策略禁止了 <code>Bash</code> 工具的使用。你在项目的 <code>.claude/settings.json</code> 中配置了 <code>"allowedTools": ["Bash"]</code>，然后用 <code>--allowedTools Bash</code> 启动。最终 Bash 能用吗？</p>
<p><strong>答案：不能。</strong>MDM 策略的 <code>denyTools</code> 是强制性的，即使 CLI 标志也无法覆盖它。这就是第 2 层（MDM）对某些字段具有"强制覆盖"语义的体现。</p>

<h3>第 2 步：深度合并如何工作</h3>
<p>假设用户级配置定义了 <code>mcpServers: { "github": { command: "gh-mcp" } }</code>，项目级配置定义了 <code>mcpServers: { "jira": { command: "jira-mcp" } }</code>。合并结果是什么？</p>
<p><strong>答案：</strong>两个 MCP 服务器都会存在，因为对象类型使用深度合并。最终的 <code>mcpServers</code> 会同时包含 <code>github</code> 和 <code>jira</code>。</p>

<h3>第 3 步：Schema 验证的安全网</h3>
<p>如果你不小心在 <code>settings.json</code> 中写了 <code>"model": 123</code>（应该是字符串），会发生什么？</p>
<p><strong>答案：</strong>Zod schema 验证会捕获这个类型错误，记录一条警告日志，然后回退到默认值。应用不会崩溃，而是静默降级。</p>

<h3>第 4 步：变更检测的实时性</h3>
<p><code>changeDetector.ts</code> 使用 <code>fs.watch</code> 监听所有配置文件。当你在 VS Code 中修改并保存 <code>.claude/settings.json</code> 时，系统会：</p>
<ol>
<li>收到文件系统事件通知</li>
<li>使 <code>settingsCache</code> 中对应的缓存条目失效</li>
<li>下次调用 <code>getCurrentSettings()</code> 时重新读取并解析文件</li>
<li>新配置立即生效，无需重启</li>
</ol>

<h3>关键设计洞察</h3>
<ul>
<li><strong>安全优先</strong>：MDM 策略不可被用户覆盖，确保企业合规</li>
<li><strong>向前兼容</strong>：Schema 使用 <code>.passthrough()</code> 允许未知字段</li>
<li><strong>性能意识</strong>：settingsCache 避免重复的文件 I/O 和 JSON 解析</li>
<li><strong>优雅降级</strong>：配置错误不会导致崩溃，而是回退到默认值</li>
</ul>
`
}
