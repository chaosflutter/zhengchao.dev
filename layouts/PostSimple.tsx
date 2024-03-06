import { Comments } from '~/components/comments'
import { PageTitle } from '~/components/PageTitle'
import { BlogMeta } from '~/components/post/BlogMeta'
import { BlogTopics } from '~/components/post/BlogTopics'
import { ScrollTopButton } from '~/components/ScrollTopButton'
import { BlogSeo } from '~/components/SEO'
import { SocialButtons } from '~/components/SocialButtons'
import { siteMetadata } from '~/data/siteMetadata'
import type { PostSimpleLayoutProps } from '~/types'

function PostSimple(props: PostSimpleLayoutProps) {
  const { frontMatter, type, children, authorDetails, commentConfig } = props
  const { date, title, slug, fileName, topics, readingTime, origin, gzh, jj } =
    frontMatter
  const postUrl = `${siteMetadata.siteUrl}/${type}/${slug}`

  return (
    <>
      <BlogSeo
        url={`${siteMetadata.siteUrl}/${type}/${slug}`}
        authorDetails={authorDetails}
        {...frontMatter}
      />
      <ScrollTopButton />
      <article>
        <div>
          <header className="py-6 lg:py-10">
            <div className="space-y-4">
              <PageTitle>{title}</PageTitle>
              <div className="flex justify-between items-end">
                <BlogMeta date={date} slug={slug} readingTime={readingTime} />
                {gzh && (
                  <div className="text-sm mt-2 font-medium text-gray-500 dark:text-gray-400">
                    同步于公众号:{' '}
                    <a className="underline" href={gzh} target="_blank">
                      长期主义乐观派
                    </a>
                  </div>
                )}
                {jj && (
                  <div className="text-sm mt-2 font-medium text-gray-500 dark:text-gray-400">
                    同步于掘金:{' '}
                    <a className="underline" href={jj} target="_blank">
                      chaosflutter
                    </a>
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="pb-8">
            <div className="prose prose-lg pb-8 dark:prose-dark">
              {children}
            </div>
            {origin && (
              <div className="mb-2 text-gray-500 dark:text-gray-400">
                Translated from：
                <a href={origin} target="_blank">
                  {origin}
                </a>
              </div>
            )}
            <BlogTopics topics={topics} />
            <div className="border-t border-gray-200 dark:border-gray-700">
              <SocialButtons
                postUrl={postUrl}
                title={title}
                fileName={fileName}
              />
              <Comments frontMatter={frontMatter} config={commentConfig} />
            </div>
          </div>
        </div>
      </article>
    </>
  )
}

export default PostSimple
