import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { serializeError } from 'serialize-error'
// import skylog from 'src/services/admin/skylog/postSkyLog'

// Allow Cypress access to the Pinia stores
import { useAuthStore } from 'src/stores/authStore.js'
const authStore = useAuthStore()
import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()
// Cypress automatically sets window.Cypress by default
if (window.Cypress) {
  window.store = { authStore, configStore }
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
    console.log(errorObj)

    // try {
    //   skylog.trackError(errorObj)
    // } catch (error) {
    //   console.log(error)
    // }

    const notifyMessage = `
        <div style="font-size: 1.1rem; font-weight: bold;">${err.name}</div>
        <div style="font-size: .7rem; margin-bottom: 5px;">${new Date()}</div>
        <div> Status Code: ${err.status}</div>
        <div>${err.message.substring(0, 500)}</div>
    `
    Notify.create({
      message: notifyMessage,
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
