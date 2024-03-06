import { siteMetadata } from '~/data/siteMetadata'
import Github from '~/icons/github.svg'
import Mail from '~/icons/mail.svg'
import Medium from '~/icons/medium.svg'
import Twitter from '~/icons/twitter.svg'

const socialMediums = [
  {
    name: 'twitter',
    url: siteMetadata.twitter,
    Svgr: Twitter,
  },
  {
    name: 'github',
    url: siteMetadata.github,
    Svgr: Github,
  },
  {
    name: 'medium',
    url: siteMetadata.medium,
    Svgr: Medium,
  },
  {
    name: 'email',
    url: `mailto:${siteMetadata.email}`,
    Svgr: Mail,
  },
]
export function Footer() {
  return (
    <footer>
      <div className="mt-16 mb-8 items-center justify-between space-y-4 md:mb-10 md:flex md:space-y-0">
        <div className="my-2 flex space-x-2">
          {socialMediums.map(({ name, url, Svgr }) => (
            <a
              target="_blank"
              href={url}
              rel="noreferrer"
              className="hover:underline flex items-center"
              key={name}
            >
              <div className="mr-1 mt-1">
                <Svgr width="14" height="14" />
              </div>
            </a>
          ))}
        </div>
        <div className="my-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`Copyright © ${new Date().getFullYear()}`}</div>
          <span>{` • `}</span>
          <span>{siteMetadata.footerTitle}</span>
        </div>
      </div>
    </footer>
  )
}
