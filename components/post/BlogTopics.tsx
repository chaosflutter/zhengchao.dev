import { Tag } from '../Tag'

export function BlogTopics({ topics }: { topics: string[] }) {
  if (!topics || topics.length === 0) {
    return null
  }

  return (
    <div className="mt-2 flex flex-wrap text-gray-500 dark:text-gray-400">
      <span className="mr-2">{topics.length > 1 ? 'topics' : 'topic'}:</span>
      {topics.map((topic) => (
        <Tag key={topic} text={topic} />
      ))}
    </div>
  )
}
