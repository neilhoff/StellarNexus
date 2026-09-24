import { defineStore } from 'pinia'
import {
  signIn as authSignIn,
  signOut as authSignOut,
  refreshSession as authRefreshSession,
  getSession
} from 'src/services/auth/betterAuthService.js'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    accessToken: '',
    idToken: '',
    email: '',
    userName: '',
    roles: [],
    sessionExpiresAt: 0,
    staySignedIn: false
  }),
  getters: {
    isAuthenticated: (state) => !!state.idToken && state.sessionExpiresAt > new Date().getTime(),
    isAdmin: (state) => state.roles.includes('admin') || state.roles.includes('super-admin'),
    isSuperAdmin: (state) => state.roles.includes('super-admin')
  },
  actions: {
    async signIn (email, password, staySignedIn) {
      try {
        const result = await authSignIn(email, password)
        this.accessToken = result.accessToken
        this.idToken = result.idToken
        this.email = result.user.email
        this.userName = result.user.name || result.user.email
        this.roles = result.user.roles || ['user']
        this.staySignedIn = staySignedIn

        if (staySignedIn) {
          this.sessionExpiresAt = new Date(result.session.expiresAt).getTime()
        } else {
          this.sessionExpiresAt = new Date().getTime() + 24 * 60 * 60 * 1000
        }
        return result
      } catch (err) {
        this.signOut()
        throw err
      }
    },
    async refresh () {
      try {
        if (!this.email || !this.idToken) throw new Error('No session token')
        const result = await authRefreshSession(this.idToken)
        this.accessToken = result.accessToken
        this.idToken = result.idToken
        this.userName = result.user.name || result.user.email
        this.roles = result.user.roles || ['user']

        if (result.session.expiresAt) {
          this.sessionExpiresAt = new Date(result.session.expiresAt).getTime()
        }

        return result
      } catch (err) {
        this.signOut()
        throw err
      }
    },
    async signOut () {
      try {
        await authSignOut(this.idToken)
      } finally {
        this.accessToken = ''
        this.idToken = ''
        this.email = ''
        this.userName = ''
        this.roles = []
        this.sessionExpiresAt = 0
        this.staySignedIn = false
      }
    },
    async restoreSession () {
      if (this.isSessionValid && this.email && this.idToken) {
        try {
          const session = await getSession(this.idToken)
          if (session && session.success) {
            this.accessToken = this.idToken
            this.userName = session.user.name || session.user.email
            this.roles = session.user.roles || ['user']
            this.sessionExpiresAt = new Date(session.session.expiresAt).getTime()
            return true
          }
        } catch {
          this.signOut()
        }
      }
      return false
    }
  },
  persist: {
    paths: ['idToken', 'email', 'userName', 'roles', 'sessionExpiresAt', 'staySignedIn']
  }
})
