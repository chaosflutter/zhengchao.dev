import { useState } from 'react'
import { PostsSearch } from '~/components/PostsSearch'
import type { BlogFrontMatter } from '~/types'
import { formatDate } from '~/utils/date'
import { Link } from '../Link'

export function FeaturedPosts({ posts }: { posts: BlogFrontMatter[] }) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent =
      frontMatter.title + frontMatter.summary + frontMatter.topics.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    posts.length > 0 && !searchValue ? posts : filteredBlogPosts

  return (
    <div className="mt-8 md:mt-16">
      <div className="flex justify-between">
        <h1 className="mb-4 text-2xl font-bold">Posts</h1>
        <PostsSearch onChange={setSearchValue} />
      </div>
      <ul className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-700 dark:border-gray-700">
        {!displayPosts.length && 'No posts found.'}

        {displayPosts.map((frontMatter) => {
          const { slug, date, title } = frontMatter

          return (
            <li key={slug} className="py-4">
              <article>
                <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                  <div className="xl:col-span-3">
                    <h2 className="text-md mb-1 font-medium tracking-tight">
                      <Link
                        href={`/post/${slug}`}
                        className="text-gray-900 dark:text-gray-100"
                      >
                        <span>{title}</span>
                      </Link>
                    </h2>
                  </div>
                  <div className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400 xl:text-end">
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
