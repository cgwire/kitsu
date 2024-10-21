import * as Sentry from '@sentry/vue'

import { name, version } from '@/../package.json'

export default {
  init(app, router, { dsn, sampleRate = 0.1 }) {
    Sentry.init({
      Vue: app,
      dsn,
      enabled: process.env.NODE_ENV === 'production',
      release: `${name}@${version}`,
      integrations: [
        Sentry.browserTracingIntegration({
          router
        })
      ],
      tracesSampleRate: sampleRate // capture Trace for % of transactions for performance monitoring
    })
  }
}
