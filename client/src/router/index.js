import { route } from 'quasar/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { Notify } from 'quasar'
import skylog from 'src/services/admin/skylog/postSkyLog'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach(async (to, from, next) => {
    if (to.meta.requiresSignIn) {
      await verifyAuth(store, to, from, next)
    } else {
      next()
    }
  })

  Router.afterEach((to, from, next) => {
    skylog.trackRouter(to, from)
  })

  return Router
})

function notifyUser (message) {
  Notify.create({
    message,
    multiLine: true,
    type: 'warning',
    timeout: 10000,
    actions: [
      { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
    ]
  })
}

async function verifyAuth (store, to, from, next) {
  const isSignedIn = await store.dispatch('auth/getAccount')
  if (isSignedIn.length > 0) {
    // Make sure the userInfo is saved to the local storage
    if (!store.state.auth.userInfo) {
      await store.dispatch('auth/setUserInfo')
      store.dispatch('auth/getUserPhoto')
    }
    // Navigate
    if (to.path === '/sign-in') {
      notifyUser('You are already signed in')
      next('/')
    } else if (to.meta.requiresAdminAuth) {
      await store.dispatch('auth/setAdminAccess') // Set admin access each time to prevent gaining access through session hack
      const isAdmin = store.state.auth.adminAccess
      if (!isAdmin) {
        notifyUser('You need Admin Access to view that page')
        next('/')
      } else {
        next()
      }
    } else {
      next()
    }
  } else {
    next('/sign-in')
  }
}
