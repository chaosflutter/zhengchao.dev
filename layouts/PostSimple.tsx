import { BlogMeta } from '~/components/blog/BlogMeta'
import { Comments } from '~/components/comments'
import { PageTitle } from '~/components/PageTitle'
import { ScrollTopButton } from '~/components/ScrollTopButton'
import { SectionContainer } from '~/components/SectionContainer'
import { BlogSeo } from '~/components/SEO'
import { BlogTags } from '~/components/blog/BlogTags'
import { SocialButtons } from '~/components/SocialButtons'
import { siteMetadata } from '~/data/siteMetadata'
import type { PostSimpleLayoutProps } from '~/types'

export function PostSimple(props: PostSimpleLayoutProps) {
  const { frontMatter, type, children, authorDetails, commentConfig } = props
  const { date, title, slug, fileName, tags, readingTime } = frontMatter
  const postUrl = `${siteMetadata.siteUrl}/${type}/${slug}`

  return (
    <SectionContainer>
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
              <dl>
                <div>
                  <dt className="sr-only">Published on</dt>
                  <BlogMeta date={date} slug={slug} readingTime={readingTime} />
                  <BlogTags tags={tags} />
                </div>
              </dl>
            </div>
          </header>
          <div className="pb-8">
            <div className="prose prose-lg pb-8 dark:prose-dark md:prose-xl">
              {children}
            </div>
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
    </SectionContainer>
  )
}

export default PostSimple
