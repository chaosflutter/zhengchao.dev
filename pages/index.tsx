import { PageSeo } from 'components/SEO'
import { Posts } from '~/components/homepage/Posts'
import { Heading } from '~/components/homepage/Heading'
import { TypedBios } from '~/components/homepage/TypedBios'
import { ProfileCard } from '~/components/ProfileCard'
import { siteMetadata } from '~/data/siteMetadata'
import { getAllFilesFrontMatter } from '~/libs/mdx'
import type { BlogFrontMatter } from '~/types'

export function getStaticProps() {
  const posts = getAllFilesFrontMatter('blog')
  return { props: { posts } }
}

export default function Home({ posts }: { posts: BlogFrontMatter[] }) {
  return (
    <>
      <PageSeo
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <div className="mt-8 divide-y divide-gray-200 dark:divide-gray-700 md:mt-16">
        <div className="my-4 md:pt-6 md:pb-8 md:grid md:grid-cols-3">
          <div className="hidden md:block">
            <ProfileCard />
          </div>
          <div className="md:pl-8 md:col-span-2">
            <div className="text-lg leading-8 text-gray-600 dark:text-gray-400">
              <Heading />
              <TypedBios />
            </div>
          </div>
        </div>
      </div>
      <Posts posts={posts} />
    </>
  )
}
