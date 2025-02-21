import { defineStore } from 'pinia'

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    darkMode: false,
    leftDrawerOptions: ['max', 'mini', 'hidden'],
    leftDrawerState: 'mini'
  }),
  getters: {
  },
  actions: {
  },
  persist: true
})
