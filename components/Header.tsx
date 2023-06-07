import clsx from 'clsx'
import { headerNavLinks } from 'data/headerNavLinks'
import NextImage from 'next/image'
import { useRouter } from 'next/router'
import { AnalyticsLink } from './AnalyticsLink'
import { Link } from './Link'
import { ThemeSwitcher } from './ThemeSwitcher'
import { MenuToggler } from './MenuToggler'

export function Header({ onToggleNav }: { onToggleNav: () => void }) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 overflow-x-hidden bg-[#f7f5f3]/75 py-3 backdrop-blur dark:bg-dark/75">
      <div className="mx-auto px-3 md:px-0 flex max-w-2xl items-center justify-between">
        <div>
          <Link href="/" aria-label="Chao's Blog">
            <div className="flex items-center justify-between">
              <div className="mr-3 flex items-center">
                <NextImage
                  src="/static/images/profile-square.jpg"
                  alt="Chao's Blog logo"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
              </div>
              <div className="font-medium">Chao's Site</div>
            </div>
          </Link>
        </div>
        <div className="flex items-center text-base leading-5">
          <div className="hidden space-x-2 sm:block">
            {headerNavLinks.map((link) => {
              const className = clsx(
                'inline-block rounded font-medium text-gray-900 dark:text-gray-100 py-1 px-2 sm:py-2 sm:px-3',
                router.pathname === link.href
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              )
              return (
                <Link key={link.title} href={link.href}>
                  <span className={className}>{link.title}</span>
                </Link>
              )
            })}
          </div>
          <AnalyticsLink />
          <ThemeSwitcher />
          <MenuToggler onToggleNav={onToggleNav} />
        </div>
      </div>
    </header>
  )
}
