import type { ChapterData } from '../chapters'

export const c19: ChapterData = {
  content: `
    <h2>19.1 自定义 Ink 分支</h2>
    <p>Claude Code <strong>没有使用</strong> npm 上的 Ink 包，而是在 <strong>ink/</strong> 目录维护了一个包含 <strong>80+ 文件</strong>的自定义 Ink 分支。分叉的核心原因包括：</p>
    <ul>
      <li><strong>性能优化</strong> — 原版 Ink 在高频输出（如 streaming 回复）场景下存在闪烁和性能瓶颈。Claude Code 的渲染器实现了帧合并、差量更新和闪烁防护</li>
      <li><strong>鼠标与点击支持</strong> — 原版 Ink 不支持鼠标事件。自定义版本增加了鼠标点击、滚轮、焦点管理等完整的交互支持</li>
      <li><strong>虚拟滚动</strong> — 对长输出实现了虚拟滚动机制（useVirtualScroll），只渲染可见区域，大幅降低内存占用</li>
      <li><strong>Vim 模式集成</strong> — 内置完整的 Vim 键绑定系统，支持 motions、operators 和 text objects</li>
    </ul>

    <h2>19.2 React Reconciler 与终端 DOM</h2>
    <p>Claude Code 的终端 UI 基于 <strong>React Reconciler</strong> 构建，将 React 的组件模型映射到终端输出：</p>
    <ul>
      <li><strong>reconciler.ts</strong> — 自定义 React Reconciler，实现了 createInstance、appendChild、commitUpdate 等核心方法。将 React 元素树转换为终端 DOM 节点树</li>
      <li><strong>dom.ts</strong> — 终端 DOM 层，定义了 DOMElement 和 DOMText 节点类型。每个节点携带样式（颜色、边距、flex 属性等）和内容信息</li>
      <li><strong>renderer.ts</strong> — 渲染器，遍历 DOM 树生成 ANSI 转义序列输出。包含帧率控制和差量渲染优化</li>
    </ul>

    <h2>19.3 Flexbox 布局引擎</h2>
    <p><strong>layout/</strong> 目录通过 <strong>yoga-layout</strong> 绑定实现了终端中的 Flexbox 布局：</p>
    <ul>
      <li>支持 flexDirection、justifyContent、alignItems 等标准 Flexbox 属性</li>
      <li>支持 margin、padding、border 盒模型</li>
      <li>支持百分比和固定尺寸</li>
      <li>Yoga 引擎将布局计算映射到终端行列坐标系统</li>
    </ul>

    <h2>19.4 核心组件与 Hooks</h2>
    <p>自定义 Ink 提供了一组核心组件和 Hooks：</p>
    <ul>
      <li><strong>组件</strong>: Box（布局容器）、Text（文本渲染）、ScrollBox（可滚动容器）、Button（可点击按钮）、Link（超链接）、App（根应用容器）</li>
      <li><strong>Hooks</strong>: useInput（键盘输入处理）、useAnimationFrame（动画帧回调）、useSelection（选区管理）</li>
      <li><strong>事件系统</strong>: keyboard、mouse、click、focus、terminal resize 等事件</li>
    </ul>

    <h2>19.5 屏幕与快捷键</h2>
    <p><strong>screens/</strong> 定义了应用的主要界面：</p>
    <ul>
      <li><strong>REPL.tsx</strong> — 主交互界面，包含输入区、输出区、状态栏和工具栏</li>
      <li><strong>Doctor.tsx</strong> — 诊断界面，检查环境配置和依赖状态</li>
      <li><strong>ResumeConversation.tsx</strong> — 会话恢复界面</li>
    </ul>
    <p><strong>keybindings/</strong>（14 个文件）提供了完整的快捷键系统：parser 解析键序列、resolver 解析绑定冲突、schema 定义绑定格式、defaultBindings 提供默认配置。</p>

    <h2>19.6 Vim 模式与语音输入</h2>
    <p><strong>vim/</strong>（5 个文件）实现了终端中的 Vim 编辑模式：</p>
    <ul>
      <li><strong>motions</strong> — 光标移动：h/j/k/l、w/b/e、0/$</li>
      <li><strong>operators</strong> — 操作符：d(delete)、c(change)、y(yank)</li>
      <li><strong>textObjects</strong> — 文本对象：iw(inner word)、a"(around quotes)</li>
      <li><strong>transitions</strong> — 模式切换：Normal/Insert/Visual</li>
    </ul>
    <p><strong>语音输入</strong>通过 useVoice、useVoiceIntegration 和 voiceStreamSTT 实现实时语音转文字输入。</p>

    <h2>19.7 输出优化</h2>
    <p><strong>frame.ts</strong> 实现帧合并和闪烁防护，<strong>optimizer.ts</strong> 优化 ANSI 输出序列长度。两者配合确保即使在高频 streaming 场景下也能流畅显示。</p>
  `,
  architecture: `
    <div class="arch-diagram">
      <h3>终端 UI 框架架构图</h3>
      <div class="arch-flow">
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #e94560;">React 组件层</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 2px solid #e94560; text-align: center;">
              <div style="font-weight: bold;">REPL.tsx</div>
              <div style="font-size: 11px; color: #aaa;">主界面</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #e94560; text-align: center;">
              <div style="font-weight: bold;">Doctor.tsx</div>
              <div style="font-size: 11px; color: #aaa;">诊断界面</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #e94560; text-align: center;">
              <div style="font-weight: bold;">Resume.tsx</div>
              <div style="font-size: 11px; color: #aaa;">会话恢复</div>
            </div>
          </div>
          <div style="display: flex; justify-content: center; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
            <div style="background: #0d1b2a; padding: 6px 12px; border-radius: 16px; border: 1px solid #e94560; font-size: 12px;">Box</div>
            <div style="background: #0d1b2a; padding: 6px 12px; border-radius: 16px; border: 1px solid #e94560; font-size: 12px;">Text</div>
            <div style="background: #0d1b2a; padding: 6px 12px; border-radius: 16px; border: 1px solid #e94560; font-size: 12px;">ScrollBox</div>
            <div style="background: #0d1b2a; padding: 6px 12px; border-radius: 16px; border: 1px solid #e94560; font-size: 12px;">Button</div>
            <div style="background: #0d1b2a; padding: 6px 12px; border-radius: 16px; border: 1px solid #e94560; font-size: 12px;">Link</div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #e94560;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #0f3460;">React Reconciler + DOM</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">reconciler.ts</div>
              <div style="font-size: 11px; color: #aaa;">React &#x2192; Terminal DOM</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">dom.ts</div>
              <div style="font-size: 11px; color: #aaa;">DOMElement 树</div>
            </div>
            <div style="background: #16213e; padding: 12px; border-radius: 8px; border: 1px solid #0f3460; text-align: center;">
              <div style="font-weight: bold; font-size: 13px;">layout/ (yoga)</div>
              <div style="font-size: 11px; color: #aaa;">Flexbox 布局</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #0f3460;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <h4 style="color: #533483;">渲染 &amp; 输入</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #2d1b4e; padding: 14px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">renderer.ts</div>
              <div style="font-size: 11px; color: #aaa;">DOM &#x2192; ANSI 输出</div>
              <div style="font-size: 11px; color: #aaa;">frame.ts 帧合并</div>
              <div style="font-size: 11px; color: #aaa;">optimizer.ts 序列优化</div>
            </div>
            <div style="background: #2d1b4e; padding: 14px; border-radius: 8px; border: 1px solid #533483;">
              <div style="font-weight: bold; font-size: 13px;">输入系统</div>
              <div style="font-size: 11px; color: #aaa;">keybindings/ (14 files)</div>
              <div style="font-size: 11px; color: #aaa;">vim/ (5 files)</div>
              <div style="font-size: 11px; color: #aaa;">useVoice 语音输入</div>
            </div>
          </div>
        </div>
        <div style="text-align: center; font-size: 24px; color: #533483;">&#x2193;</div>
        <div class="arch-layer" style="background: #1a1a2e; padding: 20px; border-radius: 12px;">
          <h4 style="color: #48c9b0;">终端输出</h4>
          <div style="display: flex; justify-content: center; gap: 16px;">
            <div style="background: #16213e; padding: 12px 20px; border-radius: 8px; border: 1px solid #48c9b0;">
              <div style="font-weight: bold;">process.stdout</div>
              <div style="font-size: 11px; color: #aaa;">ANSI 转义序列</div>
            </div>
            <div style="background: #16213e; padding: 12px 20px; border-radius: 8px; border: 1px solid #48c9b0;">
              <div style="font-weight: bold;">process.stdin</div>
              <div style="font-size: 11px; color: #aaa;">按键/鼠标事件</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  codeExamples: [
    {
      title: 'React Reconciler 与终端 DOM',
      language: 'typescript',
      code: `// dom.ts: 终端 DOM 节点定义
interface DOMElement {
  nodeName: string;
  parentNode: DOMElement | null;
  childNodes: Array<DOMElement | DOMText>;
  style: DOMStyle;
  yogaNode: YogaNode | null;
  // 事件处理
  onClick?: (event: ClickEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface DOMText {
  nodeName: "#text";
  nodeValue: string;
  parentNode: DOMElement | null;
}

interface DOMStyle {
  color?: string;
  backgroundColor?: string;
  flexDirection?: "row" | "column";
  justifyContent?: "flex-start" | "center" | "flex-end";
  alignItems?: "flex-start" | "center" | "flex-end";
  width?: number | string;
  height?: number | string;
  marginTop?: number;
  marginBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderStyle?: "single" | "double" | "round";
}

// reconciler.ts: React Reconciler 实现
const reconciler = ReactReconciler({
  supportsMutation: true,

  createInstance(
    type: string,
    props: Record<string, unknown>
  ): DOMElement {
    const node: DOMElement = {
      nodeName: type,
      parentNode: null,
      childNodes: [],
      style: extractStyle(props),
      yogaNode: Yoga.Node.create()
    };
    applyYogaStyle(node.yogaNode, node.style);
    return node;
  },

  createTextInstance(text: string): DOMText {
    return {
      nodeName: "#text",
      nodeValue: text,
      parentNode: null
    };
  },

  appendChild(parent: DOMElement, child: DOMElement | DOMText) {
    child.parentNode = parent;
    parent.childNodes.push(child);
    if ("yogaNode" in child && child.yogaNode) {
      parent.yogaNode?.insertChild(
        child.yogaNode,
        parent.yogaNode.getChildCount()
      );
    }
  },

  commitUpdate(
    node: DOMElement,
    _oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ) {
    node.style = extractStyle(newProps);
    if (node.yogaNode) {
      applyYogaStyle(node.yogaNode, node.style);
    }
  }
});`
    },
    {
      title: '渲染器与帧优化',
      language: 'typescript',
      code: `// renderer.ts: DOM 树 -> ANSI 输出
class TerminalRenderer {
  private lastOutput = "";
  private frameBuffer: string[] = [];
  private rafId: number | null = null;

  render(rootNode: DOMElement): void {
    // 1. Yoga 计算布局
    rootNode.yogaNode?.calculateLayout(
      this.termWidth,
      this.termHeight
    );

    // 2. 遍历 DOM 树生成 ANSI
    const output = this.renderNode(rootNode, 0, 0);

    // 3. 帧合并：防止高频刷新闪烁
    this.frameBuffer.push(output);
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.flush();
        this.rafId = null;
      });
    }
  }

  private renderNode(
    node: DOMElement,
    x: number,
    y: number
  ): string {
    const layout = node.yogaNode?.getComputedLayout();
    if (!layout) return "";

    let result = "";
    const absX = x + layout.left;
    const absY = y + layout.top;

    // 绘制背景和边框
    if (node.style.backgroundColor) {
      result += this.drawBackground(
        absX, absY, layout.width, layout.height,
        node.style.backgroundColor
      );
    }

    // 递归渲染子节点
    for (const child of node.childNodes) {
      if (child.nodeName === "#text") {
        result += this.drawText(
          absX, absY, child.nodeValue,
          node.style.color
        );
      } else {
        result += this.renderNode(
          child as DOMElement, absX, absY
        );
      }
    }

    return result;
  }

  // frame.ts: 帧合并与闪烁防护
  private flush(): void {
    if (this.frameBuffer.length === 0) return;

    // 取最后一帧（丢弃中间帧）
    const latest =
      this.frameBuffer[this.frameBuffer.length - 1];
    this.frameBuffer = [];

    // 差量输出优化
    if (latest !== this.lastOutput) {
      const optimized = optimizeAnsi(
        this.lastOutput, latest
      );
      process.stdout.write(optimized);
      this.lastOutput = latest;
    }
  }
}

