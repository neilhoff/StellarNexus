import { decode } from 'jsonwebtoken'

const cypressEnv = Cypress.env('CYPRESS_ENV')
const { url } = Cypress.env(cypressEnv)
const {
  tenantId,
  clientId,
  clientSecret,
  apiScopes,
  username,
  password,
} = Cypress.env('auth')

const authority = `https://login.microsoftonline.com/${tenantId}`
const environment = 'login.windows.net'

const buildAccountEntity = (homeAccountId, realm, localAccountId, idTokenClaims, username, name) => {
  return {
    authorityType: 'MSSTS',
    // This could be filled in but it involves a bit of custom base64 encoding
    // and would make this sample more complicated.
    // This value does not seem to get used, so we can leave it out.
    clientInfo: '',
    homeAccountId,
    environment,
    realm,
    localAccountId,
    idTokenClaims,
    username,
    name,
  }
}

const buildIdTokenEntity = (homeAccountId, idToken, realm) => {
  return {
    credentialType: 'IdToken',
    homeAccountId,
    environment,
    clientId,
    secret: idToken,
    realm,
  }
}

const buildAccessTokenEntity = (homeAccountId, accessToken, expiresIn, extExpiresIn, realm, scopes, tokenType) => {
  const now = Math.floor(Date.now() / 1000)
  return {
    homeAccountId,
    credentialType: 'AccessToken',
    secret: accessToken,
    cachedAt: now.toString(),
    expiresOn: (now + expiresIn).toString(),
    extendedExpiresOn: (now + extExpiresIn).toString(),
    environment,
    clientId,
    realm,
    target: scopes.map((s) => s.toLowerCase()).join(' '),
    // Scopes _must_ be lowercase or the token won't be found
    tokenType
  }
}

const buildRefreshTokenEntity = (clientId, environment, homeAccountId, secret) => {
  return {
    clientId,
    credentialType: 'RefreshToken',
    environment,
    homeAccountId,
    secret
  }
}

const buildMsalTokenKeysEntity = (accessToken, idToken, refreshToken) => {
  return {
    accessToken: [accessToken],
    idToken: [idToken],
    refreshToken: [refreshToken]
  }
}

const injectTokens = (tokenResponse) => {
  const tokenType = tokenResponse.token_type
  const idToken = decode(tokenResponse.id_token)
  const localAccountId = idToken.oid || idToken.sid
  const realm = idToken.tid
  const homeAccountId = `${localAccountId}.${realm}`
  const username = idToken.preferred_username
  const name = idToken.name

  const accountKey = `${homeAccountId}-${environment}-${realm}`
  const accountEntity = buildAccountEntity(
    homeAccountId,
    realm,
    localAccountId,
    idToken,
    username,
    name
  )

  const idTokenKey = `${homeAccountId}-${environment}-idtoken-${clientId}-${realm}---`
  const idTokenEntity = buildIdTokenEntity(
    homeAccountId,
    tokenResponse.id_token,
    realm
  )

  const accessTokenKey = `${homeAccountId}-${environment}-accesstoken-${clientId}-${realm}-${apiScopes.join(' ')}--`
  const accessTokenEntity = buildAccessTokenEntity(
    homeAccountId,
    tokenResponse.access_token,
    tokenResponse.expires_in,
    tokenResponse.ext_expires_in,
    realm,
    apiScopes,
    tokenType
  )

  const refreshTokenKey = `${homeAccountId}-${environment}-refreshtoken-${clientId}----`
  const refreshTokenEntity = buildRefreshTokenEntity(
    clientId,
    environment,
    homeAccountId,
    tokenResponse.access_token
  )

  const msalTokenKeysKey = `msal.token.keys.${clientId}`
  const msalTokenKeysEntity = buildMsalTokenKeysEntity(
    accessTokenKey,
    idTokenKey,
    refreshTokenKey
  )

  localStorage.setItem(accountKey, JSON.stringify(accountEntity))
  localStorage.setItem(idTokenKey, JSON.stringify(idTokenEntity))
  localStorage.setItem(accessTokenKey, JSON.stringify(accessTokenEntity))
  localStorage.setItem(refreshTokenKey, JSON.stringify(refreshTokenEntity))
  localStorage.setItem(msalTokenKeysKey, JSON.stringify(msalTokenKeysEntity))
  localStorage.setItem('msal.account.keys', JSON.stringify([`${homeAccountId}-${environment}-${realm}`]))

  // Set app localStorage for app signin info
  if (!localStorage.getItem('auth/userInfo')) {
    cy.window().should('have.property', '__store__')
    cy.window().then(async win => {
      await win.__store__().dispatch('auth/setUserInfo')
      await win.__store__().dispatch('auth/setAdminAccess')
      try {
        await win.__store__().dispatch('auth/getUserPhoto')
      } catch {
        console.log('User photo not found')
      }
    })
  }

}

export const login = (cachedTokenResponse) => {
  let tokenResponse = null
  let chainable = cy.visit(url)

  if (!cachedTokenResponse) {
    chainable = chainable.request({
      url: authority + '/oauth2/v2.0/token',
      method: 'POST',
      body: {
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        scope: ['openid profile email'].concat(apiScopes).join(' '),
        username: username,
        password: password,
      },
      form: true,
    })
  } else {
    chainable = chainable.then(() => {
      return {
        body: cachedTokenResponse,
      }
    })
  }

  chainable
    .then((response) => {
      injectTokens(response.body)
      tokenResponse = response.body
    })
    .reload()
    .then(() => {
      return tokenResponse
    })

  return chainable
}