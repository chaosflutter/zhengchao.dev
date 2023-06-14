import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import type { MdxFrontMatter, TopicsCount } from '~/types'
import { kebabCase } from '~/utils/kebab-case'
import { getFiles } from './files'

export function getAllTopics(type: string): TopicsCount {
  const files = getFiles(type)
  const root = process.cwd()
  const topicsCount: TopicsCount = {}

  // Iterate through each post, putting all found topics into `topics`
  files.forEach((file, i) => {
    const source = fs.readFileSync(path.join(root, 'data', type, file), 'utf8')
    const grayMatterData = matter(source)
    const data = grayMatterData.data as MdxFrontMatter
    if (data.topics && data.draft !== true) {
      data.topics.forEach((topic: string) => {
        const formattedTag = kebabCase(topic)
        if (formattedTag in topicsCount) {
          topicsCount[formattedTag] += 1
        } else {
          topicsCount[formattedTag] = 1
        }
      })
    }
  })

  return topicsCount
}