// optimizer.ts: ANSI 序列压缩
function optimizeAnsi(
  prev: string, next: string
): string {
  // 找到第一个差异位置
  let diffStart = 0;
  while (
    diffStart < prev.length
    && diffStart < next.length
    && prev[diffStart] === next[diffStart]
  ) {
    diffStart++;
  }
  // 只输出变化部分 + 光标定位
  return cursorTo(diffStart) + next.slice(diffStart);
}`
    },
    {
      title: '快捷键系统与 Vim 模式',
      language: 'typescript',
      code: `// keybindings/parser.ts: 键序列解析
interface KeyBinding {
  key: string;           // "ctrl+s", "escape j"
  command: string;
  when?: string;         // 条件表达式
  priority?: number;
}

function parseKeySequence(
  raw: string
): ParsedKey[] {
  return raw.split(" ").map(part => {
    const modifiers: string[] = [];
    let key = part;

    if (key.includes("+")) {
      const segments = key.split("+");
      key = segments.pop()!;
      modifiers.push(...segments);
    }

    return { key, modifiers };
  });
}

// keybindings/resolver.ts: 绑定解析与冲突处理
class KeybindingResolver {
  private bindings: KeyBinding[] = [];

  resolve(
    event: KeyEvent,
    context: KeyContext
  ): KeyBinding | null {
    const matches = this.bindings.filter(b => {
      const parsed = parseKeySequence(b.key);
      return matchesKey(parsed, event)
        && (!b.when || evaluateWhen(b.when, context));
    });

    if (matches.length === 0) return null;

    // 优先级排序：用户自定义 > 默认
    matches.sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
    return matches[0];
  }
}

