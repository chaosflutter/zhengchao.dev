import { PageSeo } from 'components/SEO'
import { FeaturedPosts } from '~/components/homepage/FeaturedPosts'
import { TypedBios } from '~/components/homepage/TypedBios'
import { ProfileCard } from '~/components/ProfileCard'
import { siteMetadata } from '~/data/siteMetadata'
import { getAllFilesFrontMatter } from '~/libs/mdx'
import type { BlogFrontMatter } from '~/types'

export function getStaticProps() {
  const posts = getAllFilesFrontMatter('posts')

  // display featured posts later on
  return { props: { posts } }
}

export default function Home({ posts }: { posts: BlogFrontMatter[] }) {
  return (
    <>
      <PageSeo
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <FeaturedPosts posts={posts} />
    </>
  )
}
