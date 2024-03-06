import { FacebookShareButton, TwitterShareButton } from 'react-share'
import { siteMetadata } from '~/data/siteMetadata'
import FacebookIcon from '~/icons/facebook.svg'
import TwitterIcon from '~/icons/twitter.svg'
import type { SocialButtonsProps } from '~/types'
import { Link } from './Link'

export function SocialButtons({
  postUrl,
  title,
  fileName,
}: SocialButtonsProps) {
  const creatEditOnGithubUrl = (fileName: string) =>
    `${siteMetadata.siteRepo}/blob/main/data/posts/${fileName}`
  const createDiscussonTwitterUrl = (postUrl: string) =>
    `https://twitter.com/search?q=${encodeURIComponent(postUrl)}`

  return (
    <div className="items-center justify-between pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300 md:flex">
      <div className="mb-6 md:mb-0">
        <Link
          href={createDiscussonTwitterUrl(postUrl)}
          rel="nofollow"
          className="hover:underline hidden"
        >
          {'Discuss on Twitter'}
        </Link>
        {/* {` • `} */}
        <Link href={creatEditOnGithubUrl(fileName)} className="hover:underline">
          {'View on GitHub'}
        </Link>
      </div>
      <div></div>
      <div className="flex justify-end">
        <TwitterShareButton
          url={postUrl}
          title={title}
          via={siteMetadata.socialAccounts.twitter}
          className="ml-2 flex items-center overflow-hidden rounded !bg-twitter !p-1.5 hover:opacity-90"
        >
          <TwitterIcon className="h-5 w-5" fill="#fff" />
          <span className="ml-2.5 mr-1.5 font-extrabold text-white">Tweet</span>
        </TwitterShareButton>
        <FacebookShareButton
          url={postUrl}
          quote={title}
          className="ml-2 hidden items-center overflow-hidden rounded !bg-facebook !p-1.5 hover:opacity-90"
        >
          <FacebookIcon className="h-5 w-5" fill="#fff" />
          <span className="ml-2.5 mr-1.5 font-extrabold text-white">Share</span>
        </FacebookShareButton>
      </div>
    </div>
  )
}
