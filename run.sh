#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# 检查 node 是否安装
if ! command -v node &>/dev/null; then
  echo "❌ 未找到 Node.js，请先安装: https://nodejs.org/"
  exit 1
fi

echo "📦 Node $(node -v) | npm $(npm -v)"

# 安装依赖（仅在 node_modules 不存在或 package.json 更新时）
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "📥 安装依赖..."
  npm install
else
  echo "✅ 依赖已是最新"
fi

MODE="${1:-dev}"

case "$MODE" in
  dev)
    echo "🚀 启动开发服务器 (http://localhost:3000)..."
    npm run dev
    ;;
  build)
    echo "🔨 构建生产版本..."
    npm run build
    echo "✅ 构建完成，静态文件输出到 out/ 目录"
    ;;
  preview)
    echo "🔨 构建并预览..."
    npm run build
    echo "👀 启动预览服务器..."
    npx serve out -l 3000
    ;;
  *)
    echo "用法: ./run.sh [dev|build|preview]"
    echo "  dev     - 启动开发服务器 (默认)"
    echo "  build   - 构建静态文件到 out/"
    echo "  preview - 构建并本地预览"
    exit 1
    ;;
esac
