import { CHAPTER_META } from '@/lib/constants'
import ChapterContent from './ChapterContent'

export function generateStaticParams() {
  return Object.keys(CHAPTER_META).map((chapter) => ({ chapter }))
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>
}) {
  const { chapter } = await params
  return <ChapterContent chapterId={chapter} />
}
