import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import { serializeError } from 'serialize-error'
import webSocketService from 'src/services/ws/baseWebSocketService.js'
import { trackClicks } from 'src/services/stellarTrack.js'

// Allow Cypress access to the Pinia stores
import { useAuthStore } from 'src/stores/authStore.js'
import { useConfigStore } from 'src/stores/configStore.js'

let globalWebSocket = null
export default boot(async ({ app }) => {
  // Cypress automatically sets window.Cypress by default
  if (window.Cypress) {
    const authStore = useAuthStore()
    const configStore = useConfigStore()
    window.store = { authStore, configStore }
  }

  // Initialize WebSocket connection
  webSocketService.connect().catch((error) => {
    console.error('Failed to connect WebSocket:', error)
  })

  // Make WebSocket service globally available
  app.config.globalProperties.$webSocket = webSocketService
  globalWebSocket = webSocketService // Store for non-Vue access

  // Add global click listener
  document.addEventListener('click', (event) => {
    // trackClicks only tracks elements with data-stellar-track
    trackClicks(event)
  })

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

// Export a function to access the WebSocket service
export function getWebSocketService () {
  return globalWebSocket
}
