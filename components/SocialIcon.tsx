import type { AnchorHTMLAttributes } from 'react'
import Facebook from '~/icons/facebook.svg'
import Github from '~/icons/github.svg'
import Linkedin from '~/icons/linkedin.svg'
import Mail from '~/icons/mail.svg'
import Twitter from '~/icons/twitter.svg'
import Youtube from '~/icons/youtube.svg'
import type { SocialIconProps } from '~/types'

export const SocialIconsMap = {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
}

export function SocialIcon({ name, href }: SocialIconProps) {
  const SocialSvg = SocialIconsMap[name]
  const attrs: AnchorHTMLAttributes<HTMLAnchorElement> = {
    href,
    target: name !== 'Mail' ? '_blank' : '_self',
    rel: 'noopener noreferrer',
  }

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      {...attrs}
    >
      <span className="sr-only">{name}</span>
      <SocialSvg
        className={`h-6 w-6 fill-current text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400`}
      />
    </a>
  )
}
