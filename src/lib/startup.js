import lang from '@/lib/lang'

/**
 * Mount the app once the translations are in place, so that no page shows
 * English first. The router starts only then: a navigation ending first would
 * render its page in the first pass of the app, out of the document, where its
 * teleports find no target.
 */
export const startApp = (app, router) =>
  lang.applyStartupLocale().finally(() => {
    app.use(router)
    app.mount('#app')
  })
