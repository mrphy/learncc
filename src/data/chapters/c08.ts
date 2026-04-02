import type { ChapterData } from '../chapters'

export const c08: ChapterData = {
  content: `
<h2>内置工具全景概述</h2>
<blockquote>Claude Code 内置了 42+ 种工具，涵盖文件操作、代码搜索、命令执行、Web 访问、代码智能等多个领域。每种工具都针对特定场景做了深度优化。本章深入剖析最核心的几个工具的内部实现。</blockquote>

<h3>BashTool：最复杂的工具（20+ 文件）</h3>
<p>BashTool 是整个工具系统中最复杂的工具，由 20+ 个文件组成。它不仅要执行 shell 命令，还要理解命令的语义、评估安全风险、决定是否沙箱化。</p>

<h4>命令分类系统</h4>
<p>BashTool 将 shell 命令分为多个类别，每个类别有不同的权限和行为策略：</p>
<ul>
<li><code>BASH_SEARCH_COMMANDS</code> — 搜索类命令（grep、find、rg 等）：只读，可并发</li>
<li><code>BASH_READ_COMMANDS</code> — 读取类命令（cat、head、tail 等）：只读，可并发</li>
<li><code>BASH_LIST_COMMANDS</code> — 列表类命令（ls、tree、du 等）：只读，可并发</li>
<li><code>BASH_SILENT_COMMANDS</code> — 静默类命令（cd、pwd 等）：无副作用，自动允许</li>
</ul>
<p>不属于以上类别的命令被视为"可能有副作用"，需要更严格的权限检查。</p>

<h4>AST 分析（treeSitterAnalysis）</h4>
<p>BashTool 使用 Tree-sitter 将 shell 命令解析为 AST（抽象语法树），而不是简单的字符串匹配：</p>
<ul>
<li>能正确识别管道：<code>cat file | grep pattern</code> 中 cat 是只读的</li>
<li>能识别命令替换：<code>$(rm -rf /)</code> 被嵌入到看似无害的命令中</li>
<li>能识别重定向：<code>echo "data" > file</code> 虽然用了 echo 但有写操作</li>
<li>能识别 && 和 || 链：<code>test -f file && rm file</code> 包含破坏性操作</li>
</ul>

<h4>沙箱决策（shouldUseSandbox）</h4>
<p>对于不信任的命令，BashTool 可以在沙箱中执行：</p>
<ul>
<li>判断逻辑综合考虑：命令类别、用户权限模式、沙箱可用性</li>
<li>沙箱通过 <code>sandbox-adapter.ts</code> 对接不同的沙箱实现</li>
<li>沙箱内的命令无法访问主机文件系统（除显式挂载的目录）</li>
</ul>

<h4>sed 编辑检测</h4>
<p>BashTool 能检测用户是否通过 <code>sed</code> 命令编辑文件，并提示用户使用更安全的 FileEditTool：</p>
<ul>
<li>检测 <code>sed -i</code>（in-place 编辑）模式</li>
<li>提供"建议使用 Edit 工具"的提示，因为 Edit 工具有冲突检测</li>
</ul>

<h3>FileEditTool：精确文本替换</h3>
<p>FileEditTool 实现了 <code>old_string → new_string</code> 的精确替换逻辑：</p>
<ul>
<li><strong>唯一性检测</strong> — old_string 必须在文件中唯一匹配。如果匹配到多处，工具报错并提示用户提供更多上下文以区分</li>
<li><strong>Diff 计算</strong> — 替换前后计算 diff，用于 UI 展示和版本历史</li>
<li><strong>replace_all 模式</strong> — 可选的全局替换模式，允许替换所有匹配项</li>
<li><strong>空白敏感</strong> — 精确匹配缩进和空白字符，避免意外替换</li>
</ul>

<h3>FileReadTool：多格式智能读取</h3>
<p>FileReadTool 不只是简单的文件读取，它支持多种文件格式：</p>
<ul>
<li><strong>文本文件</strong> — 带行号输出（<code>cat -n</code> 格式），支持 offset 和 limit 参数</li>
<li><strong>图片</strong> — PNG/JPG 等图片经过处理管线：检测尺寸 → 按需 resize → 降采样 → 转为 base64 发送给多模态 Claude</li>
<li><strong>PDF</strong> — 支持页面范围读取（<code>pages: "1-5"</code>），大 PDF 强制要求指定页面范围</li>
<li><strong>Jupyter Notebook</strong> — 解析 .ipynb JSON 格式，展示代码单元、输出和可视化</li>
<li><strong>大小限制</strong> — 默认读取前 2000 行，超大文件提示用户使用 offset 分段读取</li>
</ul>

<h3>FileWriteTool：智能写入</h3>
<p>FileWriteTool 在写入文件时做了多项智能检测：</p>
<ul>
<li><strong>编码检测</strong> — 自动检测现有文件的编码（UTF-8、Latin-1 等），新文件使用同样编码写入</li>
<li><strong>行尾检测</strong> — 检测现有文件使用 LF 还是 CRLF 行尾，保持一致性</li>
<li><strong>文件历史</strong> — 写入前记录文件状态到历史中，支持后续的 diff 查看和撤销</li>
</ul>

<h3>GlobTool：高速文件搜索</h3>
<p>GlobTool 使用 ripgrep 的文件匹配引擎（而非 Node.js 的 glob 库）：</p>
<ul>
<li>支持标准 glob 模式（<code>**/*.ts</code>、<code>src/**/*.{js,jsx}</code>）</li>
<li>结果按文件修改时间排序（最近修改的文件排在前面）</li>
<li>性能远超 Node.js 原生 glob，处理大型仓库（10万+ 文件）依然快速</li>
</ul>

<h3>GrepTool：多模式搜索</h3>
<p>GrepTool 是 ripgrep 的包装器，提供三种输出模式：</p>
<ul>
<li><code>content</code> — 显示匹配行的完整内容，支持 -A/-B/-C 上下文行</li>
<li><code>files_with_matches</code> — 只显示包含匹配的文件路径（默认模式）</li>
<li><code>count</code> — 显示每个文件的匹配次数</li>
</ul>

<h3>LSPTool：代码智能</h3>
<p>LSPTool 通过 Language Server Protocol 提供 IDE 级别的代码智能：</p>
<ul>
<li><code>goToDefinition</code> — 跳转到符号定义</li>
<li><code>findReferences</code> — 查找所有引用</li>
<li><code>hover</code> — 获取悬停信息（类型、文档）</li>
<li><code>documentSymbol</code> — 获取文件中的所有符号</li>
<li><code>workspaceSymbol</code> — 全工作区符号搜索</li>
<li><code>goToImplementation</code> — 查找接口实现</li>
<li><code>prepareCallHierarchy</code> / <code>incomingCalls</code> / <code>outgoingCalls</code> — 调用层次分析</li>
</ul>

<h3>其他工具</h3>
<p>除上述核心工具外，Claude Code 还包含：</p>
<ul>
<li><strong>WebFetchTool</strong> — 获取网页内容并转换为 Markdown</li>
<li><strong>WebSearchTool</strong> — Web 搜索并返回结构化结果</li>
<li><strong>NotebookEditTool</strong> — 编辑 Jupyter Notebook 单元格</li>
<li><strong>PowerShellTool</strong> — Windows PowerShell 执行（特性门控）</li>
<li>总计 <strong>42+</strong> 种工具，覆盖开发工作流的各个环节</li>
</ul>
`,

  architecture: `
<h2>内置工具架构</h2>

<h3>工具分类矩阵</h3>
<div style="overflow-x:auto">
<table>
<thead><tr><th>工具</th><th>只读?</th><th>并发安全?</th><th>复杂度</th><th>关键特性</th></tr></thead>
<tbody>
<tr><td>BashTool</td><td>视命令</td><td>否</td><td>极高（20+ 文件）</td><td>AST 分析、沙箱、命令分类</td></tr>
<tr><td>FileEditTool</td><td>否</td><td>否</td><td>中</td><td>唯一性检测、diff 计算</td></tr>
<tr><td>FileReadTool</td><td>是</td><td>是</td><td>中</td><td>多格式支持、图片处理</td></tr>
<tr><td>FileWriteTool</td><td>否</td><td>否</td><td>低</td><td>编码检测、行尾检测</td></tr>
<tr><td>GlobTool</td><td>是</td><td>是</td><td>低</td><td>ripgrep 引擎、mod-time 排序</td></tr>
<tr><td>GrepTool</td><td>是</td><td>是</td><td>低</td><td>三种输出模式、上下文行</td></tr>
<tr><td>LSPTool</td><td>是</td><td>是</td><td>中</td><td>8 种 LSP 操作</td></tr>
<tr><td>WebFetchTool</td><td>是</td><td>是</td><td>中</td><td>HTML→Markdown 转换</td></tr>
<tr><td>WebSearchTool</td><td>是</td><td>是</td><td>低</td><td>结构化搜索结果</td></tr>
</tbody>
</table>
</div>

<h3>BashTool 内部架构</h3>
<p>BashTool 的 20+ 文件按职责分层：</p>
<ol>
<li><strong>入口层</strong>：BashTool.ts — call() 方法，统筹整个执行流程</li>
<li><strong>分析层</strong>：treeSitterAnalysis.ts — AST 解析和命令语义理解</li>
<li><strong>分类层</strong>：commandClassification.ts — 命令类别判断</li>
<li><strong>安全层</strong>：shouldUseSandbox.ts — 沙箱决策逻辑</li>
<li><strong>执行层</strong>：processExecution.ts — 子进程管理和输出捕获</li>
<li><strong>检测层</strong>：sedDetection.ts — sed 编辑检测和建议</li>
</ol>

<h3>FileReadTool 图片处理管线</h3>
<ol>
<li><strong>格式检测</strong> → 通过文件扩展名和 magic bytes 判断类型</li>
<li><strong>尺寸检测</strong> → 读取图片元数据获取宽×高</li>
<li><strong>Resize 决策</strong> → 超过阈值（如 2048px）则缩小</li>
<li><strong>降采样</strong> → 减少颜色深度以减小体积</li>
<li><strong>Base64 编码</strong> → 转换为 API 兼容的 base64 字符串</li>
<li><strong>嵌入消息</strong> → 作为 image content block 发送给 Claude</li>
</ol>

<h3>设计决策</h3>
<blockquote>
<p><strong>为什么 BashTool 要用 Tree-sitter 而不是正则表达式？</strong></p>
<p>Shell 命令的语法极其复杂：嵌套引号、命令替换、进程替换、here-doc 等。正则表达式无法可靠地解析 <code>echo "$(cat file | grep 'pattern')" > output</code> 这样的命令。Tree-sitter 提供了完整的 AST，可以准确识别每个子命令、每个重定向、每个替换。虽然增加了依赖和复杂度，但这是安全性的基础。</p>
</blockquote>
`,

  codeExamples: [
    {
      title: 'BashTool 命令分类与 AST 分析',
      language: 'typescript',
      code: `// tools/BashTool/commandClassification.ts — 简化版

// 命令分类常量
export const BASH_SEARCH_COMMANDS = new Set([
  'grep', 'rg', 'find', 'fd', 'ag', 'ack',
  'locate', 'which', 'whereis', 'type',
])

export const BASH_READ_COMMANDS = new Set([
  'cat', 'head', 'tail', 'less', 'more',
  'wc', 'file', 'stat', 'md5sum', 'sha256sum',
])

export const BASH_LIST_COMMANDS = new Set([
  'ls', 'tree', 'du', 'df', 'find', 'exa',
])

export const BASH_SILENT_COMMANDS = new Set([
  'cd', 'pwd', 'echo', 'printf', 'true', 'false',
  'test', '[', '[[',
])

// treeSitterAnalysis.ts — AST 分析
import Parser from 'tree-sitter'
import Bash from 'tree-sitter-bash'

export function analyzeCommand(command: string): CommandAnalysis {
  const parser = new Parser()
  parser.setLanguage(Bash)
  const tree = parser.parse(command)

  const analysis: CommandAnalysis = {
    commands: [],       // 所有命令名
    hasRedirection: false,
    hasPipe: false,
    hasCommandSubstitution: false,
    hasDestructiveOp: false,
    isReadOnly: true,
  }

  // 遍历 AST 节点
  function visit(node: Parser.SyntaxNode) {
    switch (node.type) {
      case 'command':
        const cmdName = node.firstChild?.text ?? ''
        analysis.commands.push(cmdName)
        if (!isReadOnlyCommand(cmdName)) {
          analysis.isReadOnly = false
        }
        break

      case 'redirected_statement':
      case 'file_redirect':
        analysis.hasRedirection = true
        analysis.isReadOnly = false // 重定向意味着写操作
        break

      case 'pipeline':
        analysis.hasPipe = true
        break

      case 'command_substitution':
        analysis.hasCommandSubstitution = true
        break
    }

    for (const child of node.children) {
      visit(child)
    }
  }

  visit(tree.rootNode)
  return analysis
}

function isReadOnlyCommand(cmd: string): boolean {
  return BASH_SEARCH_COMMANDS.has(cmd)
    || BASH_READ_COMMANDS.has(cmd)
    || BASH_LIST_COMMANDS.has(cmd)
    || BASH_SILENT_COMMANDS.has(cmd)
}`
    },
    {
      title: 'FileEditTool 精确替换逻辑',
      language: 'typescript',
      code: `// tools/FileEditTool.ts — 简化版
import { z } from 'zod'
import { readFile, writeFile } from 'fs/promises'
import { createPatch } from 'diff'

export class FileEditTool implements Tool {
  name = 'Edit'

  inputSchema = z.object({
    file_path: z.string().describe('要编辑的文件绝对路径'),
    old_string: z.string().describe('要替换的文本'),
    new_string: z.string().describe('替换后的新文本'),
    replace_all: z.boolean().optional().default(false)
      .describe('是否替换所有匹配项'),
  })

  async call(
    input: z.infer<typeof this.inputSchema>,
    context: ToolUseContext
  ): Promise<ToolResult> {
    const { file_path, old_string, new_string, replace_all } = input

    // 读取文件
    const content = await readFile(file_path, 'utf-8')

    // 唯一性检测
    if (!replace_all) {
      const matchCount = countOccurrences(content, old_string)

      if (matchCount === 0) {
        return {
          data: '错误: old_string 在文件中未找到。\\n' +
            '请确认要替换的文本与文件内容完全匹配（包括缩进和空白）。',
        }
      }

      if (matchCount > 1) {
        // 非唯一匹配：提示用户提供更多上下文
        const locations = findMatchLocations(content, old_string)
        return {
          data: '错误: old_string 在文件中匹配到 ' + matchCount + ' 处。\\n' +
            '匹配位置: 行 ' + locations.join(', ') + '\\n' +
            '请提供更多上下文使 old_string 唯一，或使用 replace_all=true。',
        }
      }
    }

    // 执行替换
    const newContent = replace_all
      ? content.replaceAll(old_string, new_string)
      : content.replace(old_string, new_string)

    // 计算 diff（用于 UI 展示）
    const diff = createPatch(file_path, content, newContent)

    // 记录文件历史
    context.readFileState.recordEdit(file_path, content)

    // 写入文件
    await writeFile(file_path, newContent, 'utf-8')

    return {
      data: '文件已更新: ' + file_path + '\\n\\n' + diff,
    }
  }

  isReadOnly() { return false }
  isConcurrencySafe() { return false }
  isDestructive() { return false }
}

function countOccurrences(text: string, search: string): number {
  let count = 0
  let pos = 0
  while ((pos = text.indexOf(search, pos)) !== -1) {
    count++
    pos += search.length
  }
  return count
}`
    },
    {
      title: 'FileReadTool 多格式支持',
      language: 'typescript',
      code: `// tools/FileReadTool.ts — 简化版
import { readFile, stat } from 'fs/promises'
import { extname } from 'path'
import sharp from 'sharp'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])
const MAX_LINES = 2000
const MAX_IMAGE_DIMENSION = 2048

export class FileReadTool implements Tool {
  name = 'Read'

  async call(
    input: { file_path: string; offset?: number; limit?: number; pages?: string },
    context: ToolUseContext
  ): Promise<ToolResult> {
    const ext = extname(input.file_path).toLowerCase()

    // 图片处理管线
    if (IMAGE_EXTENSIONS.has(ext)) {
      return this.readImage(input.file_path)
    }

    // PDF 处理
    if (ext === '.pdf') {
      return this.readPDF(input.file_path, input.pages)
    }

    // Jupyter Notebook 处理
    if (ext === '.ipynb') {
      return this.readNotebook(input.file_path)
    }

    // 文本文件：带行号输出
    return this.readText(input.file_path, input.offset, input.limit)
  }

  private async readText(
    filePath: string,
    offset = 0,
    limit = MAX_LINES
  ): Promise<ToolResult> {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\\n')

    const selectedLines = lines.slice(offset, offset + limit)
    const numbered = selectedLines.map(
      (line, i) => (offset + i + 1).toString().padStart(6) + '\\t' + line
    )

    let result = numbered.join('\\n')
    if (offset + limit < lines.length) {
      result += '\\n\\n... (文件共 ' + lines.length + ' 行，' +
        '已显示 ' + (offset + 1) + '-' + (offset + limit) + ' 行)'
    }

    return { data: result }
  }

  private async readImage(filePath: string): Promise<ToolResult> {
    // 1. 读取元数据
    const metadata = await sharp(filePath).metadata()
    const { width = 0, height = 0 } = metadata

    // 2. Resize 决策
    let image = sharp(filePath)
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      image = image.resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
        fit: 'inside',          // 保持比例
        withoutEnlargement: true, // 不放大
      })
    }

    // 3. 转为 base64
    const buffer = await image.toBuffer()
    const base64 = buffer.toString('base64')

    return {
      data: base64,
      // 作为 image content block 传给 Claude
    }
  }

  isReadOnly() { return true }
  isConcurrencySafe() { return true }
}`
    }
  ],

  interactive: `
<h2>内置工具互动解析</h2>

<h3>第 1 步：BashTool 的安全层次</h3>
<p>BashTool 面临一个核心矛盾：它必须足够强大以执行任意命令，又必须足够安全以防止危险操作。解决方案是多层防御：</p>
<ol>
<li><strong>第一层：命令分类</strong> — 已知安全的命令（grep、ls、cat）自动放行</li>
<li><strong>第二层：AST 分析</strong> — 解析命令结构，识别重定向、管道、子命令中的风险</li>
<li><strong>第三层：权限检查</strong> — 未知命令交给权限系统（用户确认或分类器判断）</li>
<li><strong>第四层：沙箱执行</strong> — 高风险命令在隔离环境中执行</li>
</ol>
<p>这种"层层筛选"的模式确保了：安全命令快速执行，危险命令被充分审查。</p>

<h3>第 2 步：FileEditTool 为什么坚持"唯一匹配"？</h3>
<p>想象以下场景：</p>
<pre>
// 文件中有 3 处 "const x = 1"
old_string: "const x = 1"
new_string: "const x = 2"
</pre>
<p>如果直接替换，Claude 可能意外修改了它不打算修改的那一处。唯一匹配要求 Claude 提供足够的上下文：</p>
<pre>
// 正确的做法：提供更多上下文使匹配唯一
old_string: "  // 在 processData 函数中\\n  const x = 1"
new_string: "  // 在 processData 函数中\\n  const x = 2"
</pre>
<p>这迫使 Claude "知道自己在改哪里"，避免了盲目替换。</p>

<h3>第 3 步：为什么 Glob 和 Grep 不用 Node.js 原生库？</h3>
<p>ripgrep 的性能优势在大型仓库中尤为明显：</p>
<ul>
<li><strong>Node.js glob</strong>：10 万文件搜索耗时 ~5 秒（JS 实现，单线程）</li>
<li><strong>ripgrep</strong>：10 万文件搜索耗时 ~0.2 秒（Rust 实现，多线程，SIMD 加速）</li>
<li>在 monorepo（百万+文件）中，差距更加明显</li>
<li>Claude Code 需要频繁搜索文件，ripgrep 的速度直接影响用户体验</li>
</ul>

<h3>第 4 步：图片处理为什么要 resize 和降采样？</h3>
<p>Claude 的多模态能力可以理解图片，但图片大小直接影响 token 成本：</p>
<ul>
<li>一张 4096×4096 的 PNG 截图可能有 10MB</li>
<li>Base64 编码后变为 ~13MB 的文本</li>
<li>发送给 API 会消耗大量 input tokens</li>
<li>resize 到 2048×2048 后质量几乎无损，但体积减小 75%</li>
<li>对于代码截图，这个尺寸完全足够 Claude 阅读</li>
</ul>

<h3>第 5 步：LSPTool 的价值</h3>
<p>为什么 Claude Code 需要 LSP 而不是让 Claude 自己通过 Grep 查找定义？</p>
<ul>
<li><strong>精确性</strong>：Grep 搜索 <code>function foo</code> 会匹配注释中的"// function foo"。LSP 通过语言服务器理解代码语义，只返回真正的定义</li>
<li><strong>跨文件</strong>：<code>findReferences</code> 能找到所有导入和使用点，包括间接引用</li>
<li><strong>类型信息</strong>：<code>hover</code> 能获取推断出的类型，Grep 做不到</li>
<li><strong>调用层次</strong>：<code>incomingCalls/outgoingCalls</code> 能构建完整的调用图</li>
</ul>

<h3>关键设计洞察</h3>
<ul>
<li><strong>深度 > 广度</strong>：BashTool 用 20+ 文件深度解决一个问题，而不是用一个文件粗略处理</li>
<li><strong>安全第一</strong>：命令分类 + AST 分析 + 沙箱，三层防御保护用户文件系统</li>
<li><strong>格式适配</strong>：FileReadTool 不是"读文件"，而是"让 Claude 理解文件内容"</li>
<li><strong>原生工具</strong>：选择 ripgrep 而非 JS 库，选择 Tree-sitter 而非正则，体现了"用正确的工具做正确的事"</li>
</ul>
`
}
