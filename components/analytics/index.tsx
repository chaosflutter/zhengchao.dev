import { siteMetadata } from '~/data/siteMetadata'
import { GAScript } from './GoogleAnalytics'
import { SimpleAnalyticsScript } from './SimpleAnalytics'
import { UmamiScript } from './Umami'

const isProduction = process.env.NODE_ENV === 'production'

export function Analytics() {
  if (isProduction) {
    const { analytics } = siteMetadata
    const { simpleAnalytics, umamiWebsiteId, googleAnalyticsId } = analytics
    return (
      <>
        {simpleAnalytics && <SimpleAnalyticsScript />}
        {umamiWebsiteId && <UmamiScript />}
        {googleAnalyticsId && <GAScript />}
      </>
    )
  }
  return null
}
