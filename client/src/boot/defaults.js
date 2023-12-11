import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { serializeError } from 'serialize-error'
import skylog from 'src/services/admin/skylog/postSkyLog'

// Allow Cypress to use the Vuex Store
import store from 'src/store/index.js'
// Cypress automatically sets window.Cypress by default
if (window.Cypress) {
  window.__store__ = store
}

export default boot(async ({ app }) => {
  app.config.errorHandler = (err, vm, info) => {
    // handle error
    // `info` is a Vue-specific error info, e.g. which lifecycle hook
    // the error was found in. Only available in 2.2.0+
    // console.log(JSON.parse(err))
    console.error(err)

    const sError = serializeError(err)

    const errorObj = {
      error: sError,
      elClassName: vm.$el ? vm.$el.className : null,
      vueInfo: info
    }

    try {
      skylog.trackError(errorObj)
    } catch (error) {
      console.log(error)
    }

    Notify.create({
      message: err.message,
      multiLine: true,
      html: true,
      type: 'negative',
      timeout: 0,
      actions: [
        { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
      ]
    })
  }
})
