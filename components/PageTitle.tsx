import type { PageTitleProps } from '~/types'

export function PageTitle({ children }: PageTitleProps) {
  return (
    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 lg:text-[42px] lg:leading-13">
      {children}
    </h1>
  )
}
