import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/supervision' },
  {
    path: '/supervision',
    name: 'Supervision',
    component: () => import('../views/SupervisionView.vue'),
    meta: { title: '督导记录', icon: 'clipboard' }
  },
  {
    path: '/buildings',
    name: 'Buildings',
    component: () => import('../views/BuildingsView.vue'),
    meta: { title: '楼栋排名', icon: 'building' }
  },
  {
    path: '/points',
    name: 'Points',
    component: () => import('../views/PointsView.vue'),
    meta: { title: '居民积分', icon: 'star' }
  },
  {
    path: '/exchange',
    name: 'Exchange',
    component: () => import('../views/ExchangeView.vue'),
    meta: { title: '兑换库存', icon: 'gift' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
