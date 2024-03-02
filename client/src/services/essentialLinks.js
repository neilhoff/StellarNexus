export const essentialLinks = {
  default: [
    {
      title: 'Home',
      icon: 'fas fa-home',
      link: {
        location: '/app',
        internal: true
      }
    },
    {
      title: 'Example Page',
      icon: 'fas fa-coins',
      link: {
        location: '/example-page',
        internal: true
      }
    },
    {
      title: 'Example REST API Call',
      icon: 'fas fa-cloud',
      link: {
        location: '/example-rest-api',
        internal: true
      }
    }
  ],
  admin: [
    {
      title: 'Dashboard',
      icon: 'fas fa-tachometer-alt',
      link: {
        location: '/admin',
        internal: true
      }
    },
    {
      title: 'Analytics',
      icon: 'fas fa-chart-bar',
      link: {
        location: '/admin/analytics',
        internal: true
      }
    },
    {
      title: 'Error Logs',
      icon: 'fas fa-exclamation-circle',
      link: {
        location: '/admin/errorlogs',
        internal: true
      }
    },
    {
      title: 'Site Design',
      icon: 'fas fa-paint-brush',
      link: {
        location: '/admin/site-design',
        internal: true
      }
    }
  ]
}
