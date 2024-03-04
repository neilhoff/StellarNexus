import { store } from 'quasar/wrappers'
import { createStore } from 'vuex'
import VuexPersist from 'vuex-persist'

import auth from './auth'
import config from './config'
import web3 from './web3'

const vuexLocalStorage = new VuexPersist({
  key: process.env.APP_NAME, // The key to store the state on in the storage provider.
  storage: window.localStorage, // or window.sessionStorage or localForage
  modules: ['auth', 'config', 'web3']
})

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store(function (/* { ssrContext } */) {
  const Store = createStore({
    plugins: [vuexLocalStorage.plugin],
    modules: {
      auth,
      config,
      web3
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
})
