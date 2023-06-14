import { useState } from 'react'
import { PostListItem } from '~/components/PostListItem'
import { PostsSearch } from '~/components/PostsSearch'
import type { ListLayoutProps } from '~/types'

export function ListLayout(props: ListLayoutProps) {
  const { posts, title } = props
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    const searchContent =
      frontMatter.title + frontMatter.summary + frontMatter.topics.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If posts exist, display it if no searchValue is specified
  const displayPosts =
    posts.length > 0 && !searchValue ? posts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-4 pt-6 pb-12 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            I write mostly about web and game development, sometimes about
            reading, writing, and learning.
          </p>
          <PostsSearch onChange={setSearchValue} />
        </div>
        <ul className="space-y-10 py-12">
          {!filteredBlogPosts.length && 'No posts found.'}
          {displayPosts.map((frontMatter) => (
            <PostListItem key={frontMatter.slug} frontMatter={frontMatter} />
          ))}
        </ul>
      </div>
    </>
  )
}

export default ListLayout
