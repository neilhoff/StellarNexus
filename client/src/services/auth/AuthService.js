import * as msal from '@azure/msal-browser'
import { ServiceHelpers } from 'src/services/serviceHelpers'

const msalAuth = {
  msalConfig: {
    auth: {
      authority: process.env.AZURE_AUTHORITY_URL,
      // TODO: Setup a clientID on the Azure Portal: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
      clientId: process.env.AZURE_CLIENT_ID,
      redirectUri: process.env.MSAL_REDIRECT_URI, // Special characters are not allowed.
      postLogoutRedirectUri: process.env.MSAL_POST_LOGOUT_URI
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false
    }
  },
  loginConfig: {
    scopes: [
      'User.Read',
      'User.Read.All',
      'User.ReadBasic.All',
      'Group.Read.All',
      'Directory.Read.All',
      'Directory.AccessAsUser.All']
  },
  initialize: async () => {
    const userAgentApp = new msal.PublicClientApplication(msalAuth.msalConfig)
    await userAgentApp.initialize()
    return userAgentApp
  }
}

const standardAuth = {
  postSignUp: async (params) => {
    const serviceErrorObj = {
      title: 'SignUpAxiosError',
      description: 'Error signing up'
    }
    return ServiceHelpers.postToApi(`${process.env.API_URL}/sign-up`, params, serviceErrorObj)
  },
  signIn: async (params) => {
    const serviceErrorObj = {
      title: 'SignInAxiosError',
      description: 'Error signing in'
    }
    return ServiceHelpers.postToApi(`${process.env.API_URL}/sign-in`, params, serviceErrorObj)
  },
  authCheck: async (params) => {
    const serviceErrorObj = {
      title: 'AuthCheckAxiosError',
      description: 'Error checking Auth'
    }
    return ServiceHelpers.getFromApi(`${process.env.API_URL}/auth-check`, params ? '' : params, serviceErrorObj)
  }
}

export {
  msalAuth,
  standardAuth
}
