import { siteMetadata } from '~/data/siteMetadata'

export function ProfileCardInfo() {
  const { twitter, github, medium, youtube } = siteMetadata
  return (
    <div className="hidden py-6 md:block md:px-3">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        Chaosflutter
      </h3>
      <h5 className="py-2 text-gray-700 dark:text-gray-400">
        coder | builder | gamer
      </h5>
      <div className="mt-4 mb-2 space-y-4">
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            <b>Twitter: </b>
            <a
              target="_blank"
              href={twitter}
              rel="noreferrer"
              className="hover:underline"
            >
              zhchaozju
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            <b>Github: </b>
            <a
              target="_blank"
              href={github}
              rel="noreferrer"
              className="hover:underline"
            >
              wbirdss
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            <b>Medium: </b>
            <a
              target="_blank"
              href={medium}
              rel="noreferrer"
              className="hover:underline"
            >
              Chaosflutter
            </a>
          </p>
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-200">
          <p>
            <b>Youtube: </b>
            <a
              target="_blank"
              href={youtube}
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
