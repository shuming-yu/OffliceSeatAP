const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'PanelPage', component: () => import('pages/PanelPage.vue') },
      { path: 'CalendarPage', component: () => import('pages/CalendarPage.vue') },
      { path: 'UserCalendarMonth', component: () => import('pages/UserCalendarMonth.vue') },
      { path: 'SeatReserve', component: () => import('pages/SeatReserve.vue') },
    ]
  },

  {
    path: '/authentication',
    component: () => import('layouts/AuthenticationLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/authentication/Login.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
