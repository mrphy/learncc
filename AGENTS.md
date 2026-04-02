# AGENTS.md

## 项目概述

本项目是 **"深入 Claude Code 源码"** 学习网站，使用 Next.js 15 + TypeScript + Tailwind CSS 4 构建，以静态导出方式部署。包含 20 章深度解析内容，覆盖 Claude Code 的 7 层架构。

## 启动方式

```bash
npm install          # 首次运行需安装依赖
npm run dev          # 开发模式 (http://localhost:3000)
npm run build        # 生产构建 (静态导出到 out/)
```

## 编码约定

- 语言：TypeScript，严格模式
- 样式：Tailwind CSS 4，通过 CSS 变量管理主题色（见 `globals.css`）
- 组件：React 函数组件 + hooks，使用 `'use client'` 标记客户端组件
- 路径别名：`@/*` 映射到 `./src/*`
- 文件命名：组件 PascalCase，数据/工具文件 camelCase

## 关键架构决策

1. **静态导出** (`output: 'export'`)：无服务端依赖，可部署到任意静态托管
2. **动态路由** `[chapter]`：章节 ID（c01~c20）作为 URL 参数
3. **数据与视图分离**：章节内容存放在 `src/data/chapters/`，可视化组件在 `src/components/visualizations/`
4. **暗色模式**：通过 `localStorage` + `prefers-color-scheme` 在 `<head>` 中提前设置，避免闪烁

## 添加新章节

1. 在 `src/data/chapters/` 新建 `cXX.ts`，导出 `ChapterData` 对象
2. 在 `src/data/chapters.ts` 中导入并注册
3. 在 `src/lib/constants.ts` 中添加章节元数据和学习路径
4. 在 `src/components/visualizations/` 中添加对应可视化组件
5. 在 `src/components/visualizations/index.tsx` 中注册
