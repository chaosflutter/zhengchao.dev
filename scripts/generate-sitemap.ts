import fs from 'fs'
import { globby } from 'globby'
import prettier from 'prettier'

const SITE_URL = 'https://zhengchao.dev'

;(async () => {
  console.log('Generating sitemap...')
  const prettierConfig = await prettier.resolveConfig('./.prettierrc.js')
  const pages = await globby([
    'pages/*.tsx',
    'data/posts/**/*.mdx',
    'data/posts/**/*.md',
    'public/topics/**/*.xml',
    '!pages/_*.tsx',
    '!pages/api',
  ])

  const sitemap = `
			<?xml version="1.0" encoding="UTF-8"?>
			<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
				${pages
          .map((page) => {
            const path = page
              .replace('pages/', '/')
              .replace('data/posts', '/post')
              .replace('public/', '/')
              .replace('.ts', '')
              .replace('.mdx', '')
              .replace('.md', '')
              .replace('/feed.xml', '')
            const route = path === '/index' ? '' : path
            if (page === `pages/404.ts` || page === `pages/post/[...slug].ts`) {
              return
            }
            return `<url><loc>${SITE_URL}${route}</loc></url>\n`
          })
          .join('')}
			</urlset>
    `

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  })

  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formatted)

  console.log('Sitemap generated successfully in `public/sitemap.xml`.')
})()
