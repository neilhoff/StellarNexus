import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { isAuthenticated } from 'src/services/auth/cognitoService'
import { trackPageView } from 'src/services/stellarTrack.js'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Navigation Guard
  Router.beforeEach(async (to, from, next) => {
    const authenticated = await isAuthenticated()
    trackPageView(to, from)
    // If the route requires authentication and the user is not authenticated
    if (to.meta.requiresAuth && !authenticated) {
      return next({
        path: '/auth/signin',
        query: { redirect: to.fullPath }, // Preserve intended route
      })
    }

    // If the user is authenticated and tries to access login, redirect to protected
    if ((authenticated && to.path === '/auth/signin') || (authenticated && to.path === '/auth/signup')) {
      return next('/p')
    }

    // Allow navigation
    next()
  })

  return Router
})
