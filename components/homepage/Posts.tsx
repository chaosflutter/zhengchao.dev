import type { BlogFrontMatter } from '~/types'
import { formatDate } from '~/utils/date'
import { Link } from '../Link'

export function Posts({ posts }: { posts: BlogFrontMatter[] }) {
  return (
    <div>
      <h1 className="font-bold text-2xl mb-4">All Posts</h1>
      <ul className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
        {!posts.length && 'No posts found.'}

        {posts.map((frontMatter) => {
          const { slug, date, title } = frontMatter

          return (
            <li key={slug} className="py-4">
              <article>
                <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <div className="xl:col-span-3">
                    <h2 className="mb-1 text-xl font-medium tracking-tight">
                      <Link
                        href={`/blog/${slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        <span>{title}</span>
                      </Link>
                    </h2>
                  </div>
                  <div className="text-base xl:text-end font-medium leading-6 text-gray-500 dark:text-gray-400">
                    <time dateTime={date}>{formatDate(date)}</time>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
