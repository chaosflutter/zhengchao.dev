import { PageSeo } from 'components/SEO'
import fs from 'fs'
import path from 'path'
import { siteMetadata } from '~/data/siteMetadata'
import { ListLayout } from '~/layouts/ListLayout'
import { generateRss } from '~/libs/generate-rss'
import { getAllFilesFrontMatter } from '~/libs/mdx'
import { getAllTopics } from '~/libs/topics'
import type { BlogFrontMatter } from '~/types'
import { kebabCase } from '~/utils/kebab-case'

export function getStaticPaths() {
  const topics = getAllTopics('posts')

  return {
    paths: Object.keys(topics).map((topic) => ({
      params: {
        topic,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps({
  params,
}: {
  params: { topic: string }
}) {
  const allPosts = getAllFilesFrontMatter('posts')
  const filteredPosts = allPosts.filter(
    (post) =>
      post.draft !== true &&
      post.topics.map((t) => kebabCase(t)).includes(params.topic)
  )

  // rss
  const root = process.cwd()
  const rss = generateRss(filteredPosts, `topics/${params.topic}/feed.xml`)
  const rssPath = path.join(root, 'public', 'topics', params.topic)

  fs.mkdirSync(rssPath, { recursive: true })
  fs.writeFileSync(path.join(rssPath, 'feed.xml'), rss)

  return { props: { posts: filteredPosts, topic: params.topic } }
}

export default function Tag({
  posts,
  topic,
}: {
  posts: BlogFrontMatter[]
  topic: string
}) {
  // convert space to dash
  const title = topic.split(' ').join('-')

  return (
    <>
      <PageSeo
        title={`${topic} - ${siteMetadata.title}`}
        description={`${topic} topics - ${siteMetadata.title}`}
      />
      <ListLayout posts={posts} title={`Topic: #${title}`} />
    </>
  )
}
