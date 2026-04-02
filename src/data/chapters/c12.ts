import type { ChapterData } from '../chapters'

export const c12: ChapterData = {
  content: `
    <h2>12.1 五种传输协议</h2>
    <p>Claude Code 的 MCP（Model Context Protocol）集成支持 <strong>5 种传输协议</strong>，覆盖从本地进程到远程服务的全场景通信需求：</p>
    <ul>
      <li><strong>StdioClientTransport</strong> — 通过子进程的 stdin/stdout 通信，最常用的本地 MCP 服务器连接方式。启动一个子进程并通过标准输入输出交换 JSON-RPC 消息</li>
      <li><strong>SSEClientTransport</strong> — 基于 Server-Sent Events 的 HTTP 长连接，适合远程 MCP 服务器。客户端通过 GET 请求建立 SSE 连接接收消息，通过 POST 发送请求</li>
      <li><strong>StreamableHTTPClientTransport</strong> — 基于可流式 HTTP 的传输，支持双向流通信，是 SSE 的升级版本</li>
      <li><strong>WebSocketTransport</strong> — 基于 WebSocket 的全双工通信，适合需要低延迟双向交互的场景</li>
      <li><strong>SdkControlClientTransport</strong> — SDK 控制传输，用于 Claude Code SDK 内部进程间通信</li>
    </ul>

    <h2>12.2 客户端核心逻辑</h2>
    <p><strong>client.ts</strong> 是 MCP 集成的核心模块，提供三个关键函数：</p>
    <ul>
      <li><code>connectToServer()</code> — 根据配置选择传输协议，建立与 MCP 服务器的连接。处理连接超时、重连和错误恢复</li>
      <li><code>fetchToolsForClient()</code> — 从已连接的 MCP 服务器获取工具列表，并将 MCP 工具定义转换为 Claude Code 内部的 Tool 对象格式。这个转换过程包括参数映射、权限标记和描述本地化</li>
      <li><code>prefetchAllMcpResources()</code> — 预加载所有 MCP 服务器的资源（工具列表、资源模板等），减少运行时的延迟</li>
    </ul>

    <h2>12.3 配置管理与聚合</h2>
    <p><strong>config.ts</strong> 负责 MCP 配置的解析和聚合：</p>
    <ul>
      <li><code>parseMcpConfig()</code> — 解析单个 MCP 服务器配置，验证必要字段</li>
      <li><code>getClaudeCodeMcpConfigs()</code> — 从多个来源聚合 MCP 配置：项目 <code>.mcp.json</code>、用户全局配置、企业管理员配置、Skill 定义的 MCP 服务器</li>
      <li><code>filterMcpServersByPolicy()</code> — 根据组织策略过滤 MCP 服务器，企业管理员可以设置允许列表和黑名单</li>
    </ul>

    <h2>12.4 OAuth 认证与错误处理</h2>
    <p><strong>auth.ts</strong> 实现了完整的 OAuth 认证流程，支持 XAA IDP 登录。当 MCP 服务器需要认证时，系统会自动引导用户完成 OAuth 授权流程，获取并缓存访问令牌。</p>
    <p>MCP 集成定义了自定义错误层次结构：</p>
    <ul>
      <li><strong>McpAuthError</strong> — 认证失败，需要用户重新授权</li>
      <li><strong>McpSessionExpiredError</strong> — 会话过期，需要重新建立连接</li>
      <li><strong>McpToolCallError</strong> — 工具调用失败，包含错误详情和重试建议</li>
    </ul>

    <h2>12.5 MCPTool 包装器与权限控制</h2>
    <p><strong>MCPTool</strong> 包装器将 MCP 服务器暴露的工具封装为 Claude Code 标准工具接口。<strong>MCPConnectionManager.tsx</strong> 是 React 组件，提供连接状态可视化和管理界面。通道权限系统通过 allowlists 控制哪些 MCP 工具可以被使用。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>MCP 集成架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">配置聚合层</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560; font-size: 13px;">.mcp.json</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560; font-size: 13px;">用户全局配置</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560; font-size: 13px;">企业配置</div>
            <div class="arch-box" style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #e94560; font-size: 13px;">Skill MCP</div>
          </div>
          <p style="text-align: center; color: #aaa; margin-top: 8px; font-size: 13px;">getClaudeCodeMcpConfigs() &#x2192; filterMcpServersByPolicy()</p>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">传输协议层</h4>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
            <div class="arch-box" style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 11px;">Stdio</div>
            <div class="arch-box" style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 11px;">SSE</div>
            <div class="arch-box" style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 11px;">StreamableHTTP</div>
            <div class="arch-box" style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 11px;">WebSocket</div>
            <div class="arch-box" style="background: #16213e; padding: 8px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 11px;">SdkControl</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">client.ts 核心连接</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">connectToServer()</div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">fetchToolsForClient()</div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #533483; font-size: 12px;">prefetchAllMcpResources()</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">MCPTool 包装器</h4>
          <p style="color: #aaa; font-size: 14px;">MCP Tool &#x2192; Claude Code Tool 对象 &#x2192; 权限检查 &#x2192; 工具调用</p>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'MCP 客户端连接与工具获取',
      language: 'typescript',
      code: `// connectToServer: 根据配置选择传输协议并连接
async function connectToServer(
  config: McpServerConfig
): Promise<McpClient> {
  let transport: Transport;

  switch (config.transport) {
    case 'stdio':
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args || [],
        env: config.env
      });
      break;
    case 'sse':
      transport = new SSEClientTransport(
        new URL(config.url),
        { headers: config.headers }
      );
      break;
    case 'streamable-http':
      transport = new StreamableHTTPClientTransport(
        new URL(config.url)
      );
      break;
    case 'websocket':
      transport = new WebSocketTransport(config.url);
      break;
    default:
      throw new Error(
        'Unsupported transport: ' + config.transport
      );
  }

  const client = new McpClient();
  await client.connect(transport);
  return client;
}

