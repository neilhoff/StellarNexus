import { Platform, Screen } from 'quasar'
import { useAuthStore } from 'src/stores/authStore.js'
import { useConfigStore } from 'src/stores/configStore.js'
import { getWebSocketService } from 'src/boot/defaults.js'

function getDefaultTrackingData () {
  const authStore = useAuthStore()
  const configStore = useConfigStore()
  const width = Screen.width
  const pInfo = { ...Platform.is }

  // Setup the device Id
  configStore.stellarTrack.deviceId =
    configStore.stellarTrack.deviceId ?
      configStore.stellarTrack.deviceId :
      `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`

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
    fromUrl: from.fullPath,
    url: to.fullPath,
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
  console.log(pageViewData)
}

// Setup in src/boot/default.js
// Add: data-stellar-track="label of what is being clicked"
// to any html element to track clicks
export function trackClicks (event) {
  const stellarTrackItem = event.target.closest('[data-stellar-track]')
  if (stellarTrackItem) {
    const clickData = {
      elementTag: stellarTrackItem.tagName.toLowerCase(),
      elementId: stellarTrackItem.id || 'none',
      elementClass: stellarTrackItem.className || 'none',
      trackLabel: stellarTrackItem.dataset.stellarTrack,
      url: window.location.pathname,
      ...getDefaultTrackingData()
    }
    console.log(clickData)
    try {
      const webSocket = getWebSocketService()
      if (!webSocket.isConnected()) {
        webSocket.connect()
      }

      webSocket.send('stellar-track', { type: 'click', data: clickData })
    } catch (error) {
      console.error('Failed to send click data:', error)
    }
  }
}


// DynamoDB data Architecture
// pk: The month - 2025-10
// sk: date#trackType - pageView, click, error, etc...
// trackData: { ..trackingData }
