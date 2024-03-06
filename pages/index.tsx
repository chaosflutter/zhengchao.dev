import { PageSeo } from 'components/SEO'
import { FeaturedPosts } from '~/components/homepage/FeaturedPosts'
import { TypedBios } from '~/components/homepage/TypedBios'
import { ProfileCard } from '~/components/ProfileCard'
import { ScrollTopButton } from '~/components/ScrollTopButton'
import { siteMetadata } from '~/data/siteMetadata'
import { getAllFilesFrontMatter } from '~/libs/mdx'
import type { BlogFrontMatter } from '~/types'

export function getStaticProps() {
  const posts = getAllFilesFrontMatter('posts')

  return { props: { posts } }
}

export default function Home({ posts }: { posts: BlogFrontMatter[] }) {
  return (
    <>
      <PageSeo
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <div className="mt-8 divide-y divide-gray-200 dark:divide-gray-700">
        <div className="my-4 md:grid md:grid-cols-3 md:pt-6 md:pb-8">
          <div className="hidden md:block">
            <ProfileCard />
          </div>
          <div className="md:col-span-2 md:pl-8">
            <div className="text-lg leading-8 text-gray-600 dark:text-gray-400">
              <TypedBios />
            </div>
          </div>
        </div>
      </div>
      <FeaturedPosts posts={posts} />
      <ScrollTopButton />
    </>
  )
}
