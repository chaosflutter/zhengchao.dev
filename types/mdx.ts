import type readingTime from 'reading-time'
import type { DevIconsMap } from '~/components/DevIcon'

export type MdxPageLayout =
  | 'AuthorLayout'
  | 'ListLayout'
  | 'PostSimple'
  | 'SnippetLayout'

export interface MdxFrontMatter {
  layout?: MdxPageLayout
  title: string
  name?: string
  date: string
  lastmod?: string
  tags?: string[]
  topics: string[]
  draft?: boolean
  summary: string
  images?: string[] | string
  authors?: string[]
  origin?: string
  slug: string
  gzh?: string
  jj?: string
}

export type ReadingTime = ReturnType<typeof readingTime>

export interface BlogFrontMatter extends MdxFrontMatter {
  readingTime: ReadingTime
  fileName: string
}

export interface SnippetFrontMatter extends BlogFrontMatter {
  heading: string
  type: keyof typeof DevIconsMap
}

export interface AuthorFrontMatter extends MdxFrontMatter {
  avatar: string
  github?: string
}

export interface MdxFileData {
  mdxSource: string
  frontMatter: BlogFrontMatter
  toc: unknown[]
}

export interface MdxLayoutRendererProps {
  layout: MdxPageLayout
  mdxSource: string
  frontMatter: MdxFrontMatter
  [key: string]: any
}
