# 深入 Claude Code 源码 — 学习网站

## 项目简介

这是一个基于 Next.js 构建的 **Claude Code 源码深度解析** 学习网站，涵盖 20 章内容、7 层架构体系（基础层、引擎层、工具层、安全层、集成层、UI/状态层），帮助读者系统理解 Claude Code 的设计哲学与工程实践。

## 技术栈

- **框架**: Next.js 15 (App Router, Turbopack)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion
- **代码高亮**: highlight.js
- **图标**: lucide-react
- **部署模式**: 静态导出 (`output: 'export'`)

## 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局 (暗色模式、Header)
│   ├── page.tsx            # 首页 (Hero + 架构总览 + 学习路径)
│   ├── globals.css         # 全局样式 / CSS 变量
│   └── (learn)/            # 学习路由组
│       ├── layout.tsx      # 章节布局 (Sidebar)
│       └── [chapter]/      # 动态路由 /c01 ~ /c20
│           ├── page.tsx
│           └── ChapterContent.tsx
├── components/             # UI 组件
│   ├── Header.tsx          # 顶部导航栏
│   ├── Sidebar.tsx         # 侧边栏目录
│   ├── Tabs.tsx / StickyTabs.tsx
│   ├── Card.tsx / CodeBlock.tsx
│   ├── LayerBadge.tsx / StepControls.tsx
│   └── visualizations/    # 每章交互式可视化 (c01~c20)
├── data/
│   ├── chapters.ts         # 章节数据聚合
│   └── chapters/c01~c20.ts # 各章内容 (正文、架构、代码示例、交互)
├── hooks/
│   └── useSteppedVisualization.ts
└── lib/
    ├── cn.ts               # className 工具
    └── constants.ts        # 章节元数据、层级定义、学习路径
```

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (Turbopack)
npm run build        # 构建静态站点 (输出到 out/)
npm run start        # 启动生产服务器
```

## 开发注意事项

- 页面路由为 `/c01` ~ `/c20`，对应 `src/data/chapters/` 下的数据文件
- 每章包含四个 Tab：正文 (`content`)、架构图 (`architecture`)、代码示例 (`codeExamples`)、交互演示 (`interactive`)
- 可视化组件在 `src/components/visualizations/` 下，每章一个文件
- 使用 CSS 变量做主题色管理，支持暗色模式
- 静态导出模式，不依赖服务端功能
