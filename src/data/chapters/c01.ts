import type { ChapterData } from '../chapters'

export const c01: ChapterData = {
  content: `
<h2>启动引擎概述</h2>
<blockquote>Claude Code 的启动过程是一个精心编排的性能优化管道，通过并行预取和延迟初始化将冷启动时间压缩到毫秒级。</blockquote>

<h3>入口文件：main.tsx</h3>
<p>整个应用的入口点是 <code>src/main.tsx</code>，这是一个约 800 行的文件，使用 Commander.js 解析 CLI 参数并编排整个启动过程。最关键的设计决策是：<strong>在模块导入之前就发起并行预取</strong>。</p>

<p>启动的第一行代码不是 import 语句，而是三个性能关键的副作用调用：</p>
<ol>
<li><code>profileCheckpoint('main_tsx_entry')</code> — 标记入口时间戳，用于启动性能追踪</li>
<li><code>startMdmRawRead()</code> — 启动 MDM（移动设备管理）子进程，通过 <code>plutil</code>（macOS）或注册表查询（Windows）读取企业策略配置</li>
<li><code>startKeychainPrefetch()</code> — 启动 macOS Keychain 读取，预加载 OAuth token 等安全凭据</li>
</ol>

<p>这三个调用会在 import 阶段（约 135ms）与模块加载<strong>并行执行</strong>，从而将总启动时间减少约 100-200ms。</p>

<h3>初始化管道：init.ts</h3>
<p><code>src/entrypoints/init.ts</code> 导出一个<strong>记忆化的</strong> <code>init()</code> 函数，确保只执行一次。初始化管道的顺序经过精心设计：</p>

<ol>
<li><strong>enableConfigs()</strong> — 验证并启用 JSON 配置文件</li>
<li><strong>applySafeConfigEnvironmentVariables()</strong> — 在建立信任之前应用安全的环境变量</li>
<li><strong>applyExtraCACertsFromConfig()</strong> — 加载额外的 CA 证书（必须在首次 TLS 握手之前！）</li>
<li><strong>setupGracefulShutdown()</strong> — 注册进程清理处理程序（SIGINT/SIGTERM）</li>
<li><strong>并行异步任务</strong> — 1P 事件日志、OAuth 填充、JetBrains 检测、仓库检测</li>
<li><strong>configureGlobalMTLS()</strong> — 配置双向 TLS 认证</li>
<li><strong>configureGlobalAgents()</strong> — 配置 HTTP/HTTPS 代理</li>
<li><strong>preconnectAnthropicApi()</strong> — TCP+TLS 预热连接，节省 100-200ms 首次 API 调用延迟</li>
</ol>

<h3>REPL 启动器：replLauncher.tsx</h3>
<p>REPL 启动器是一个精简的中间层，负责动态导入 <code>App</code> 和 <code>REPL</code> 组件：</p>
<pre><code class="language-typescript">const { App } = await import('./components/App.js')
const { REPL } = await import('./screens/REPL.js')
await renderAndRun(root, &lt;App {...appProps}&gt;&lt;REPL {...replProps} /&gt;&lt;/App&gt;)</code></pre>

<p>动态导入确保了 UI 组件的代码只在交互模式下加载，<code>--print</code>（headless）模式完全跳过 UI 初始化。</p>

<h3>迁移系统</h3>
<p>Claude Code 维护了一个编号迁移系统（当前版本 11），处理配置 schema 演进：模型名称重命名、设置路径迁移、数据结构升级。<code>runMigrations()</code> 在 init() 之后同步执行，确保后续代码始终面对最新的数据结构。</p>

<h3>延迟预取策略</h3>
<p><code>startDeferredPrefetches()</code> 在首次渲染之后触发，包含不影响首屏的初始化任务：</p>
<ul>
<li><code>initUser()</code> — 用户身份初始化</li>
<li><code>getUserContext()</code> — 用户上下文信息</li>
<li>提示信息加载、文件计数、模型能力检测</li>
<li>变更检测器启动</li>
</ul>
`,

  architecture: `
<h2>启动管道架构</h2>

<h3>时序图</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>阶段</th><th>时间</th><th>执行内容</th><th>并行性</th></tr></thead>
<tbody>
<tr><td>T0</td><td>0ms</td><td>profileCheckpoint</td><td>—</td></tr>
<tr><td>T1</td><td>0-1ms</td><td>startMdmRawRead + startKeychainPrefetch</td><td>并行启动子进程</td></tr>
<tr><td>T2</td><td>1-135ms</td><td>200+ 模块导入</td><td>与 T1 的子进程并行</td></tr>
<tr><td>T3</td><td>135-140ms</td><td>runMigrations()</td><td>同步</td></tr>
<tr><td>T4</td><td>140-160ms</td><td>init() 管道</td><td>内部有并行步骤</td></tr>
<tr><td>T5</td><td>160-180ms</td><td>CLI 解析 + 认证检查</td><td>同步</td></tr>
<tr><td>T6</td><td>180-200ms</td><td>launchRepl() / runHeadless()</td><td>—</td></tr>
<tr><td>T7</td><td>200ms+</td><td>startDeferredPrefetches()</td><td>后台异步</td></tr>
</tbody>
</table>
</div>

<h3>模块依赖关系</h3>
<p>启动引擎涉及以下核心模块：</p>
<ul>
<li><strong>main.tsx</strong> → 编排整个启动流程</li>
<li><strong>entrypoints/init.ts</strong> → 核心初始化（网络、安全、清理）</li>
<li><strong>replLauncher.tsx</strong> → REPL 模式启动器</li>
<li><strong>entrypoints/cli.tsx</strong> → SDK/编程模式入口</li>
<li><strong>migrations/</strong> → 11 个编号迁移处理器</li>
<li><strong>bootstrap/state.ts</strong> → 全局单例状态初始化</li>
</ul>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么在 import 之前执行副作用？</strong></p>
<p>Node.js/Bun 的模块加载是同步阻塞的。在 200+ 个模块的导入过程中（约 135ms），CPU 主要在做语法解析和模块求值，网络和子进程 I/O 处于空闲状态。通过在 import 之前启动子进程和网络请求，这段 I/O 等待时间被完全隐藏在模块加载时间内。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'main.tsx — 启动序列（简化）',
      language: 'typescript',
      code: `// 性能关键：在 import 之前启动并行预取
profileCheckpoint('main_tsx_entry')
startMdmRawRead()       // 启动 MDM 子进程（plutil/reg query）
startKeychainPrefetch() // 启动 macOS Keychain 读取

// 200+ 个模块导入（~135ms，与上述子进程并行）
import { Command } from 'commander'
import { init } from './entrypoints/init.js'
import { launchRepl } from './replLauncher.js'
// ... 200+ more imports

// 同步迁移
await runMigrations()

// 核心初始化
await init()

// CLI 解析
const program = new Command()
  .name('claude')
  .version(VERSION)
  .option('--print', 'headless mode')
  .option('--model <model>', 'model override')
  // ... more options

// 分支：交互 vs headless
if (options.print) {
  await runHeadless(options)
} else {
  await launchRepl(options)
}`
    },
    {
      title: 'entrypoints/init.ts — 初始化管道',
      language: 'typescript',
      code: `// 记忆化确保只执行一次
export const init = memoize(async () => {
  // 1. 配置验证
  enableConfigs()

  // 2. 安全环境变量（信任建立前）
  applySafeConfigEnvironmentVariables()

  // 3. TLS 证书（必须在首次握手前！）
  applyExtraCACertsFromConfig()

  // 4. 优雅关闭
  setupGracefulShutdown()

  // 5. 并行的后台任务（fire-and-forget）
  void initializeFirstPartyEventLogging()
  void populateOAuthTokenCache()
  void detectJetBrains()

  // 6. 网络配置
  configureGlobalMTLS()
  configureGlobalAgents()    // HTTP/HTTPS 代理

  // 7. API 预连接（TCP+TLS 预热）
  preconnectAnthropicApi()   // 节省 100-200ms

  // 8. 平台适配
  setShellIfWindows()

  // 9. 注册清理处理程序
  registerCleanup('lsp', () => LSPServerManager.shutdown())
  registerCleanup('teams', () => cleanupTeams())
})`
    },
    {
      title: 'replLauncher.tsx — REPL 启动',
      language: 'typescript',
      code: `export async function launchRepl(options: LaunchOptions) {
  // 动态导入 UI 组件（headless 模式不会触发）
  const { App } = await import('./components/App.js')
  const { REPL } = await import('./screens/REPL.js')

  const root = createRoot()

  await renderAndRun(root,
    <App
      model={options.model}
      tools={options.tools}
      permissionMode={options.permissionMode}
    >
      <REPL
        initialPrompt={options.prompt}
        resumeSession={options.resume}
      />
    </App>
  )
}`
    }
  ],

  interactive: `
<h2>启动流程互动解析</h2>
<h3>第 1 步：预取启动</h3>
<p>在任何模块被导入之前，系统就开始了两个关键的 I/O 操作。这就像你在等电梯的时候先打开手机查看今天的行程——利用等待时间做有用的事。</p>

<h3>第 2 步：模块加载</h3>
<p>200+ 个 TypeScript 模块被同步加载。虽然这需要约 135ms，但此时 MDM 子进程和 Keychain 读取已经在后台运行。</p>

<h3>第 3 步：初始化管道</h3>
<p>init() 函数按严格顺序执行 8 个步骤，每个步骤都有明确的依赖原因。例如 CA 证书必须在任何 HTTPS 请求之前加载。</p>

<h3>第 4 步：分支决策</h3>
<p>根据 CLI 参数决定进入交互式 REPL 还是 headless 执行模式。headless 模式完全跳过 UI 相关代码的加载。</p>

<h3>关键性能指标</h3>
<ul>
<li><strong>并行预取节省</strong>：~100-200ms</li>
<li><strong>API 预连接节省</strong>：~100-200ms 首 token 延迟</li>
<li><strong>延迟预取</strong>：不影响首屏渲染的任务推迟到渲染后</li>
</ul>
`
}
