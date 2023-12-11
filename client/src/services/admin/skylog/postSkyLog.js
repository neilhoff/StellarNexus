import Store from 'src/store/index'
import Bowser from 'bowser'
import axios from 'axios'
import qs from 'qs'

// find first parent with tagName [tagname]
function findParent (tagname, el) {
  while (el) {
    if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
      return el
    }
    el = el.parentNode
  }
  return null
}

function userInfo () {
  return Store().state.auth.userInfo
}

async function addDefaultParams (params) {
  // params.userPrincipalName = userInfo().userPrincipalName
  try {
    params.userPrincipalName = userInfo().userPrincipalName
    params.displayName = userInfo().displayName
  } catch (error) {
    params.userPrincipalName = 'notLoggedIn'
    params.displayName = 'Not Logged In'
  }

  const ua = Bowser.parse(window.navigator.userAgent)
  if (navigator.brave && await navigator.brave.isBrave()) {
    ua.browser.name = 'Brave'
  }
  params.userAgent = ua
  return params
}

async function saveTrack (params) {
  params = await addDefaultParams(params)
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
  const response = await axios({
    data: qs.stringify(params),
    method: 'POST',
    url: `${process.env.API_URL}/skylogs`,
    headers
  })
  return response
}

export default {
  track: async (params) => {
    // Example: Track calls to the getSapOrders function inside the OrdersReport page.
    // Add this to the end of the getSapOrders function:
    // this.$skyLog.track({
    //   skyLogType: 'OrdersReportForm',
    //   formParams: JSON.parse(JSON.stringify(params))
    // })
    //
    // Example: Track the time it takes a function to run:
    // At the beginning of the function set a start date:
    //   const start = Date.now()
    // Then call SkyTrack at the end of the function:
    // this.$skyLog.track({
    //   skyLogType: 'NameOfFunction',
    //   runtime: Date.now() - start
    // })
    // Make sure to add a 'skyLogType' parameter when you call this
    await saveTrack(params)
  },
  trackClicks: async () => {
    document.body.onclick = async function (e) {
      e = e || event
      let params
      // Track external links
      const link = findParent('a', e.target || e.srcElement)
      if (link && link.target === '_blank') {
        params = {
          skyLogType: 'Analytics',
          skyLogDescription: 'ExternalLink',
          link: link.href,
          skyLogName: link.getAttribute('sky-track-name')
        }
        await saveTrack(params)
      }

      // Track button clicks that have a sky-track-name
      const button = findParent('button', e.target || e.srcElement)
      if (button && button.getAttribute('sky-track-name')) {
        params = {
          skyLogType: 'Analytics',
          skyLogDescription: 'ButtonClick',
          skyLogName: button.getAttribute('sky-track-name')
        }
        await saveTrack(params)
      }
    }
  },
  trackRouter: async (to, from) => {
    // This will track all router changes when you add to the Vue Router:
    //   Router.afterEach((to, from, next) => {
    //     Vue.skyLog.trackRouter(to, from)
    //   })
    const params = {
      skyLogType: 'Analytics',
      skyLogDescription: 'RouterLink',
      toUrl: to.fullPath,
      referrer: document.referrer, // Need to test this out by creating a link that navigates to the site
      fromUrl: from.fullPath
    }
    if (to.fullPath.startsWith('/access_token=')) {
      params.skyLogDescription = 'GetAuthToken'
      params.toUrl = '/access_token'
    }

    await saveTrack(params)
  },
  // Errors are caught in src/boot/skyLog.js
  trackError: async (errorObj) => {
    const params = {
      skyLogType: 'Error',
      url: window.location.href.replace(`${process.env.CLIENT_URL}/#`, ''),
      errorObj
    }
    await saveTrack(params)
  }
}
