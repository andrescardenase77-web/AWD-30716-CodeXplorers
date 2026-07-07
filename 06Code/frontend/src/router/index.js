import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/authService.js'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/views/core/LandingView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/core/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/supplies/DashboardView.vue')
      },
      {
        path: 'inventory',
        name: 'inventory',
        component: () => import('@/views/supplies/InventoryListView.vue')
      },
      {
        path: 'supply-register',
        name: 'supply-register',
        component: () => import('@/views/supplies/SupplyFormView.vue')
      },
      {
        path: 'low-stock',
        name: 'low-stock',
        component: () => import('@/views/supplies/LowStockView.vue')
      },
      {
        path: 'restock-planning',
        name: 'restock-planning',
        component: () => import('@/views/supplies/RestockPlanningView.vue')
      },
      {
        path: 'restock-budget',
        name: 'restock-budget',
        component: () => import('@/views/supplies/RestockBudgetView.vue')
      },
      {
        path: 'expiration-alerts',
        name: 'expiration-alerts',
        component: () => import('@/views/supplies/ExpirationAlertsView.vue')
      },
      {
        path: 'expired-history',
        name: 'expired-history',
        component: () => import('@/views/supplies/ExpiredHistoryView.vue')
      },
      {
        path: 'loss-analysis',
        name: 'loss-analysis',
        component: () => import('@/views/supplies/LossAnalysisView.vue')
      },
      {
        path: 'payments',
        name: 'payments',
        component: () => import('@/views/payments/PaymentListView.vue')
      },
      {
        path: 'payment-register',
        name: 'payment-register',
        component: () => import('@/views/payments/PaymentFormView.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const authenticated = authService.isAuthenticated()

  if (requiresAuth && !authenticated) {
    return { name: 'login' }
  }

  if (!requiresAuth && authenticated && (to.name === 'login' || to.name === 'landing')) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
