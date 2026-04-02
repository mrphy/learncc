#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# ─── 环境检查 ───────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌ 未找到 Node.js，请先安装: https://nodejs.org/"
  exit 1
fi

echo "📦 Node $(node -v) | npm $(npm -v)"

# ─── 安装依赖 ───────────────────────────────────────────────
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
  echo "📥 安装依赖..."
  npm ci --prefer-offline 2>/dev/null || npm install
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

  build:gh)
    echo "🔨 构建 GitHub Pages 版本 (basePath: /learncc)..."
    NEXT_PUBLIC_BASE_PATH=/learncc npm run build
    echo "✅ 构建完成，静态文件输出到 out/ 目录 (GitHub Pages 模式)"
    ;;

  preview)
    echo "🔨 构建并预览..."
    npm run build
    echo "👀 启动预览服务器 (http://localhost:3000)..."
    npx serve out -l 3000
    ;;

  preview:gh)
    echo "🔨 构建 GitHub Pages 版本并预览..."
    NEXT_PUBLIC_BASE_PATH=/learncc npm run build
    echo "👀 启动预览服务器 (http://localhost:3000)..."
    npx serve out -l 3000
    ;;

  clean)
    echo "🧹 清理构建产物..."
    rm -rf out .next
    echo "✅ 已清理 out/ 和 .next/"
    ;;

  *)
    echo "用法: ./run.sh <command>"
    echo ""
    echo "命令:"
    echo "  dev        - 启动开发服务器 (默认)"
    echo "  build      - 构建静态文件到 out/"
    echo "  build:gh   - 构建 GitHub Pages 版本 (带 basePath)"
    echo "  preview    - 构建并本地预览"
    echo "  preview:gh - 构建 GitHub Pages 版本并预览"
    echo "  clean      - 清理 out/ 和 .next/"
    exit 1
    ;;
esac
