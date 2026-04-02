import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "深入 Claude Code 源码",
    template: "%s | 深入 Claude Code 源码",
  },
  description:
    "从架构到实现，系统学习 Claude Code 内部原理。涵盖基础层、引擎层、工具层、安全层、集成层与 UI 状态管理，深入理解 AI 编程助手的设计哲学与工程实践。",
  keywords: [
    "Claude Code",
    "源码分析",
    "AI 编程",
    "Anthropic",
    "架构设计",
    "TypeScript",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Prevent FOUC: read dark mode preference before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-theme antialiased">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
