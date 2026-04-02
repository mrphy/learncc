import type { ChapterData } from '../chapters'

export const c20: ChapterData = {
  content: `
    <h2>20.1 Bridge 系统概览</h2>
    <p>Claude Code 的 <strong>bridge/</strong> 目录包含 <strong>30 个文件</strong>，实现了与 IDE（如 VS Code、JetBrains）的双向通信系统。Bridge 让 Claude Code 可以作为 IDE 的后端引擎运行，IDE 作为前端提供可视化界面。</p>
    <ul>
      <li><strong>bridgeMain.ts</strong> — Bridge 主循环，管理连接建立、心跳检测和消息路由。启动后持续监听来自 IDE 的请求</li>
      <li><strong>replBridge.ts</strong> — REPL 会话桥接，将终端 REPL 的输入输出转发到 IDE 的聊天面板</li>
      <li><strong>bridgeMessaging.ts</strong> — 基于 JSON 的消息协议，定义了请求/响应/通知三种消息类型。支持消息序列化、反序列化和超时控制</li>
      <li><strong>bridgePermissionCallbacks.ts</strong> — 权限委托机制，将文件写入、命令执行等权限确认请求转发给 IDE 端显示对话框，用户在 IDE 中确认后回传结果</li>
    </ul>

    <h2>20.2 认证与安全</h2>
    <p>Bridge 通信使用多层安全机制：</p>
    <ul>
      <li><strong>jwtUtils.ts</strong> — JWT 令牌工具，用于 Bridge 连接的身份验证。生成短期令牌、验证签名和过期时间</li>
      <li><strong>trustedDevice.ts</strong> — 设备信任管理，记录和验证已授权的设备指纹。首次连接需要用户确认信任</li>
      <li><strong>workSecret.ts</strong> — 工作区密钥，为每个项目生成唯一的通信密钥，防止跨项目的未授权访问</li>
    </ul>

    <h2>20.3 远程会话管理</h2>
    <p><strong>remote/</strong> 目录管理远程 Claude Code 会话：</p>
    <ul>
      <li><strong>RemoteSessionManager.ts</strong> — 远程会话管理器，负责创建、恢复和销毁远程会话。支持断线重连和状态同步</li>
      <li><strong>SessionsWebSocket.ts</strong> — WebSocket 连接管理，在本地客户端和远程 Claude Code 实例之间建立实时双向通道</li>
    </ul>
    <p>远程模式允许 Claude Code 在云端服务器运行（更强的计算资源），本地客户端仅负责 UI 渲染和用户交互。</p>

    <h2>20.4 Teleport — 环境迁移</h2>
    <p><strong>utils/teleport/</strong>（4 个文件）实现环境迁移功能，将本地开发环境"传送"到远程：</p>
    <ul>
      <li><strong>gitBundle</strong> — 将 Git 仓库打包为 bundle 文件，包含所有未推送的提交和未暂存的更改</li>
      <li><strong>environments</strong> — 环境快照管理，记录环境变量、工具版本和配置状态</li>
      <li><strong>environmentSelection</strong> — 环境选择器，让用户选择要迁移的环境配置子集</li>
    </ul>

    <h2>20.5 Computer Use — 计算机操控</h2>
    <p><strong>utils/computerUse/</strong>（15 个文件）实现了 AI 直接操控计算机的能力：</p>
    <ul>
      <li><strong>屏幕控制</strong> — 截图、OCR 文字识别、界面元素定位</li>
      <li><strong>应用检测</strong> — 识别当前活动应用程序和窗口状态</li>
      <li><strong>输入处理</strong> — 模拟键盘输入、鼠标点击和拖拽操作</li>
      <li><strong>MCP 服务器</strong> — 将 Computer Use 能力暴露为 MCP 工具，其他代理也可调用</li>
    </ul>

    <h2>20.6 CLI 传输层</h2>
    <p>CLI 的通信通过 <strong>handlers/</strong>（6 个文件）和 <strong>transports/</strong>（7 个文件）实现：</p>
    <ul>
      <li><strong>handlers</strong> — 请求处理器，分别处理 REPL、Bridge、Agent、远程等不同模式的消息</li>
      <li><strong>transports</strong> — 传输层抽象，支持标准输入输出（stdio）、WebSocket、HTTP SSE 等多种传输协议</li>
    </ul>

    <h2>20.7 Deep Link 处理</h2>
    <p><strong>utils/deepLink/</strong> 处理 <code>claude://</code> 协议的深度链接。用户可以通过浏览器中的链接直接打开 Claude Code 并自动执行特定操作（如打开项目、恢复会话、执行命令）。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>Bridge / IDE / 远程集成架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">IDE / 客户端层</h4>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <div style="background: #16213e; padding: 12px 18px; border-radius: 8px; border: 2px solid #e94560;">
              <div style="font-weight: bold;">VS Code 扩展</div>
              <div style="font-size: 11px; color: #aaa;">Bridge Client</div>
            </div>
            <div style="background: #16213e; padding: 12px 18px; border-radius: 8px; border: 1px solid #e94560;">
              <div style="font-weight: bold;">JetBrains 插件</div>
              <div style="font-size: 11px; color: #aaa;">Bridge Client</div>
            </div>
            <div style="background: #16213e; padding: 12px 18px; border-radius: 8px; border: 1px solid #e94560;">
              <div style="font-weight: bold;">终端 REPL</div>
              <div style="font-size: 11px; color: #aaa;">本地直连</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193; JSON 消息协议 &#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">Bridge 通信层 (bridge/)</h4>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">
              <div style="font-weight: bold;">bridgeMain</div>
              <div style="font-size: 10px; color: #aaa;">主循环</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">
              <div style="font-weight: bold;">replBridge</div>
              <div style="font-size: 10px; color: #aaa;">REPL 桥接</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">
              <div style="font-weight: bold;">messaging</div>
              <div style="font-size: 10px; color: #aaa;">消息协议</div>
            </div>
            <div style="background: #16213e; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #0f3460; font-size: 12px;">
              <div style="font-weight: bold;">permissions</div>
              <div style="font-size: 10px; color: #aaa;">权限委托</div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px;">
            <div style="background: #0d1b2a; padding: 6px 14px; border-radius: 16px; border: 1px solid #e94560; font-size: 11px;">JWT 认证</div>
            <div style="background: #0d1b2a; padding: 6px 14px; border-radius: 16px; border: 1px solid #e94560; font-size: 11px;">设备信任</div>
            <div style="background: #0d1b2a; padding: 6px 14px; border-radius: 16px; border: 1px solid #e94560; font-size: 11px;">工作区密钥</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">远程 &amp; 传输</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div style="background: #2d1b4e; padding: 12px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">remote/</div>
              <div style="font-size: 11px; color: #aaa;">SessionManager</div>
              <div style="font-size: 11px; color: #aaa;">WebSocket</div>
            </div>
            <div style="background: #2d1b4e; padding: 12px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">transports/</div>
              <div style="font-size: 11px; color: #aaa;">stdio / WS / SSE</div>
              <div style="font-size: 11px; color: #aaa;">7 个适配器</div>
            </div>
            <div style="background: #2d1b4e; padding: 12px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">handlers/</div>
              <div style="font-size: 11px; color: #aaa;">6 种请求处理器</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">扩展能力</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #48c9b0; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">Teleport</div>
              <div style="font-size: 11px; color: #aaa;">环境迁移 (4 files)</div>
              <div style="font-size: 11px; color: #aaa;">gitBundle / 环境快照</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #48c9b0; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">Computer Use</div>
              <div style="font-size: 11px; color: #aaa;">屏幕操控 (15 files)</div>
              <div style="font-size: 11px; color: #aaa;">截图 / 输入 / OCR</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #48c9b0; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">Deep Link</div>
              <div style="font-size: 11px; color: #aaa;">claude:// 协议</div>
              <div style="font-size: 11px; color: #aaa;">项目/会话直达</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'Bridge 消息协议与主循环',
      language: 'typescript',
      code: `// bridgeMessaging.ts: JSON 消息协议
type BridgeMessage =
  | BridgeRequest
  | BridgeResponse
  | BridgeNotification;

interface BridgeRequest {
  type: "request";
  id: string;
  method: string;
  params: Record<string, unknown>;
}

interface BridgeResponse {
  type: "response";
  id: string;           // 对应 request.id
  result?: unknown;
  error?: { code: number; message: string };
}

interface BridgeNotification {
  type: "notification";
  method: string;
  params: Record<string, unknown>;
}

// bridgeMain.ts: Bridge 主循环
class BridgeMain {
  private transport: BridgeTransport;
  private handlers = new Map<
    string,
    (params: Record<string, unknown>) => Promise<unknown>
  >();

  async start(port: number): Promise<void> {
    this.transport = await createTransport(port);

    // 注册内置处理器
    this.handlers.set(
      "chat/send", this.handleChatSend.bind(this)
    );
    this.handlers.set(
      "file/read", this.handleFileRead.bind(this)
    );
    this.handlers.set(
      "permission/request",
      this.handlePermission.bind(this)
    );

    // 主消息循环
    while (true) {
      const msg = await this.transport.receive();
      if (msg.type === "request") {
        this.handleRequest(msg);
      }
    }
  }

  private async handleRequest(
    req: BridgeRequest
  ): Promise<void> {
    const handler = this.handlers.get(req.method);
    if (!handler) {
      this.transport.send({
        type: "response",
        id: req.id,
        error: { code: -1, message: "Unknown method" }
      });
      return;
    }

    try {
      const result = await handler(req.params);
      this.transport.send({
        type: "response",
        id: req.id,
        result
      });
    } catch (err) {
      this.transport.send({
        type: "response",
        id: req.id,
        error: {
          code: -1,
          message: String(err)
        }
      });
    }
  }

  // 向 IDE 发送通知（无需响应）
  notify(method: string, params: Record<string, unknown>): void {
    this.transport.send({
      type: "notification",
      method,
      params
    });
  }
}`
    },
    {
      title: '认证与 Teleport 环境迁移',
      language: 'typescript',
      code: `// jwtUtils.ts: JWT 认证工具
interface JwtPayload {
  sub: string;          // 用户 ID
  deviceId: string;     // 设备指纹
  workspaceId: string;  // 工作区 ID
  exp: number;          // 过期时间
  iat: number;          // 签发时间
}

function createJwt(
  payload: JwtPayload,
  secret: string
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = hmacSHA256(
    headerB64 + "." + payloadB64,
    secret
  );
  return headerB64 + "." + payloadB64 + "." + signature;
}

// trustedDevice.ts: 设备信任
class TrustedDeviceManager {
  private trustedDevices: Set<string>;

  isTrusted(deviceId: string): boolean {
    return this.trustedDevices.has(deviceId);
  }

  async trustDevice(deviceId: string): Promise<void> {
    this.trustedDevices.add(deviceId);
    await this.persistToFile();
  }
}

// workSecret.ts: 工作区密钥
function getWorkSecret(
  workspacePath: string
): string {
  const secretPath = join(
    workspacePath, ".claude", "work_secret"
  );
  if (existsSync(secretPath)) {
    return readFileSync(secretPath, "utf-8");
  }
  // 首次使用，生成新密钥
  const secret = randomBytes(32).toString("hex");
  writeFileSync(secretPath, secret);
  return secret;
}

// utils/teleport/gitBundle.ts: Git 仓库打包
async function createGitBundle(
  repoPath: string
): Promise<Buffer> {
  // 1. 收集未推送的提交
  const unpushed = await execGit(
    repoPath, "log", "--oneline", "@{u}..HEAD"
  );

  // 2. 收集未暂存的更改
  const stashResult = await execGit(
    repoPath, "stash", "create"
  );

  // 3. 创建 bundle
  const bundle = await execGit(
    repoPath, "bundle", "create", "-",
    "--all", "--not", "--remotes"
  );

  return bundle;
}

// utils/teleport/environments.ts: 环境快照
interface EnvironmentSnapshot {
  nodeVersion: string;
  pythonVersion: string;
  envVars: Record<string, string>;
  gitConfig: Record<string, string>;
  installedTools: string[];
  timestamp: number;
}

async function captureEnvironment(): Promise<EnvironmentSnapshot> {
  return {
    nodeVersion: process.version,
    pythonVersion: await getCommandOutput("python3 --version"),
    envVars: filterSafeEnvVars(process.env),
    gitConfig: await getGitConfig(),
    installedTools: await detectInstalledTools(),
    timestamp: Date.now()
  };
}`
    },
    {
      title: 'Computer Use 与远程会话',
      language: 'typescript',
      code: `// utils/computerUse: AI 计算机操控
interface ScreenCapture {
  width: number;
  height: number;
  data: Buffer;         // PNG 图像数据
  timestamp: number;
}

interface ClickAction {
  type: "click";
  x: number;
  y: number;
  button: "left" | "right" | "middle";
}

interface TypeAction {
  type: "type";
  text: string;
  modifiers?: string[];
}

type ComputerAction =
  | ClickAction
  | TypeAction
  | { type: "screenshot" }
  | { type: "scroll"; x: number; y: number; delta: number };

// Computer Use MCP 服务器
class ComputerUseMcpServer {
  getTools(): ToolDefinition[] {
    return [
      {
        name: "computer_screenshot",
        description: "截取当前屏幕截图",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "computer_click",
        description: "在指定坐标点击",
        inputSchema: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" },
            button: { type: "string" }
          }
        }
      },
      {
        name: "computer_type",
        description: "输入文本内容",
        inputSchema: {
          type: "object",
          properties: {
            text: { type: "string" }
          }
        }
      }
    ];
  }

  async handleTool(
    name: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (name) {
      case "computer_screenshot":
        return await captureScreen();
      case "computer_click":
        return await performClick(
          params.x as number,
          params.y as number,
          (params.button as string) || "left"
        );
      case "computer_type":
        return await typeText(params.text as string);
      default:
        throw new Error("Unknown tool: " + name);
    }
  }
}

