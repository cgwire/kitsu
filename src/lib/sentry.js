import Vue from 'vue/dist/vue'
import * as Sentry from '@sentry/vue'

import { name, version } from '@/../package.json'

export default {
  init(router, { dsn, sampleRate = 0.1 }) {
    if (Sentry.getClient()) {
      // avoid duplicate init (e.g. when hot-reloading)
      Sentry.close()
    }

    Sentry.init({
      Vue,
      dsn,
      enabled: process.env.NODE_ENV === 'production',
      release: `${name}@${version}`,
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router)
        })
      ],
      tracesSampleRate: sampleRate // capture Trace for % of transactions for performance monitoring
    })
  }
}
