import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { isAuthenticated, hasAdminAccess } from 'src/services/auth/betterAuthService.js'
import { trackPageView } from 'src/services/stellarTrack.js'
import { useAuthStore } from 'src/stores/authStore.js'

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    const token = authStore.idToken
    const authenticated = await isAuthenticated(token)
    trackPageView(to, from)

    if (to.meta.requiresAuth && !authenticated) {
      return next({
        path: '/auth/signin',
        query: { redirect: to.fullPath },
      })
    }

    if (to.meta.requiresAdmin) {
      const isAdmin = await hasAdminAccess(token)
      if (!isAdmin) {
        return next('/p')
      }
    }

    if ((authenticated && to.path === '/auth/signin') || (authenticated && to.path === '/auth/signup')) {
      return next('/p')
    }

    next()
  })

  return Router
})
