import type { BlogMetaProps } from '~/types'
import { formatDate } from '~/utils/date'

export function BlogMeta({ date, readingTime }: BlogMetaProps) {
  return (
    <dd className="flex flex-wrap text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 md:text-base">
      <time dateTime={date}>{formatDate(date)}</time>
      {/* <span className="mx-2">{` • `}</span> */}
      {/* <span>{readingTime.text.replace('min', 'mins')}</span> */}
    </dd>
  )
}
