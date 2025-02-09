const routes = [
  {
    path: '/',
    component: () => import('layouts/OpenLayout.vue'),
    children: [
      { path: '', component: () => import('pages/open/Index.vue'), name: 'SiteHome' }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      { path: '/sign-in', component: () => import('pages/open/SignIn.vue') },
      { path: '/sign-up', component: () => import('pages/open/SignUp.vue') }
    ]
  },
  {
    path: '/app',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '', component: () => import('pages/protected/ProtectedIndex.vue') },
      { path: '/code=:guid(.*)', redirect: '/app' }, // MSAL redirects to "/code=..." so we need to display Index.vue to finish the sign in process
      { path: '/example-page', component: () => import('src/pages/protected/ExamplePage/ExamplePage.vue') },
      { path: '/example-sap-web-service', component: () => import('src/pages/protected/ExamplePage/ExampleSAPWebService.vue') },
      { path: '/example-rest-api', component: () => import('src/pages/protected/ExamplePage/ExampleRestApiCall.vue') }
    ],
    meta: {
      requiresSignIn: true,
      requiresExampleAuth: true
    }
  },
  {
    path: '/app',
    component: () => import('layouts/ProtectedLayout.vue'),
    children: [
      { path: '/admin', component: () => import('src/pages/protected/admin/skylog/AdminHome.vue') },
      { path: '/admin/errorlogs', component: () => import('pages/protected/admin/skylog/ErrorLogs.vue') },
      { path: '/admin/analytics', component: () => import('pages/protected/admin/skylog/UserAnalytics.vue') },
      { path: '/admin/site-design', component: () => import('pages/protected/admin/SiteDesign.vue') }
    ],
    meta: {
      requiresSignIn: true,
      requiresAdminAuth: true
    }
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/open/ErrorNotFound.vue')
  }
]

export default routes
