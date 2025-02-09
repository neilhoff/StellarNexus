import { msalAuth } from 'src/services/auth/AuthService'
import { GraphService } from 'src/services/auth/GraphService'
import { AccessRules } from 'src/services/auth/AccessRules'
import { Loading, date } from 'quasar'
import store from 'src/store/index.js'

const msalUserAgentApp = await msalAuth.initialize()

msalUserAgentApp.handleRedirectPromise().then(async (tokenResponse) => {
  if (tokenResponse !== null) {
    Loading.show({
      message: 'Signing in. Please wait...',
      boxClass: 'bg-grey-2 text-grey-9 sign-in-spinner-box',
      spinnerColor: 'primary'
    })
    // We need to call these functions using store() so that the context is sent as a param
    await store().dispatch('auth/setUserInfo')
    try {
      await store().dispatch('auth/setAdminAccess')
      await store().dispatch('auth/getUserPhoto') // This needs to be last because it can fail
    } finally {
      // TODO: I cannot get vue to reactively respond to changes that are made in AuthService so I need to reload the page
      // Loading.hide() hides the loading for a second or two before the location.reload() is activated
      //  - Removing it is a much better user experience and loading is hidden on page reload
      // location.reload()
      console.log('locatino.href=', location.href)
      Loading.hide()
      location.href = `${process.env.MSAL_REDIRECT_URI}/#/app`
    }
  }
}).catch((error) => {
  console.log(error)
})

export function login (context) {
  console.log(msalAuth.loginConfig)
  Loading.show()
  try {
    msalUserAgentApp.loginRedirect(msalAuth.loginConfig)
  } finally {
    Loading.hide()
  }
}

export async function logout (context) {
  Loading.show()
  try {
    window.localStorage.removeItem(process.env.APP_NAME)
    await msalUserAgentApp.logoutRedirect()
  } finally {
    Loading.hide()
  }
}

export async function getToken () {
  const currentAccounts = msalUserAgentApp.getAllAccounts()
  const tokenRequest = {
    scopes: msalAuth.loginConfig.scopes,
    account: currentAccounts[0]
  }
  if (currentAccounts.length > 0) {
    try {
      return await msalUserAgentApp.acquireTokenSilent(tokenRequest)
    } catch (error) {
      console.log(error)
      console.log(error.errorCode, error.name, error.errorMessage)
      console.log('silent token acquisition failed')
      if (error.errorCode === 'no_tokens_found') {
        try {
          logout()
        } catch (error) {
          console.log(error)
        }
      }
    }
  } else {
    try {
      login()
    } catch (error) {
      console.log(error)
    }
  }
}

export function getAccount (context) {
  return msalUserAgentApp.getAllAccounts()
}

export async function getUserPhoto (context, size = '48x48') {
  const token = await getToken()
  const photo = await GraphService.getUserPhoto(token.accessToken, size)
  context.commit('setUserPhoto', photo)
}

export async function setUserInfo (context) {
  const token = await getToken()
  const user = await GraphService.getUserInfo(token.accessToken)
  context.commit('setUserInfo', user)
}

export async function setAdminAccess (context) {
  const token = await getToken()
  let admin = false
  admin = await AccessRules.isAdmin(token.accessToken)
  context.commit('setAdminAccess', admin)
}

export function checkAzureFilesSharedAccess (context) {
  const created = context.state.azureFilesSharedAccess.created
  const key = context.state.azureFilesSharedAccess.key
  // Subtract 1 hour to account for the minutes between hours
  const maxHours = context.state.azureFilesSharedAccess.expiresInHours - 1
  let isValid = false
  if (created && key) {
    const createdDateTime = new Date(created)
    const now = new Date()
    const diffInHours = date.getDateDiff(now, createdDateTime, 'hours')
    if (maxHours > diffInHours) {
      isValid = true
    }
  }
  return isValid
}
