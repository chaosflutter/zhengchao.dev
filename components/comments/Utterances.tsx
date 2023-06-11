import { useTheme } from 'next-themes'
import { useState } from 'react'
import { UTTERANCES_COMMENTs_ID } from '~/constant'
import type { UtterancesProps } from '~/types'

const Utterances = ({ config }: UtterancesProps) => {
  const [loaded, setLoaded] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  const { lightTheme, darkTheme } = config
  const isDark = theme === 'dark' || resolvedTheme === 'dark'
  const uttrTheme = isDark ? darkTheme : lightTheme

  function handleLoadComments() {
    setLoaded(true)
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.setAttribute('repo', config.repo)
    script.setAttribute('issue-term', config.issueTerm)
    script.setAttribute('label', config.label)
    script.setAttribute('theme', uttrTheme)
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    const commentsNode = document.getElementById(UTTERANCES_COMMENTs_ID)
    if (commentsNode) commentsNode.appendChild(script)

    return () => {
      const commentsNode = document.getElementById(UTTERANCES_COMMENTs_ID)
      if (commentsNode) commentsNode.innerHTML = ''
    }
  }

  // Added `relative` to fix a weird bug with `utterances-frame` position
  return (
    <div className="pt-6 pb-6 text-center text-gray-700 dark:text-gray-300">
      {!loaded && <button onClick={handleLoadComments}>Load Comments</button>}
      <div className="utterances-frame relative" id={UTTERANCES_COMMENTs_ID} />
    </div>
  )
}

export default Utterances
