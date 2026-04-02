'use client'

import { useMemo, useState, useCallback } from 'react'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'

hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('tsx', typescript)
hljs.registerLanguage('javascript', typescript)
hljs.registerLanguage('js', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)

/* ─── Language display labels ─── */
const LANG_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  javascript: 'JavaScript',
  js: 'JS',
  bash: 'Bash',
  shell: 'Shell',
  json: 'JSON',
}

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export default function CodeBlock({ code, language = 'typescript', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const trimmedCode = code.trim()

  /* Highlight with pure function (no DOM mutation) */
  const highlightedHtml = useMemo(() => {
    try {
      const result = hljs.highlight(trimmedCode, { language })
      return result.value
    } catch {
      // Fallback: escape HTML and return plain text
      return trimmedCode
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
    }
  }, [trimmedCode, language])

  /* Split into lines for line numbers */
  const lines = trimmedCode.split('\n')
  const lineCount = lines.length

  /* Copy handler */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(trimmedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = trimmedCode
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [trimmedCode])

  const langLabel = LANG_LABELS[language] ?? language.toUpperCase()

  return (
    <div className="code-block">
      {/* ── Title bar ── */}
      <div className="code-block-header">
        {/* macOS window dots */}
        <div className="code-block-dots">
          <span className="code-dot code-dot-red" />
          <span className="code-dot code-dot-yellow" />
          <span className="code-dot code-dot-green" />
        </div>

        {/* Title */}
        {title && <span className="code-block-title">{title}</span>}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Language pill */}
        <span className="code-lang-pill">{langLabel}</span>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="code-copy-btn"
          aria-label={copied ? '已复制' : '复制代码'}
          title={copied ? '已复制' : '复制代码'}
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
          <span className="code-copy-label">{copied ? '已复制' : '复制'}</span>
        </button>
      </div>

      {/* ── Code body ── */}
      <div className="code-block-body">
        {/* Line numbers column */}
        <div className="code-line-numbers" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>

        {/* Code column */}
        <pre className="code-block-pre">
          <code
            className={`hljs language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  )
}
