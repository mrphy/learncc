import type { ChapterData } from '../chapters'

export const c18: ChapterData = {
  content: `
    <h2>18.1 AppState 全局状态类型</h2>
    <p>Claude Code 的状态管理核心是 <strong>state/</strong> 目录中定义的 <strong>AppState</strong> 类型。这是一个包含 <strong>300+ 个字段</strong>的巨型状态对象，按功能域组织为多个区块：</p>
    <ul>
      <li><strong>Core</strong> — 核心状态：conversationId, messages, model, currentTool, isLoading, error 等基础运行状态</li>
      <li><strong>Permissions</strong> — 权限状态：grantedPermissions, deniedPermissions, permissionMode, autoApprovePatterns</li>
      <li><strong>MCP</strong> — MCP 连接状态：mcpClients, mcpTools, mcpResources, mcpConnectionStatus</li>
      <li><strong>Plugins</strong> — 插件状态：installedPlugins, pluginConfigs, pluginErrors</li>
      <li><strong>Tasks</strong> — 任务状态：taskList, activeTask, taskDependencies</li>
      <li><strong>Agents</strong> — 代理状态：activeAgents, coordinatorState, swarmBackend</li>
      <li><strong>Speculation</strong> — 推测执行状态：speculationState, specBoundary, writtenPaths</li>
      <li><strong>Remote</strong> — 远程连接状态：remoteSession, bridgeStatus, jwtToken</li>
      <li><strong>Kairos</strong> — Kairos 集成状态：kairosEnabled, kairosSession</li>
      <li><strong>Computer Use</strong> — 计算机操控状态：screenState, appDetection, inputMode</li>
    </ul>

    <h2>18.2 DeepImmutable 不可变包装</h2>
    <p>AppState 通过 <strong>DeepImmutable&lt;T&gt;</strong> 类型包装器在类型层面强制不可变性。这是一个递归的 TypeScript 工具类型，将所有属性、嵌套对象和数组都标记为 readonly：</p>
    <ul>
      <li>防止直接修改状态字段（编译时报错）</li>
      <li>强制所有状态更新通过 setAppState 函数进行</li>
      <li>数组变为 ReadonlyArray，Map 变为 ReadonlyMap</li>
    </ul>

    <h2>18.3 Store 模式</h2>
    <p><strong>createStore&lt;T&gt;</strong> 提供了一个极简的 Store 实现，是整个状态管理系统的基础原语：</p>
    <ul>
      <li><strong>get()</strong> — 获取当前状态快照</li>
      <li><strong>set(updater)</strong> — 通过更新函数设置新状态。接受 <code>(prev: T) =&gt; T</code> 或直接值</li>
      <li><strong>subscribe(listener)</strong> — 订阅状态变更，返回取消订阅函数</li>
    </ul>
    <p><strong>AppStateStore.ts</strong> 基于 createStore 创建了全局唯一的应用状态存储实例。</p>

    <h2>18.4 状态变更副作用</h2>
    <p><strong>onChangeAppState.ts</strong> 注册了一组状态变更监听器，当特定字段变化时触发副作用：</p>
    <ul>
      <li>当 model 变更时，重新计算 token 限制和工具可用性</li>
      <li>当 permissions 变更时，更新工具的权限检查缓存</li>
      <li>当 mcpClients 变更时，重新注册 MCP 工具</li>
      <li>当 speculationState 变更时，触发推测执行的启动或中止</li>
    </ul>

    <h2>18.5 SpeculationState 推测执行状态</h2>
    <p>推测执行使用专门的状态结构追踪其生命周期：</p>
    <ul>
      <li><strong>idle</strong> — 空闲状态，等待触发条件</li>
      <li><strong>active</strong> — 活跃状态，包含 abort() 中止函数、startTime 启动时间、messagesRef 消息引用、writtenPathsRef 已写入路径集合、boundary 推测边界</li>
    </ul>

    <h2>18.6 bootstrap/state.ts 与 selectors</h2>
    <p><strong>bootstrap/state.ts</strong> 提供全局单例状态，不依赖 React 上下文。这使得非 UI 代码（如工具执行、MCP 处理）也能访问应用状态。</p>
    <p><strong>selectors.ts</strong> 提供派生状态计算，将原始状态转换为业务视图。<strong>teammateViewHelpers.ts</strong> 则为队友显示提供专门的视图状态转换。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>状态管理架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">AppState — 300+ 字段的全局状态</h4>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px;">
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #e94560; font-size: 11px;">
              <div style="font-weight: bold;">Core</div>
              <div style="color: #aaa;">会话/模型</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #e94560; font-size: 11px;">
              <div style="font-weight: bold;">Permissions</div>
              <div style="color: #aaa;">权限控制</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #e94560; font-size: 11px;">
              <div style="font-weight: bold;">MCP</div>
              <div style="color: #aaa;">连接/工具</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #e94560; font-size: 11px;">
              <div style="font-weight: bold;">Tasks</div>
              <div style="color: #aaa;">任务列表</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #e94560; font-size: 11px;">
              <div style="font-weight: bold;">Agents</div>
              <div style="color: #aaa;">代理状态</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 6px;">
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #533483; font-size: 11px;">
              <div style="font-weight: bold;">Speculation</div>
              <div style="color: #aaa;">推测执行</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #533483; font-size: 11px;">
              <div style="font-weight: bold;">Remote</div>
              <div style="color: #aaa;">远程连接</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #533483; font-size: 11px;">
              <div style="font-weight: bold;">Plugins</div>
              <div style="color: #aaa;">插件配置</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #533483; font-size: 11px;">
              <div style="font-weight: bold;">Kairos</div>
              <div style="color: #aaa;">集成状态</div>
            </div>
            <div style="background: #16213e; padding: 8px; border-radius: 6px; text-align: center; border: 1px solid #533483; font-size: 11px;">
              <div style="font-weight: bold;">ComputerUse</div>
              <div style="color: #aaa;">屏幕操控</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">Store 模式</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
            <div style="background: #16213e; padding: 14px; border-radius: 8px; border: 1px solid #0f3460; text-align: center;">
              <div style="font-weight: bold;">createStore&lt;T&gt;</div>
              <div style="font-size: 11px; color: #aaa;">get / set / subscribe</div>
            </div>
            <div style="background: #16213e; padding: 14px; border-radius: 8px; border: 2px solid #0f3460; text-align: center;">
              <div style="font-weight: bold;">AppStateStore</div>
              <div style="font-size: 11px; color: #aaa;">全局单例</div>
            </div>
            <div style="background: #16213e; padding: 14px; border-radius: 8px; border: 1px solid #0f3460; text-align: center;">
              <div style="font-weight: bold;">DeepImmutable</div>
              <div style="font-size: 11px; color: #aaa;">类型级不可变</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #48c9b0;">副作用 &amp; 派生</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #48c9b0;">
              <div style="font-weight: bold; font-size: 13px;">onChangeAppState</div>
              <div style="font-size: 11px; color: #aaa;">model &#x2192; token 重算</div>
              <div style="font-size: 11px; color: #aaa;">permissions &#x2192; 缓存更新</div>
              <div style="font-size: 11px; color: #aaa;">mcp &#x2192; 工具重注册</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #48c9b0;">
              <div style="font-weight: bold; font-size: 13px;">selectors.ts</div>
              <div style="font-size: 11px; color: #aaa;">派生状态计算</div>
              <div style="font-size: 11px; color: #aaa;">teammateViewHelpers</div>
              <div style="font-size: 11px; color: #aaa;">bootstrap/state.ts</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #48c9b0;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #f0c040;">SpeculationState</h4>
          <div style="display: flex; justify-content: center; gap: 12px; align-items: center;">
            <div style="background: #3a3000; padding: 10px 20px; border-radius: 20px; border: 1px solid #f0c040;">idle</div>
            <div style="color: #f0c040; font-size: 20px;">&#x21C4;</div>
            <div style="background: #3a3000; padding: 10px 20px; border-radius: 20px; border: 2px solid #f0c040;">
              <div>active</div>
              <div style="font-size: 10px; color: #ddd;">abort | startTime | boundary</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'createStore 与 AppState 定义',
      language: 'typescript',
      code: `// DeepImmutable: 递归不可变类型包装
type DeepImmutable<T> =
  T extends Map<infer K, infer V>
    ? ReadonlyMap<DeepImmutable<K>, DeepImmutable<V>>
  : T extends Set<infer S>
    ? ReadonlySet<DeepImmutable<S>>
  : T extends Array<infer E>
    ? ReadonlyArray<DeepImmutable<E>>
  : T extends object
    ? { readonly [K in keyof T]: DeepImmutable<T[K]> }
  : T;

// createStore: 极简 Store 原语
interface Store<T> {
  get(): DeepImmutable<T>;
  set(updater: T | ((prev: T) => T)): void;
  subscribe(listener: (state: DeepImmutable<T>) => void): () => void;
}

function createStore<T>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<
    (state: DeepImmutable<T>) => void
  >();

  return {
    get() {
      return state as DeepImmutable<T>;
    },
    set(updater) {
      const next = typeof updater === "function"
        ? (updater as (prev: T) => T)(state)
        : updater;
      if (next !== state) {
        state = next;
        const immutable = state as DeepImmutable<T>;
        for (const listener of listeners) {
          listener(immutable);
        }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

// AppStateStore.ts: 全局状态存储
const appStateStore = createStore<AppState>(
  initialAppState
);

// 导出便捷函数
function getAppState(): DeepImmutable<AppState> {
  return appStateStore.get();
}

function setAppState(
  updater: (prev: AppState) => AppState
): void {
  appStateStore.set(updater);
}`
    },
    {
      title: 'AppState 类型定义（精简版）',
      language: 'typescript',
      code: `// AppState: 300+ 字段的全局状态类型（精简展示）
interface AppState {
  // === Core 核心 ===
  conversationId: string;
  messages: Message[];
  model: ModelName;
  currentTool: string | null;
  isLoading: boolean;
  error: string | null;
  apiKey: string;
  tokenUsage: TokenUsage;

  // === Permissions 权限 ===
  grantedPermissions: Map<string, Permission>;
  deniedPermissions: Set<string>;
  permissionMode: "default" | "auto" | "manual";
  autoApprovePatterns: string[];

  // === MCP ===
  mcpClients: Map<string, McpClient>;
  mcpTools: ToolDefinition[];
  mcpResources: Resource[];
  mcpConnectionStatus: Map<string, ConnectionStatus>;

  // === Tasks 任务 ===
  taskList: Task[];
  activeTask: Task | null;

  // === Agents 代理 ===
  activeAgents: Agent[];
  coordinatorState: CoordinatorState | null;
  swarmBackend: "iterm" | "tmux" | "in-process";

  // === Speculation 推测执行 ===
  speculationState: SpeculationState;

  // === Remote 远程 ===
  remoteSession: RemoteSession | null;
  bridgeStatus: BridgeStatus;
  jwtToken: string | null;

  // ... 更多字段 (Kairos, ComputerUse, Plugins 等)
}

// SpeculationState: 推测执行的精确状态
type SpeculationState =
  | { status: "idle" }
  | {
      status: "active";
      abort: () => void;
      startTime: number;
      messagesRef: { current: Message[] };
      writtenPathsRef: { current: Set<string> };
      boundary: SpeculationBoundary;
    };`
    },
    {
      title: 'onChangeAppState 副作用注册',
      language: 'typescript',
      code: `// onChangeAppState.ts: 状态变更副作用
function registerStateEffects(
  store: Store<AppState>
): void {
  let prevState = store.get();

  store.subscribe((nextState) => {
    // model 变更 -> 重算 token 限制
    if (nextState.model !== prevState.model) {
      const limits = getModelLimits(nextState.model);
      store.set(prev => ({
        ...prev,
        tokenUsage: {
          ...prev.tokenUsage,
          maxTokens: limits.maxOutputTokens,
          contextWindow: limits.contextWindow
        }
      }));
    }

    // permissions 变更 -> 清除权限缓存
    if (
      nextState.grantedPermissions
        !== prevState.grantedPermissions
    ) {
      clearPermissionCache();
      rebuildToolPermissions(
        nextState.grantedPermissions
      );
    }

    // mcpClients 变更 -> 重新注册工具
    if (
      nextState.mcpClients !== prevState.mcpClients
    ) {
      const newTools = collectMcpTools(
        nextState.mcpClients
      );
      store.set(prev => ({
        ...prev,
        mcpTools: newTools
      }));
    }

    // speculationState 变更 -> 执行控制
    if (
      nextState.speculationState
        !== prevState.speculationState
    ) {
      if (nextState.speculationState.status === "active") {
        console.log(
          "推测执行启动 at "
          + nextState.speculationState.startTime
        );
      }
    }

    prevState = nextState;
  });
}

// selectors.ts: 派生状态
function selectAvailableTools(
  state: DeepImmutable<AppState>
): ToolDefinition[] {
  const builtinTools = getBuiltinTools();
  const mcpTools = state.mcpTools;
  const pluginTools = state.installedPlugins
    .flatMap(p => p.tools || []);

  return [...builtinTools, ...mcpTools, ...pluginTools]
    .filter(
      t => isToolPermitted(t, state.grantedPermissions)
    );
}

// bootstrap/state.ts: 全局单例（非 React）
let globalState: AppState | null = null;

function getGlobalState(): AppState {
  if (!globalState) {
    throw new Error("State not initialized");
  }
  return globalState;
}

function initGlobalState(state: AppState): void {
  globalState = state;
}`
    }
  ],
  interactive: `
    <h3>状态管理交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: 理解 AppState 结构</h4>
        <p>AppState 是一个拥有 300+ 字段的巨型对象。通过 DeepImmutable 包装，所有字段在类型层面都是只读的。直接修改会导致 TypeScript 编译错误。</p>
        <div class="code-highlight">
          <pre>// 编译错误! DeepImmutable 阻止直接修改
const state = getAppState();
state.model = "claude-4";  // Error: readonly

// 正确方式: 通过 setAppState 更新
setAppState(prev => ({
  ...prev,
  model: "claude-4"
}));</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: Store 的 subscribe 机制</h4>
        <p>createStore 的 subscribe 方法允许注册监听器。当状态变更时，所有监听器同步执行。返回的函数用于取消订阅。</p>
        <div class="code-highlight">
          <pre>const unsub = appStateStore.subscribe(state => {
  console.log("Model:", state.model);
  console.log("Tools:", state.mcpTools.length);
});

// 触发状态变更
setAppState(prev => ({ ...prev, model: "claude-4" }));
// 输出: Model: claude-4, Tools: 42

// 取消订阅
unsub();</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: 副作用链式触发</h4>
        <p>状态变更会触发 onChangeAppState 中注册的副作用。例如切换模型会连锁触发 token 限制重算，这又会更新 UI 中的剩余 token 显示。</p>
        <div class="code-highlight">
          <pre>用户切换模型: claude-3.5 &#x2192; claude-4

onChangeAppState 检测 model 变更:
  1. 获取 claude-4 的 token 限制
  2. 更新 tokenUsage.maxTokens: 4096 &#x2192; 16384
  3. 更新 tokenUsage.contextWindow: 200k &#x2192; 1M
  4. UI 自动刷新显示新的限制值</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: SpeculationState 生命周期</h4>
        <p>推测执行的状态在 idle 和 active 之间切换。active 状态携带 abort 函数和路径追踪引用，用于在用户输入不匹配时中止推测。</p>
        <div class="code-highlight">
          <pre>推测执行状态流转:
  idle &#x2192; 检测到用户可能的下一步操作
  active {
    startTime: 1711900000,
    writtenPaths: {"src/api.ts", "src/types.ts"},
    boundary: { maxTokens: 2000 }
  }
  &#x2192; 用户确认 &#x2192; 提交推测结果
  &#x2192; 或用户否认 &#x2192; abort() &#x2192; 回滚 &#x2192; idle</pre>
        </div>
      </div>
    </div>
  `
}
