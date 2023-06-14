import { Link } from '~/components/Link'
import { PageSeo } from '~/components/SEO'
import { Tag } from '~/components/Tag'
import { siteMetadata } from '~/data/siteMetadata'
import { getAllTopics } from '~/libs/topics'
import type { TopicsCount } from '~/types'
import { kebabCase } from '~/utils/kebab-case'

export function getStaticProps() {
  const topics = getAllTopics('posts')
  return { props: { topics } }
}

export default function Topics({ topics }: { topics: TopicsCount }) {
  const sortedTopics = Object.keys(topics).sort((a, b) => topics[b] - topics[a])

  return (
    <>
      <PageSeo
        title={`Tags - ${siteMetadata.author}`}
        description="Things I blog about"
      />
      <div className="flex flex-col items-start justify-start divide-y divide-gray-200 dark:divide-gray-700 md:mt-24 md:flex-row md:items-center md:justify-center md:space-x-6 md:divide-y-0">
        <div className="space-x-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:border-r-2 md:px-6 md:text-6xl md:leading-14">
            Topics
          </h1>
        </div>
        <div className="flex max-w-lg flex-wrap">
          {Object.keys(topics).length === 0 && 'No tags found.'}
          {sortedTopics.map((topic) => {
            return (
              <div key={topic} className="mt-2 mb-2 mr-5">
                <Tag text={topic} />
                <Link
                  href={`/topics/${kebabCase(topic)}`}
                  className="-ml-2 text-sm font-semibold uppercase text-gray-600 dark:text-gray-300"
                >
                  ({topics[topic]})
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
