import { Platform, Screen } from 'quasar'
import { useAuthStore } from 'src/stores/authStore.js'
import { useConfigStore } from 'src/stores/configStore.js'
import { getWebSocketService } from 'src/boot/defaults.js'
import { serializeError } from 'serialize-error'

function getDefaultTrackingData () {
  const authStore = useAuthStore()
  const configStore = useConfigStore()
  const width = Screen.width
  const pInfo = { ...Platform.is }

  configStore.stellarTrack.deviceId = configStore.stellarTrack.deviceId ? configStore.stellarTrack.deviceId : crypto.randomUUID()
  configStore.stellarTrack.sessionId = configStore.stellarTrack.sessionId ? configStore.stellarTrack.sessionId : crypto.randomUUID()

  return {
    browser: pInfo.name,
    browserVersion: pInfo.version,
    darkMode: configStore.darkMode,
    deviceId: configStore.stellarTrack.deviceId,
    deviceType: pInfo.mobile ? (width.value >= 600 && width.value <= 1024 ? 'tablet' : 'mobile') : 'desktop',
    leftDrawerState: configStore.leftDrawerState,
    mobileDeviceType:
      pInfo.mobile ?
        (pInfo.ipad ? 'ipad' : pInfo.iphone ? 'iphone' : pInfo.kindle ? 'kindle' : pInfo.android ? 'android' : 'other') :
        '',
    os: pInfo.win ? 'windows' : pInfo.mac ? 'mac' : pInfo.android ? 'android' : pInfo.ios ? 'ios' : pInfo.linux ? 'linux' : pInfo.silk ? 'silk' : 'other',
    sessionId: configStore.stellarTrack.sessionId,
    timeStamp: new Date().toISOString(),
    userName: authStore.email
  }
}

// Message handler for the web socket connection.
// TODO: Used in the admin stellar track analytics pages
export function trackMessageHandle () {

}

// Setup in the beforeEach function src/router/index.js
export async function trackPageView (to, from) {
  const pageViewData = {
    fromUrl: from.path,
    fromUrlQuery: from.query,
    url: to.path,
    urlQuery: to.query,
    ...getDefaultTrackingData()
  }
  try {
    const webSocket = getWebSocketService()
    if (!webSocket.isConnected()) {
      await webSocket.connect()
    }
    webSocket.send('stellar-track', { type: 'pageView', data: pageViewData })
  } catch (error) {
    console.error('Failed to send page view data:', error)
  }
}

// Setup in src/boot/default.js
// Add: data-cy="label of what is being clicked" (We are using Cypress so this will be dual purpose)
// to any html element to track clicks
export function trackClicks (event, router) {
  // const stellarTrackItem = event.target.closest('[data-stellar-track]')
  const stellarTrackItem = event.target.closest('[data-cy]')

  if (stellarTrackItem) {
    const route = router?.currentRoute.value
    const clickData = {
      tagName: stellarTrackItem.tagName.toLowerCase(),
      id: stellarTrackItem.id || 'none',
      className: stellarTrackItem.className || 'none',
      dataCy: stellarTrackItem.dataset.cy,
      url: route?.path,
      urlQuery: route?.query,
      ...getDefaultTrackingData()
    }
    try {
      const webSocket = getWebSocketService()
      if (!webSocket.isConnected()) {
        webSocket.connect()
      }
      webSocket.send('stellar-track', { type: 'click', data: clickData })
    } catch (error) {
      console.log('Failed to send click data:', error)
    }
  }
}

export async function trackError (err, vm, info, lastClickedElement, correlationId) {
  console.dir(err)
  const sError = serializeError(err)
  const errorObj = {
    // Error core
    error: sError,
    correlationId,
    component: vm?.$options?.name || vm?.$options?._componentTag || 'Unknown',
    elClassName: vm?.$el?.className || null,
    vueInfo: info,

    // Context
    url: window.location.href,
    clickedElement: lastClickedElement ? {
      dataCy: lastClickedElement.dataCy,
      id: lastClickedElement.id,
      class: lastClickedElement.className,
      tag: lastClickedElement.tagName,
      text: lastClickedElement.text?.substring(0, 100)
    } : null,

    // Merge default tracking data (device, user, etc.)
    ...getDefaultTrackingData()
  }
  try {
    const webSocket = getWebSocketService()
    if (!webSocket.isConnected()) {
      await webSocket.connect()
    }
    webSocket.send('stellar-track', {
      type: 'error',
      data: errorObj
    })
  } catch (error) {
    console.error('Failed to send error:', error)
  }
}
