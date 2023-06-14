import fs from 'fs'
import sizeOf from 'image-size'
import { visit } from 'unist-util-visit'
import type { UnistImageNode, UnistNodeType, UnistTreeType } from '~/types'

export function remarkImgToJsx() {
  return (tree: UnistTreeType) => {
    return visit(tree, 'paragraph', (node: UnistNodeType) => {
      // Only visit `p` tags that contain an `img` element
      const hasImage = node.children.some((n) => n.type === 'image')
      if (!hasImage) return

      const imageNode = node.children.find(
        (n) => n.type === 'image'
      ) as UnistImageNode

      // Convert original `image` to `next/image` for local files only
      const imageLocalPath = `${process.cwd()}/public${imageNode.url}`
      if (fs.existsSync(imageLocalPath)) {
        const dimensions = sizeOf(imageLocalPath)
        imageNode.type = 'mdxJsxFlowElement'
        imageNode.name = 'Image'
        imageNode.attributes = [
          { type: 'mdxJsxAttribute', name: 'alt', value: imageNode.alt },
          { type: 'mdxJsxAttribute', name: 'src', value: imageNode.url },
          { type: 'mdxJsxAttribute', name: 'width', value: dimensions.width },
          { type: 'mdxJsxAttribute', name: 'height', value: dimensions.height },
        ]
        const isThumbnail = imageNode.alt === 'thumbnail-image'
        if (isThumbnail) {
          imageNode.attributes.push({
            type: 'mdxJsxAttribute',
            name: 'id',
            value: 'thumbnail-image',
          })
        }

        // Change node type from p to div to avoid nesting error
        node.type = 'div'
        node.children = [imageNode]
      }
    })
  }
}