// fetchToolsForClient: MCP 工具转换为内部格式
async function fetchToolsForClient(
  client: McpClient,
  serverName: string
): Promise<Tool[]> {
  const mcpTools = await client.listTools();
  return mcpTools.map(tool => ({
    name: serverName + ':' + tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    // MCPTool 包装器处理实际调用
    execute: async (input) => {
      return client.callTool(tool.name, input);
    }
  }));
}`
    },
    {
      title: 'MCP 配置解析与聚合',
      language: 'typescript',
      code: `// parseMcpConfig: 解析单个 MCP 配置
function parseMcpConfig(
  raw: Record<string, unknown>
): McpServerConfig {
  return {
    name: String(raw.name),
    transport: raw.transport as TransportType || 'stdio',
    command: raw.command as string,
    args: (raw.args as string[]) || [],
    env: raw.env as Record<string, string>,
    url: raw.url as string,
    headers: raw.headers as Record<string, string>,
    authType: raw.authType as string
  };
}

// getClaudeCodeMcpConfigs: 聚合所有来源的配置
async function getClaudeCodeMcpConfigs(): Promise<
  McpServerConfig[]
> {
  const configs: McpServerConfig[] = [];

  // 1. 项目级 .mcp.json
  const projectConfig = await loadJsonFile(
    '.mcp.json'
  );
  if (projectConfig?.mcpServers) {
    for (const [name, cfg] of
      Object.entries(projectConfig.mcpServers)
    ) {
      configs.push(parseMcpConfig({ name, ...cfg }));
    }
  }

  // 2. 用户全局配置
  const userConfig = await loadUserMcpConfig();
  configs.push(...userConfig);

  // 3. 企业管理员配置
  const enterpriseConfig = await loadEnterpriseMcpConfig();
  configs.push(...enterpriseConfig);

  // 4. 策略过滤
  return filterMcpServersByPolicy(configs);
}

