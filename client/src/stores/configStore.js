import { defineStore } from 'pinia'

export const useConfigStore = defineStore('configStore', {
  state: () => ({
    darkMode: false,
    leftDrawerOptions: ['max', 'mini', 'hidden'],
    leftDrawerState: 'mini',
    stellarTrack: {
      deviceId: '',
      sessionId: ''
    }
  }),
  getters: {
  },
  actions: {
  },
  persist: [
    {
      pick: [
        'darkMode',
        'leftDrawerOptions',
        'leftDrawerState',
        'stellarTrack.deviceId'
      ],
      storage: localStorage
    },
    {
      pick: ['stellarTrack.sessionId'],
      storage: sessionStorage,
    }
  ]
})
