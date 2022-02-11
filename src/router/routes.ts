import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/DashboardLayout.vue'),
    children: [
      // { path: 'dashboard/', component: () => import('pages/DashboardView.vue') },
      { path: 'dfipools/', component: () => import('pages/DfiPools.vue') },
      { path: 'dexmatrix/', component: () => import('pages/DexMatrix.vue') },
      { path: 'dusdpools/', component: () => import('pages/DusdPools.vue') },
      // { path: 'dtokencharts/', component: () => import('pages/DtokenCharts.vue') },
      { path: 'credits/', component: () => import('pages/CreditsView.vue') },
      { path: '', component: () => import('pages/DfiPools.vue') }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound404.vue')
  }
]

export default routes
