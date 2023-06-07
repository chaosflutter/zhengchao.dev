import { Tag } from '../Tag'

export function BlogTags({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap mt-2">
      <span className="mr-2">{tags.length > 1 ? 'topics' : 'topic'}:</span>
      {tags.map((tag) => (
        <Tag key={tag} text={tag} />
      ))}
    </div>
  )
}
