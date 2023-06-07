import { siteMetadata } from '~/data/siteMetadata'
import { DevIcon } from './DevIcon'
import { Link } from './Link'

export function BuiltWith() {
  return (
    <div className="flex items-center space-x-2">
      <span className="mr-2 text-gray-500 dark:text-gray-400">Built with</span>
      <div className="flex space-x-2">
        <Link href="https://nextjs.org?ref=chaosflutter.xyz">
          <DevIcon type="NextJS" className="h-5 w-5" />
        </Link>
        <Link href="https://tailwindcss.com?ref=chaosflutter.xyz">
          <DevIcon type="TailwindCSS" className="h-5 w-5" />
        </Link>
        <Link href="https://www.prisma.io?ref=chaosflutter.xyz">
          <DevIcon type="Prisma" className="h-5 w-5" />
        </Link>
        <Link href="https://www.typescriptlang.org?ref=chaosflutter.xyz">
          <DevIcon type="Typescript" className="h-5 w-5" />
        </Link>
      </div>
      <span className="hidden px-1 text-gray-400 dark:text-gray-500">-</span>
      <Link
        href={siteMetadata.siteRepo}
        className="hidden text-gray-500 underline underline-offset-4 dark:text-gray-400"
      >
        <span>View source</span>
      </Link>
    </div>
  )
}
