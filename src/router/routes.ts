import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/DashboardLayout.vue'),
    children: [
      { path: 'dashboard/', component: () => import('src/pages/DashboardView.vue') },
      { path: 'dfipools/', component: () => import('src/pages/DfiPools.vue') },
      { path: 'dexmatrix/', component: () => import('src/pages/DexMatrix.vue') },
      { path: 'dusdpools/', component: () => import('src/pages/DusdPools.vue') },
      { path: 'historyapr/', component: () => import('src/pages/HistoryPools.vue') },
      // { path: 'dtokencharts/', component: () => import('pages/DtokenCharts.vue') },
      { path: 'credits/', component: () => import('src/pages/CreditsView.vue') },
      { path: '', component: () => import('src/pages/DashboardView.vue') }]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound404.vue')
  }
]

export default routes
