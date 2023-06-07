import type { BlogMetaProps } from '~/types'
import { formatDate } from '~/utils/date'
import { ViewCounter } from '../ViewCounter'
import { BlogTags } from '~/components/blog/BlogTags'

export function BlogMeta({ date, slug, readingTime, tags }: BlogMetaProps) {
  return (
    <dd className="flex flex-wrap text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 md:text-base">
      <time dateTime={date}>{formatDate(date)}</time>
      <span className="mx-2">{` • `}</span>
      <span>{readingTime.text.replace('min', 'mins')}</span>
      <span className="hidden mx-2">{` • `}</span>
      <ViewCounter className="hidden" slug={slug} />
      <BlogTags tags={tags} />
    </dd>
  )
}