// vim/motions.ts: Vim 光标移动
const vimMotions: Record<string, VimMotion> = {
  h: { type: "char", direction: -1 },
  l: { type: "char", direction: 1 },
  j: { type: "line", direction: 1 },
  k: { type: "line", direction: -1 },
  w: { type: "word", direction: 1 },
  b: { type: "word", direction: -1 },
  "0": { type: "lineStart" },
  "$": { type: "lineEnd" }
};

// vim/operators.ts: Vim 操作符
const vimOperators: Record<string, VimOperator> = {
  d: {
    name: "delete",
    execute(range: TextRange, buffer: Buffer) {
      const deleted = buffer.getText(range);
      buffer.delete(range);
      return { register: deleted };
    }
  },
  c: {
    name: "change",
    execute(range: TextRange, buffer: Buffer) {
      const deleted = buffer.getText(range);
      buffer.delete(range);
      return {
        register: deleted,
        enterMode: "insert"
      };
    }
  },
  y: {
    name: "yank",
    execute(range: TextRange, buffer: Buffer) {
      return {
        register: buffer.getText(range)
      };
    }
  }
};

// vim/transitions.ts: 模式转换
type VimMode = "normal" | "insert" | "visual";

function handleVimTransition(
  currentMode: VimMode,
  key: string
): VimMode {
  if (currentMode === "normal" && key === "i")
    return "insert";
  if (currentMode === "normal" && key === "v")
    return "visual";
  if (currentMode === "insert" && key === "escape")
    return "normal";
  if (currentMode === "visual" && key === "escape")
    return "normal";
  return currentMode;
}`
    }
  ],
  interactive: `
    <h3>终端 UI 框架交互式演练</h3>
    <div class="interactive-demo">
      <div class="step" data-step="1">
        <h4>Step 1: React 组件到终端 DOM</h4>
        <p>开发者使用 JSX 编写终端界面，和 Web React 开发体验几乎一致。Box 和 Text 组件通过自定义 Reconciler 转换为终端 DOM 节点。</p>
        <div class="code-highlight">
          <pre>// JSX 组件
