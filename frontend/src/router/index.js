import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Layouts
const MainLayout = () => import('../layouts/MainLayout.vue');
const AuthLayout = () => import('../layouts/AuthLayout.vue');

// Auth Views
const Login = () => import('../views/auth/Login.vue');
const Register = () => import('../views/auth/Register.vue');
const ForgotPassword = () => import('../views/auth/ForgotPassword.vue');
const ResetPassword = () => import('../views/auth/ResetPassword.vue');

// Dashboard Views
const Dashboard = () => import('../views/Dashboard.vue');

// Master Views
const Branches = () => import('../views/master/Branches.vue');
const AccountGroups = () => import('../views/master/AccountGroups.vue');
const Places = () => import('../views/master/Places.vue');
const Trucks = () => import('../views/master/Trucks.vue');
const Drivers = () => import('../views/master/Drivers.vue');

// Transaction Views
const LedgerManagement = () => import('../components/LedgerManagement.vue');
const Invoices = () => import('../views/transactions/Invoices.vue');
const Manifests = () => import('../views/transactions/Manifests.vue');
const FreightChallans = () => import('../views/transactions/FreightChallans.vue');
const GoodsReceipts = () => import('../views/transactions/GoodsReceipts.vue');
const GoodsDeliveries = () => import('../views/transactions/GoodsDeliveries.vue');

// Report Views
const LedgerStatement = () => import('../views/reports/LedgerStatement.vue');
const PartyStatement = () => import('../views/reports/PartyStatement.vue');
const FreightReport = () => import('../views/reports/FreightReport.vue');
const TruckReport = () => import('../views/reports/TruckReport.vue');
const ProfitLossReport = () => import('../views/reports/ProfitLossReport.vue');

const routes = [
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      // Master Routes
      {
        path: 'master',
        children: [
          {
            path: 'branches',
            name: 'branches',
            component: Branches,
            meta: { title: 'Branches', permissions: ['view_branches'] }
          },
          {
            path: 'account-groups',
            name: 'account-groups',
            component: AccountGroups,
            meta: { title: 'Account Groups', permissions: ['view_account_groups'] }
          },
          {
            path: 'places',
            name: 'places',
            component: Places,
            meta: { title: 'Places', permissions: ['view_places'] }
          },
          {
            path: 'trucks',
            name: 'trucks',
            component: Trucks,
            meta: { title: 'Trucks', permissions: ['view_trucks'] }
          },
          {
            path: 'drivers',
            name: 'drivers',
            component: Drivers,
            meta: { title: 'Drivers', permissions: ['view_drivers'] }
          }
        ]
      },
      // Transaction Routes
      {
        path: 'transactions',
        children: [
          {
            path: 'ledger',
            name: 'ledger',
            component: LedgerManagement,
            meta: { title: 'Ledger Management', permissions: ['view_ledger'] }
          },
          {
            path: 'invoices',
            name: 'invoices',
            component: Invoices,
            meta: { title: 'Invoices', permissions: ['view_invoices'] }
          },
          {
            path: 'manifests',
            name: 'manifests',
            component: Manifests,
            meta: { title: 'Manifests', permissions: ['view_manifests'] }
          },
          {
            path: 'freight-challans',
            name: 'freight-challans',
            component: FreightChallans,
            meta: { title: 'Freight Challans', permissions: ['view_freight_challans'] }
          },
          {
            path: 'goods-receipts',
            name: 'goods-receipts',
            component: GoodsReceipts,
            meta: { title: 'Goods Receipts', permissions: ['view_goods_receipts'] }
          },
          {
            path: 'goods-deliveries',
            name: 'goods-deliveries',
            component: GoodsDeliveries,
            meta: { title: 'Goods Deliveries', permissions: ['view_goods_deliveries'] }
          }
        ]
      },
      // Report Routes
      {
        path: 'reports',
        children: [
          {
            path: 'ledger-statement',
            name: 'ledger-statement',
            component: LedgerStatement,
            meta: { title: 'Ledger Statement', permissions: ['view_reports'] }
          },
          {
            path: 'party-statement',
            name: 'party-statement',
            component: PartyStatement,
            meta: { title: 'Party Statement', permissions: ['view_reports'] }
          },
          {
            path: 'freight-report',
            name: 'freight-report',
            component: FreightReport,
            meta: { title: 'Freight Report', permissions: ['view_reports'] }
          },
          {
            path: 'truck-report',
            name: 'truck-report',
            component: TruckReport,
            meta: { title: 'Truck Report', permissions: ['view_reports'] }
          },
          {
            path: 'profit-loss',
            name: 'profit-loss',
            component: ProfitLossReport,
            meta: { title: 'Profit & Loss', permissions: ['view_reports'] }
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    meta: { requiresGuest: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { title: 'Login' }
      },
      {
        path: 'register',
        name: 'register',
        component: Register,
        meta: { title: 'Register' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: { title: 'Forgot Password' }
      },
      {
        path: 'reset-password/:token',
        name: 'reset-password',
        component: ResetPassword,
        meta: { title: 'Reset Password' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Set page title
  document.title = `${to.meta.title} - Transport Management System` || 'Transport Management System';

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // Check permissions
    if (to.meta.permissions) {
      const hasPermission = to.meta.permissions.some(permission => 
        authStore.user.permissions.includes(permission)
      );
      
      if (!hasPermission) {
        next({ name: 'dashboard' });
        return;
      }
    }
  }

  // Check if route requires guest access
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (authStore.isAuthenticated) {
      next({ name: 'dashboard' });
      return;
    }
  }

  next();
});

export default router;
