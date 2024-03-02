import * as msal from '@azure/msal-browser'

const config = {
  auth: {
    authority: process.env.AZURE_AUTHORITY_URL,
    // TODO: Setup a clientID on the Azure Portal: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
    clientId: process.env.AZURE_CLIENT_ID,
    redirectUri: process.env.MSAL_REDIRECT_URI,
    postLogoutRedirectUri: process.env.MSAL_POST_LOGOUT_URI
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false
  }
}

const loginConfig = {
  scopes: [
    'User.Read',
    'User.Read.All',
    'User.ReadBasic.All',
    'Group.Read.All',
    'Directory.Read.All',
    'Directory.AccessAsUser.All']
}

const userAgentApp = new msal.PublicClientApplication(config)
await userAgentApp.initialize()

const AuthService = {
  userAgentApp,
  loginConfig
}

export { AuthService }
