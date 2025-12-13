const routes = [
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', component: () => import('pages/public/SiteHome.vue') },
      { path: '/auth/:type', component: () => import('pages/public/SignupSignin.vue') }
    ]
  },
  {
    path: '/p',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '', component: () => import('pages/protected/IndexPage.vue') },
      { path: '/p/call-rest-api', component: () => import('pages/protected/callRestApi/CallRestApi.vue') }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/p/admin',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '/p/admin/stellar-analytics', component: () => import('pages/protected/admin/StellarTracks/StellarAnalytics.vue') },
      { path: '/p/admin/stellar-error-log', component: () => import('pages/protected/admin/StellarTracks/StellarErrorLog.vue') }
    ],
    meta: { requiresAuth: true, requiresAdmin: true } //TODO: Setup admin authorizations
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/public/ErrorNotFound.vue')
  }
]

export default routes
