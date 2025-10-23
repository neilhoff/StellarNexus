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
    path: '/protected',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '', component: () => import('pages/protected/IndexPage.vue') },
      { path: '/protected/call-rest-api', component: () => import('pages/protected/callRestApi/CallRestApi.vue') }
    ],
    meta: { requiresAuth: true }
  },
  {
    path: '/protected/admin',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '/protected/admin/stellar-analytics', component: () => import('pages/protected/admin/StellarTracks/StellarAnalytics.vue') }
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
