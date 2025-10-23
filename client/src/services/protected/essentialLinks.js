// import { useAuthStore } from 'src/stores/authStore.js'
// const authStore = useAuthStore()

export const essentialLinks = [
  {
    title: '',
    bgColor: 'primary',
    authorized: true,
    links: [
      {
        title: 'Home',
        icon: 'fas fa-home',
        link: {
          location: '/protected',
          internal: true
        },
        authorized: true
      },
    ]
  },
  {
    title: 'Apps',
    bgColor: 'primary',
    authorized: true,
    links: [
      {
        title: 'Call REST API',
        icon: 'fas fa-cloud',
        link: {
          location: '/protected/call-rest-api',
          internal: true
        },
        authorized: true
      }
    ]
  },
  {
    title: 'Admin',
    bgColor: 'accent',
    authorized: true,
    links: [
      {
        title: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        link: {
          location: '/admin',
          internal: true
        },
        authorized: true
      },
      {
        title: 'Analytics',
        icon: 'fas fa-chart-bar',
        link: {
          location: '/protected/admin/stellar-analytics',
          internal: true
        },
        authorized: true
      },
      {
        title: 'Error Logs',
        icon: 'fas fa-exclamation-circle',
        link: {
          location: '/admin/errorlogs',
          internal: true
        },
        authorized: true
      }
    ]
  }
]
