import { PageSeo } from 'components/SEO'
import { siteMetadata } from '~/data/siteMetadata'
import { SnippetLayout } from '~/layouts/SnippetLayout'
import { getAllFilesFrontMatter } from '~/libs/mdx'
import type { SnippetFrontMatter } from '~/types'

export async function getStaticProps() {
  const snippets = getAllFilesFrontMatter('snippets')
  return { props: { snippets } }
}

export default function Snippet({
  snippets,
}: {
  snippets: SnippetFrontMatter[]
}) {
  const description = 'Reuseable code snippets collected by me'
  return (
    <>
      <PageSeo
        title={`Snippets - ${siteMetadata.author} - ${siteMetadata.title}`}
        description={description}
      />
      <SnippetLayout snippets={snippets} description={description} />
    </>
  )
}
