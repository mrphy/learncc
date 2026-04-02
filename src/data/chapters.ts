export interface ChapterData {
  content: string
  architecture: string
  codeExamples: Array<{ title: string; code: string; language: string }>
  interactive: string
}

// Import chapter data from individual files
import { c01 } from './chapters/c01'
import { c02 } from './chapters/c02'
import { c03 } from './chapters/c03'
import { c04 } from './chapters/c04'
import { c05 } from './chapters/c05'
import { c06 } from './chapters/c06'
import { c07 } from './chapters/c07'
import { c08 } from './chapters/c08'
import { c09 } from './chapters/c09'
import { c10 } from './chapters/c10'
import { c11 } from './chapters/c11'
import { c12 } from './chapters/c12'
import { c13 } from './chapters/c13'
import { c14 } from './chapters/c14'
import { c15 } from './chapters/c15'
import { c16 } from './chapters/c16'
import { c17 } from './chapters/c17'
import { c18 } from './chapters/c18'
import { c19 } from './chapters/c19'
import { c20 } from './chapters/c20'

export const chapters: Record<string, ChapterData> = {
  c01, c02, c03, c04, c05, c06, c07, c08, c09, c10,
  c11, c12, c13, c14, c15, c16, c17, c18, c19, c20,
}
