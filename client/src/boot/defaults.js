import { boot } from 'quasar/wrappers'
import { Notify } from 'quasar'
import webSocketService from 'src/services/ws/baseWebSocketService.js'
import { trackClicks, trackError } from 'src/services/stellarTrack.js'

// Allow Cypress access to the Pinia stores
import { useAuthStore } from 'src/stores/authStore.js'
import { useConfigStore } from 'src/stores/configStore.js'

let globalWebSocket = null
let pendingClickContext = null
let lastClickContext = null

export default boot(async ({ app, router }) => {
  const configStore = useConfigStore()
  // Cypress automatically sets window.Cypress by default
  if (window.Cypress) {
    const authStore = useAuthStore()
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
    // Setup the last clicked item for click tracking and errors
    const target = event.target
    const clickable = target.closest('[data-cy], [id], button, a, input, textarea, [data-stellar-track]')

    if (clickable) {
      const context = {
        dataCy: clickable.dataset.cy || null,
        id: clickable.id || null,
        className: clickable.className || null,
        tagName: clickable.tagName,
        text: (clickable.innerText || clickable.value || '').trim().substring(0, 100),
        href: clickable.getAttribute('href') || null
      }

      lastClickContext = context
      pendingClickContext = context

      // Clear pending after 200ms (covers async errors)
      setTimeout(() => {
        if (pendingClickContext === context) {
          pendingClickContext = null
        }
      }, 200)
    }
    // trackClicks only tracks elements with data-cy
    trackClicks(event, router)
  }, true)

  app.config.errorHandler = (err, vm, info) => {
    // handle error
    // `info` is a Vue-specific error info, e.g. which lifecycle hook
    // the error was found in.

    // Use pending context (the click that caused the error)
    const clicked = pendingClickContext || lastClickContext

    // Use the Axios response when there is an api error
    err.name = err.name === 'AxiosError' ? 'API Error' : err.name
    err.message = err.response?.data?.error ? err.response.data.error : err.message
    err.correlationId = err.response?.data?.correlationId
    console.dir(err)

    // Save the error
    trackError(err, vm, info, clicked, err.correlationId)

    // Notify the user of the error
    const correlationText = err.correlationId ? `<div style="font-size: .8rem; margin-top: 8px;">Correlation Id <br /> ${err.correlationId}</div>` : ''
    const notifyMessage = `
      <div style="font-size: 1.1rem; font-weight: bold;">${err.name}</div>
      <div style="font-size: .7rem; margin-bottom: 5px;">${new Date().toLocaleString()}</div>
      <div style="font-size: 1rem; margin-top: 8px;">${err.message.substring(0, 300)}</div>
      ${correlationText}
      ${clicked?.dataCy ? `
        <div style="font-size: .8rem; margin-top: 8px;">
          <strong>Last Clicked:</strong> <code>${clicked.dataCy}</code>
        </div>
      ` : ''}
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
