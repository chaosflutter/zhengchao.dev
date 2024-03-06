import { slug } from 'github-slugger'
import { toString } from 'mdast-util-to-string'
import { visit } from 'unist-util-visit'
import type {
  RemarkTocHeadingOptions,
  UnistNodeType,
  UnistTreeType,
} from '~/types'

export function remarkTocHeading(options: RemarkTocHeadingOptions) {
  return (tree: UnistTreeType) =>
    visit(tree, 'heading', (node: UnistNodeType) => {
      const textContent = toString(node)
      options.exportRef.push({
        value: textContent,
        url: '#' + slug(textContent),
        depth: node.depth,
      })
    })
}
