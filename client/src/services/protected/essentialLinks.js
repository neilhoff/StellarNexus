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
          location: '/p',
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
          location: '/p/call-rest-api',
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
    requiresAdmin: true,
    links: [
      {
        title: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        link: {
          location: '/p/admin/stellar-analytics',
          internal: true
        },
        authorized: true
      },
      {
        title: 'Analytics',
        icon: 'fas fa-chart-bar',
        link: {
          location: '/p/admin/stellar-analytics',
          internal: true
        },
        authorized: true
      },
      {
        title: 'Error Logs',
        icon: 'fas fa-exclamation-circle',
        link: {
          location: '/p/admin/stellar-error-log',
          internal: true
        },
        authorized: true
      },
      {
        title: 'User Maintenance',
        icon: 'fas fa-users-cog',
        link: {
          location: '/p/admin/user-maintenance',
          internal: true
        },
        authorized: true
      }
    ]
  }
]

function canShowItem (item, isAdmin) {
  if (!item?.authorized) return false
  if (item.requiresAdmin && !isAdmin) return false
  return true
}

function getAuthorizedLinkGroups (isAdmin = false) {
  return essentialLinks
    .filter((group) => canShowItem(group, isAdmin))
    .map((group) => {
      // Links inherit requiresAdmin from their parent group
      const groupRequiresAdmin = !!group.requiresAdmin
      return {
        ...group,
        links: (group.links || []).filter((link) =>
          canShowItem({ ...link, requiresAdmin: link.requiresAdmin || groupRequiresAdmin }, isAdmin)
        )
      }
    })
    .filter((group) => (group.links || []).length > 0)
}

export {
  getAuthorizedLinkGroups
}