// remote/RemoteSessionManager.ts: 远程会话管理
class RemoteSessionManager {
  private sessions = new Map<string, RemoteSession>();

  async createSession(
    config: RemoteConfig
  ): Promise<RemoteSession> {
    // 1. 建立 WebSocket 连接
    const ws = new SessionsWebSocket(config.endpoint);
    await ws.connect();

    // 2. JWT 认证
    const token = createJwt({
      sub: config.userId,
      deviceId: config.deviceId,
      workspaceId: config.workspaceId,
      exp: Date.now() + 3600_000,
      iat: Date.now()
    }, config.secret);
    await ws.authenticate(token);

    // 3. 可选: Teleport 环境
    if (config.teleport) {
      const bundle = await createGitBundle(config.repoPath);
      const env = await captureEnvironment();
      await ws.send("teleport", { bundle, env });
    }

    const session: RemoteSession = {
      id: generateSessionId(),
      ws,
      status: "connected",
      createdAt: Date.now()
    };

    this.sessions.set(session.id, session);
    return session;
  }

  // 断线重连
  async reconnect(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");

    await session.ws.reconnect();
    session.status = "connected";
  }
}`
    }
  ],
  interactive: `
    <h3>Bridge 与远程集成交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: IDE 建立 Bridge 连接</h4>
        <p>VS Code 扩展启动时，通过本地端口与 Claude Code 进程建立 Bridge 连接。首次连接需要设备信任确认和 JWT 认证。</p>
        <div class="code-highlight">
          <pre>VS Code 扩展启动:
  1. 发现本地 Claude Code 进程 (port: 7463)
  2. 生成设备指纹: "device_abc123"
  3. 首次连接: 弹出信任确认对话框
  4. 用户确认 &#x2192; trustedDevice.trustDevice()
  5. 创建 JWT: { sub: "user", deviceId: "device_abc123" }
  6. Bridge 连接建立 &#x2714;</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: 消息双向通信</h4>
        <p>IDE 通过 Bridge 发送用户消息，Claude Code 处理后通过通知推送结果。权限确认请求被转发到 IDE 显示对话框。</p>
        <div class="code-highlight">
          <pre>IDE &#x2192; Bridge: {
  type: "request", id: "r1",
  method: "chat/send",
  params: { message: "重构 auth 模块" }
}

