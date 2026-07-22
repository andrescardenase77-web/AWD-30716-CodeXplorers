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
    path: '/register',
    name: 'register',
    component: () => import('@/views/core/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'Administrator' },
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
      }
    ]
  },
  {
    path: '/receptionist',
    component: () => import('@/layouts/ReceptionistLayout.vue'),
    meta: { requiresAuth: true, role: 'Receptionist' },
    children: [
      {
        path: '',
        redirect: '/receptionist/payments'
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
      },
      {
        path: 'senior-discount',
        name: 'senior-discount',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'senior' }
      },
      {
        path: 'contact-priority',
        name: 'contact-priority',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'priority' }
      }
    ]
  },
  {
    path: '/dentist',
    component: () => import('@/layouts/DentistLayout.vue'),
    meta: { requiresAuth: true, role: 'Dentist' },
    children: [
      {
        path: '',
        redirect: '/dentist/patients'
      },
      {
        path: 'patients',
        name: 'patients',
        component: () => import('@/views/patients/PatientListView.vue')
      },
      {
        path: 'patient-register',
        name: 'patient-register',
        component: () => import('@/views/patients/PatientCreateView.vue')
      },
      {
        path: 'pediatric-category',
        name: 'pediatric-category',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'pediatric' }
      },
      {
        path: 'birthday-check',
        name: 'birthday-check',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'birthday' }
      },
      {
        path: 'consultation-time',
        name: 'consultation-time',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'consultation' }
      },
      {
        path: 'legal-representative',
        name: 'legal-representative',
        component: () => import('@/views/patients/PatientRuleView.vue'),
        meta: { ruleType: 'legal' }
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
  const userRole = authService.retrieveRole()

  if (authenticated && (!userRole || (userRole !== 'Administrator' && userRole !== 'Receptionist' && userRole !== 'Dentist'))) {
    authService.removeToken()
    authService.removeRole()
    if (requiresAuth) {
      return { name: 'login' }
    }
    return true
  }

  if (requiresAuth && !authenticated) {
    return { name: 'login' }
  }

  if (requiresAuth && authenticated) {
    const requiredRole = to.matched.find((record) => record.meta.role)?.meta.role
    if (requiredRole && requiredRole !== userRole) {
      if (userRole === 'Receptionist') {
        return { path: '/receptionist/payments' }
      } else if (userRole === 'Administrator') {
        return { path: '/admin/dashboard' }
      } else if (userRole === 'Dentist') {
        return { path: '/dentist/patients' }
      } else {
        return { name: 'login' }
      }
    }
  }

  if (!requiresAuth && authenticated && (to.name === 'login' || to.name === 'landing' || to.name === 'register')) {
    if (userRole === 'Receptionist') {
      return { path: '/receptionist/payments' }
    } else if (userRole === 'Administrator') {
      return { path: '/admin/dashboard' }
    } else if (userRole === 'Dentist') {
      return { path: '/dentist/patients' }
    }
  }

  return true
})

export default router