// filterMcpServersByPolicy: 企业策略过滤
function filterMcpServersByPolicy(
  configs: McpServerConfig[]
): McpServerConfig[] {
  const policy = getOrganizationPolicy();
  if (!policy?.mcpAllowlist) return configs;

  return configs.filter(c =>
    policy.mcpAllowlist.includes(c.name) ||
    policy.mcpAllowlist.includes('*')
  );
}`
    },
    {
      title: 'OAuth 认证与自定义错误处理',
      language: 'typescript',
      code: `// OAuth 认证流程
async function handleMcpAuth(
  serverConfig: McpServerConfig
): Promise<string> {
  if (serverConfig.authType !== 'oauth') {
    return '';
  }

  // 检查缓存的 token
  const cached = await getTokenCache(serverConfig.name);
  if (cached && !isTokenExpired(cached)) {
    return cached.accessToken;
  }

  // 发起 OAuth 流程
  const authUrl = buildAuthUrl({
    clientId: serverConfig.oauth?.clientId,
    redirectUri: 'http://localhost:' + getRandomPort(),
    scope: serverConfig.oauth?.scope || 'read'
  });

  // 启动本地服务器接收回调
  const code = await waitForAuthCallback(authUrl);

  // 交换 access token
  const token = await exchangeCodeForToken(
    code, serverConfig
  );
  await setTokenCache(serverConfig.name, token);
  return token.accessToken;
}

// 自定义错误层次结构
class McpAuthError extends Error {
  constructor(serverName: string, detail: string) {
    super('MCP Auth Error [' + serverName + ']: ' + detail);
    this.name = 'McpAuthError';
  }
}

class McpSessionExpiredError extends Error {
  constructor(serverName: string) {
    super('MCP session expired: ' + serverName);
    this.name = 'McpSessionExpiredError';
  }
}

class McpToolCallError extends Error {
  public readonly toolName: string;
  public readonly retryable: boolean;

  constructor(
    toolName: string,
    message: string,
    retryable: boolean = false
  ) {
    super('MCP tool call failed [' + toolName + ']: '
      + message);
    this.name = 'McpToolCallError';
    this.toolName = toolName;
    this.retryable = retryable;
  }
}`
    }
  ],
  interactive: `
    <h3>MCP 连接交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 配置发现与聚合</h4>
        <p>系统启动时，<code>getClaudeCodeMcpConfigs()</code> 从四个来源收集 MCP 配置：项目 <code>.mcp.json</code>、用户全局配置、企业配置和 Skill 定义。所有配置经过去重和策略过滤后合并。</p>
        <div class="code-highlight">
          <pre>// .mcp.json 示例
{
  "mcpServers": {
    "github": {
      "transport": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    }
  }
}</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 传输协议选择与连接</h4>
        <p><code>connectToServer()</code> 根据配置中的 transport 字段选择对应的传输实现。Stdio 模式会启动一个子进程；SSE 模式会建立 HTTP 长连接；WebSocket 模式会建立全双工连接。</p>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 工具发现与注册</h4>
        <p><code>fetchToolsForClient()</code> 调用 MCP 服务器的 <code>tools/list</code> 方法获取工具定义，然后将每个 MCP 工具转换为 Claude Code 的 Tool 接口。工具名称会加上服务器名前缀避免冲突。</p>
        <div class="code-highlight">
          <pre>// MCP 工具名转换
"read_file" &#x2192; "github:read_file"
"search"    &#x2192; "github:search"</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: 认证与错误恢复</h4>
        <p>如果 MCP 服务器需要 OAuth 认证，系统会自动启动认证流程。连接断开时，MCPConnectionManager 会根据错误类型决定是重试连接还是提示用户重新授权。</p>
      </div>
    </div>
  `
}
