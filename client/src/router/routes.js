const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/code=:guid(.*)', redirect: '/' } // MSAL redirects to "/code=..." so we need to display Index.vue to finish the sign in process
    ],
    meta: {
      requiresSignIn: true
    }
  },
  {
    path: '/',
    component: () => import('layouts/SimpleLayout.vue'),
    children: [
      { path: '/sign-in', component: () => import('pages/SignIn.vue') }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/example-page', component: () => import('src/pages/ExamplePage/ExamplePage.vue') },
      { path: '/example-sap-web-service', component: () => import('src/pages/ExamplePage/ExampleSAPWebService.vue') },
      { path: '/example-rest-api', component: () => import('src/pages/ExamplePage/ExampleRestApiCall.vue') }
    ],
    meta: {
      requiresSignIn: true,
      requiresExampleAuth: true
    }
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/admin', component: () => import('src/pages/admin/skylog/AdminHome.vue') },
      { path: '/admin/errorlogs', component: () => import('pages/admin/skylog/ErrorLogs.vue') },
      { path: '/admin/analytics', component: () => import('pages/admin/skylog/UserAnalytics.vue') },
      { path: '/admin/site-design', component: () => import('pages/admin/SiteDesign.vue') }
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
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
