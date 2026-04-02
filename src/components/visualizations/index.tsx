'use client'
import { lazy } from 'react'
import type { ComponentType } from 'react'

const visualizations: Record<string, React.LazyExoticComponent<ComponentType<{ title?: string }>>> = {
  c01: lazy(() => import('./c01-startup')),
  c02: lazy(() => import('./c02-config')),
  c03: lazy(() => import('./c03-query-engine')),
  c04: lazy(() => import('./c04-query-loop')),
  c05: lazy(() => import('./c05-api-client')),
  c06: lazy(() => import('./c06-tool-arch')),
  c07: lazy(() => import('./c07-tool-exec')),
  c08: lazy(() => import('./c08-builtin-tools')),
  c09: lazy(() => import('./c09-plan-workflow')),
  c10: lazy(() => import('./c10-permissions')),
  c11: lazy(() => import('./c11-hooks')),
  c12: lazy(() => import('./c12-mcp')),
  c13: lazy(() => import('./c13-memory')),
  c14: lazy(() => import('./c14-subagent')),
  c15: lazy(() => import('./c15-teams')),
  c16: lazy(() => import('./c16-tasks')),
  c17: lazy(() => import('./c17-skills')),
  c18: lazy(() => import('./c18-state')),
  c19: lazy(() => import('./c19-terminal-ui')),
  c20: lazy(() => import('./c20-bridge')),
}

export default visualizations