&lt;Box flexDirection="column" padding={1}&gt;
  &lt;Text color="green" bold&gt;Claude Code&lt;/Text&gt;
  &lt;Box marginTop={1}&gt;
    &lt;Text&gt;Ready for input...&lt;/Text&gt;
  &lt;/Box&gt;
&lt;/Box&gt;

// 转换为 DOMElement 树
DOMElement { nodeName: "Box", style: { flexDirection: "column" }
  DOMElement { nodeName: "Text", style: { color: "green" }
    DOMText { nodeValue: "Claude Code" }
  }
  DOMElement { nodeName: "Box", style: { marginTop: 1 }
    DOMText { nodeValue: "Ready for input..." }
  }
}</pre>
        </div>
      </div>
      <div class="step" data-step="2">
        <h4>Step 2: Yoga 布局计算</h4>
        <p>Yoga 引擎将 Flexbox 属性映射到终端行列坐标。每个 DOMElement 的 yogaNode 接收布局参数，计算出精确的 x/y/width/height。</p>
        <div class="code-highlight">
          <pre>Yoga 布局计算 (终端 80x24):
  Box(root):  x=0, y=0, w=80, h=24
    Text:     x=1, y=1, w=78, h=1  (padding=1)
    Box:      x=1, y=3, w=78, h=1  (marginTop=1)</pre>
        </div>
      </div>
      <div class="step" data-step="3">
        <h4>Step 3: ANSI 渲染与帧优化</h4>
        <p>renderer.ts 将布局结果转换为 ANSI 转义序列。frame.ts 在高频更新时合并多帧为一次输出，optimizer.ts 压缩重复的 ANSI 序列。</p>
        <div class="code-highlight">
          <pre>渲染流水线:
  DOM 树 &#x2192; Yoga 布局 &#x2192; ANSI 生成 &#x2192; 帧合并 &#x2192; 差量输出

帧合并示例 (16ms 内):
  Frame 1: "Hello W..."  (丢弃)
  Frame 2: "Hello Wo..." (丢弃)
  Frame 3: "Hello World"  (输出!)

差量输出: 只重绘变化的字符位置</pre>
        </div>
      </div>
      <div class="step" data-step="4">
        <h4>Step 4: Vim 模式与快捷键</h4>
        <p>用户按 Escape 进入 Vim Normal 模式，可使用 hjkl 移动、dd 删除行、yy 复制行。keybindingResolver 处理键序列匹配和优先级。</p>
        <div class="code-highlight">
          <pre>Vim 操作流程:
  按键: "d" &#x2192; 等待操作符...
  按键: "w" &#x2192; 组合为 "dw" (delete word)

  operator: "d" (delete)
  motion: "w" (word forward)
  &#x2192; 计算 word 范围: [col=5, col=12]
  &#x2192; 删除文本，存入寄存器
  &#x2192; 更新 DOM，重新渲染</pre>
        </div>
      </div>
    </div>
  `
}
