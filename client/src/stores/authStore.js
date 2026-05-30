import { defineStore } from 'pinia'
import { cognitoSignIn, cognitoSignOut, getUserAttributes, refreshSession } from 'src/services/auth/cognitoService.js'
import { userSyncService } from 'src/services/protected/users/userSyncService.js'

function getAttributeValue (attributes, key) {
  if (!Array.isArray(attributes)) return ''
  const attribute = attributes.find((item) => item?.getName?.() === key)
  return attribute?.getValue?.() || ''
}

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    accessToken: '',
    idToken: '',
    refreshToken: '',
    email: '',
    userAttributes: '',
    sessionExpiresAt: 0,
    staySignedIn: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.idToken && !!state.accessToken,
    isSessionValid: (state) => state.sessionExpiresAt > new Date().getTime()
  },
  actions: {
    async signIn (email, password, staySignedIn) {
      try {
        const result = await cognitoSignIn(email, password)
        this.accessToken = result.accessToken
        this.idToken = result.idToken
        this.email = email
        this.staySignedIn = staySignedIn
        this.userAttributes = await getUserAttributes()
        const givenName = getAttributeValue(this.userAttributes, 'given_name')
        const familyName = getAttributeValue(this.userAttributes, 'family_name')
        const displayName = `${givenName} ${familyName}`.trim() || this.email

        await userSyncService.syncCurrentUser(displayName)

        if (staySignedIn) {
          this.refreshToken = result.refreshToken
          this.sessionExpiresAt = new Date().getTime() + 7 * 24 * 60 * 60 * 1000 // 1 week
        } else {
          this.refreshToken = ''
          this.sessionExpiresAt = 0
        }
        return result
      } catch (err) {
        this.signOut()
        throw err
      }
    },
    async refresh () {
      try {
        if (!this.email || !this.refreshToken) throw new Error('No refresh token')
        const result = await refreshSession(this.email, this.refreshToken)
        this.accessToken = result.accessToken
        this.idToken = result.idToken
        this.refreshToken = result.refreshToken

        const givenName = getAttributeValue(this.userAttributes, 'given_name')
        const familyName = getAttributeValue(this.userAttributes, 'family_name')
        const displayName = `${givenName} ${familyName}`.trim() || this.email

        await userSyncService.syncCurrentUser(displayName)

        return result
      } catch (err) {
        this.signOut()
        throw err
      }
    },
    async signOut () {
      try {
        cognitoSignOut()
      } finally {
        this.accessToken = ''
        this.idToken = ''
        this.refreshToken = ''
        this.email = ''
        this.sessionExpiresAt = 0
        this.staySignedIn = false
      }
    },
    async restoreSession () {
      if (this.isSessionValid && this.email && this.refreshToken) {
        try {
          await this.refresh()
          return true
        } catch {
          this.signOut()
        }
      }
      return false
    }
  },
  persist: {
    paths: ['refreshToken', 'email', 'sessionExpiresAt', 'staySignedIn']
  }
})