Bridge &#x2192; IDE: {
  type: "notification",
  method: "chat/streaming",
  params: { content: "我来分析..." }
}

Bridge &#x2192; IDE: {
  type: "request", id: "p1",
  method: "permission/request",
  params: { action: "write", path: "src/auth.ts" }
}
IDE &#x2192; Bridge: { type: "response", id: "p1", result: true }</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: Teleport 环境迁移</h4>
        <p>用户需要将本地项目迁移到远程强力服务器上运行 Claude Code。Teleport 打包 Git 仓库和环境快照，通过 WebSocket 传送到远程实例。</p>
        <div class="code-highlight">
          <pre>Teleport 流程:
  1. gitBundle: 打包未推送提交 + 未暂存更改 (2.3MB)
  2. 环境快照: Node 20.x, Python 3.11, 12 个工具
  3. WebSocket 传输 &#x2192; 远程服务器
  4. 远程恢复: git unbundle + 环境变量设置
  5. 远程 Claude Code 就绪 &#x2714;
  6. 本地 &#x2192; 远程无缝切换</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: Computer Use 操控</h4>
        <p>Claude Code 通过 Computer Use MCP 服务器直接操控桌面应用。截图识别界面元素，模拟点击和输入完成自动化任务。</p>
        <div class="code-highlight">
          <pre>Computer Use 操作序列:
  1. computer_screenshot &#x2192; 截取桌面 (1920x1080)
  2. AI 分析: 识别到 "Submit" 按钮 at (450, 320)
  3. computer_click(450, 320, "left") &#x2192; 点击按钮
  4. 等待页面加载...
  5. computer_screenshot &#x2192; 验证操作结果
  6. computer_type("测试数据") &#x2192; 填写表单
  7. AI 确认: 任务完成 &#x2714;</pre>
        </div>
      </div>
    </div>
  `
}
