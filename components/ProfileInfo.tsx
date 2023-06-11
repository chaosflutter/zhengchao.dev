import { Twemoji } from '~/components/Twemoji'
import { siteMetadata } from '~/data/siteMetadata'

export function ProfileCardInfo() {
  return (
    <div className="hidden py-6 md:block md:px-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        Chaosflutter
      </h3>
      <h5 className="py-2 text-gray-700 dark:text-gray-400">
        Coder | Builder | Gamer
      </h5>
      <div className="mt-4 mb-2 space-y-4">
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            Twitter:
            <a
              target="_blank"
              href="https://twitter.com/zhchaozju"
              rel="noreferrer"
              className="hover:underline"
            >
              @zhchaozju
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            Github:
            <a
              target="_blank"
              href="https://github.com/wbirdss"
              rel="noreferrer"
              className="hover:underline"
            >
              @wbirdss
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            Medium:
            <a
              target="_blank"
              href="https://medium.com/@ivzhangyan"
              rel="noreferrer"
              className="hover:underline"
            >
              Chaosflutter
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            Youtube:
            <a
              target="_blank"
              href="https://www.youtube.com/channel/UCYVxyn6DHeXxYxC75_ty9Ng"
              rel="noreferrer"
              className="hover:underline"
            >
              Chao's Channel
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
