import { siteMetadata } from '~/data/siteMetadata'
import Twitter from '~/icons/twitter.svg'
import Github from '~/icons/github.svg'
import Medium from '~/icons/medium.svg'
import Mail from '~/icons/mail.svg'

const socialMediums = [
  {
    name: 'Twitter',
    url: siteMetadata.twitter,
    Svgr: Twitter,
  },
  {
    name: 'GitHub',
    url: siteMetadata.github,
    Svgr: Github,
  },
  {
    name: 'Medium',
    url: siteMetadata.medium,
    Svgr: Medium,
  },
  {
    name: 'Email',
    url: `mailto:${siteMetadata.email}`,
    Svgr: Mail,
  },
]

export function ProfileCardInfo() {
  const { twitter, github, medium } = siteMetadata
  return (
    <div className="hidden py-6 md:block md:px-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        Chad Cheng
      </h3>
      <div className="mt-4 mb-2 grid grid-cols-2 gap-4">
        {socialMediums.map(({ name, url, Svgr }) => (
          <a
            target="_blank"
            href={url}
            rel="noreferrer"
            className="hover:underline flex items-center"
            key={name}
          >
            <div className="mr-1">
              <Svgr width="14" height="14" />
            </div>
            {name}
          </a>
        ))}
      </div>
    </div>
  )
}
