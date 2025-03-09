<template>
  <div class="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside
      :class="{
        'fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-30': true,
        '-translate-x-full': !appStore.sidebarOpen,
        'translate-x-0': appStore.sidebarOpen
      }"
      class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <router-link to="/" class="flex items-center space-x-2">
          <img src="@/assets/logo.svg" alt="Logo" class="h-8 w-8" />
          <span class="text-xl font-semibold dark:text-white">TMS</span>
        </router-link>
        <button
          @click="appStore.toggleSidebar"
          class="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 px-2 space-y-1">
        <!-- Dashboard -->
        <router-link
          to="/"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
          :class="[
            $route.path === '/' 
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
          ]"
        >
          <i class="fas fa-home mr-3 h-6 w-6"></i>
          Dashboard
        </router-link>

        <!-- Master Data -->
        <div v-if="authStore.hasPermission('view_master_data')">
          <button
            @click="toggleMenu('master')"
            class="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i class="fas fa-database mr-3 h-6 w-6"></i>
            Master Data
            <i
              class="ml-auto fas"
              :class="[openMenus.master ? 'fa-chevron-down' : 'fa-chevron-right']"
            ></i>
          </button>
          
          <div v-show="openMenus.master" class="ml-4 mt-1 space-y-1">
            <router-link
              v-for="(item, index) in masterMenuItems"
              :key="index"
              :to="item.path"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="[
                $route.path === item.path
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              ]"
            >
              <i :class="['fas', item.icon, 'mr-3 h-6 w-6']"></i>
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- Transactions -->
        <div v-if="authStore.hasPermission('view_transactions')">
          <button
            @click="toggleMenu('transactions')"
            class="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i class="fas fa-exchange-alt mr-3 h-6 w-6"></i>
            Transactions
            <i
              class="ml-auto fas"
              :class="[openMenus.transactions ? 'fa-chevron-down' : 'fa-chevron-right']"
            ></i>
          </button>
          
          <div v-show="openMenus.transactions" class="ml-4 mt-1 space-y-1">
            <router-link
              v-for="(item, index) in transactionMenuItems"
              :key="index"
              :to="item.path"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="[
                $route.path === item.path
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              ]"
            >
              <i :class="['fas', item.icon, 'mr-3 h-6 w-6']"></i>
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <!-- Reports -->
        <div v-if="authStore.hasPermission('view_reports')">
          <button
            @click="toggleMenu('reports')"
            class="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i class="fas fa-chart-bar mr-3 h-6 w-6"></i>
            Reports
            <i
              class="ml-auto fas"
              :class="[openMenus.reports ? 'fa-chevron-down' : 'fa-chevron-right']"
            ></i>
          </button>
          
          <div v-show="openMenus.reports" class="ml-4 mt-1 space-y-1">
            <router-link
              v-for="(item, index) in reportMenuItems"
              :key="index"
              :to="item.path"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="[
                $route.path === item.path
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              ]"
            >
              <i :class="['fas', item.icon, 'mr-3 h-6 w-6']"></i>
              {{ item.name }}
            </router-link>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div class="h-full px-4 flex items-center justify-between">
          <!-- Left -->
          <div class="flex items-center">
            <button
              @click="appStore.toggleSidebar"
              class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <i class="fas fa-bars"></i>
            </button>

            <!-- Breadcrumbs -->
            <nav class="hidden sm:flex ml-4" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li v-for="(crumb, index) in appStore.breadcrumbs" :key="index">
                  <div class="flex items-center">
                    <i
                      v-if="index > 0"
                      class="fas fa-chevron-right text-gray-400 mr-4"
                    ></i>
                    <router-link
                      :to="crumb.path"
                      :class="[
                        index === appStore.breadcrumbs.length - 1
                          ? 'text-gray-700 dark:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      ]"
                    >
                      {{ crumb.name }}
                    </router-link>
                  </div>
                </li>
              </ol>
            </nav>
          </div>

          <!-- Right -->
          <div class="flex items-center space-x-4">
            <!-- Branch Selector -->
            <div class="relative" v-if="authStore.hasPermission('view_branches')">
              <button
                @click="toggleBranchSelector"
                class="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span class="text-sm">{{ appStore.currentBranchName }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>

              <div
                v-if="showBranchSelector"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <a
                    v-for="branch in appStore.branches"
                    :key="branch.id"
                    href="#"
                    @click.prevent="selectBranch(branch)"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {{ branch.name }}
                  </a>
                </div>
              </div>
            </div>

            <!-- Dark Mode Toggle -->
            <button
              @click="appStore.toggleDarkMode"
              class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <i :class="['fas', appStore.darkMode ? 'fa-sun' : 'fa-moon']"></i>
            </button>

            <!-- User Menu -->
            <div class="relative">
              <button
                @click="toggleUserMenu"
                class="flex items-center space-x-2"
              >
                <img
                  :src="userAvatar"
                  alt="User avatar"
                  class="h-8 w-8 rounded-full"
                />
                <span class="text-sm dark:text-white">{{ authStore.user?.fullName }}</span>
                <i class="fas fa-chevron-down"></i>
              </button>

              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <i class="fas fa-user mr-2"></i>
                    Profile
                  </router-link>
                  <a
                    href="#"
                    @click.prevent="authStore.logout"
                    class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

const authStore = useAuthStore();
const appStore = useAppStore();

// Menu state
const openMenus = ref({
  master: false,
  transactions: false,
  reports: false
});

const showBranchSelector = ref(false);
const showUserMenu = ref(false);

// Menu items
const masterMenuItems = [
  { name: 'Branches', path: '/master/branches', icon: 'fa-building' },
  { name: 'Account Groups', path: '/master/account-groups', icon: 'fa-layer-group' },
  { name: 'Places', path: '/master/places', icon: 'fa-map-marker-alt' },
  { name: 'Trucks', path: '/master/trucks', icon: 'fa-truck' },
  { name: 'Drivers', path: '/master/drivers', icon: 'fa-user' }
];

const transactionMenuItems = [
  { name: 'Ledger', path: '/transactions/ledger', icon: 'fa-book' },
  { name: 'Invoices', path: '/transactions/invoices', icon: 'fa-file-invoice' },
  { name: 'Manifests', path: '/transactions/manifests', icon: 'fa-clipboard-list' },
  { name: 'Freight Challans', path: '/transactions/freight-challans', icon: 'fa-receipt' },
  { name: 'Goods Receipts', path: '/transactions/goods-receipts', icon: 'fa-box' },
  { name: 'Goods Deliveries', path: '/transactions/goods-deliveries', icon: 'fa-truck-loading' }
];

const reportMenuItems = [
  { name: 'Ledger Statement', path: '/reports/ledger-statement', icon: 'fa-file-alt' },
  { name: 'Party Statement', path: '/reports/party-statement', icon: 'fa-users' },
  { name: 'Freight Report', path: '/reports/freight-report', icon: 'fa-chart-line' },
  { name: 'Truck Report', path: '/reports/truck-report', icon: 'fa-truck' },
  { name: 'Profit & Loss', path: '/reports/profit-loss', icon: 'fa-chart-pie' }
];

// Computed
const userAvatar = computed(() => {
  return authStore.user?.avatar || 'https://ui-avatars.com/api/?name=' + 
    encodeURIComponent(authStore.user?.fullName || 'User');
});

// Methods
const toggleMenu = (menu) => {
  openMenus.value[menu] = !openMenus.value[menu];
};

const toggleBranchSelector = () => {
  showBranchSelector.value = !showBranchSelector.value;
  showUserMenu.value = false;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showBranchSelector.value = false;
};

const selectBranch = (branch) => {
  appStore.setCurrentBranch(branch);
  showBranchSelector.value = false;
};

// Click outside handlers
const handleClickOutside = (event) => {
  const userMenuButton = document.querySelector('#user-menu-button');
  const branchSelectorButton = document.querySelector('#branch-selector-button');
  
  if (!userMenuButton?.contains(event.target)) {
    showUserMenu.value = false;
  }
  
  if (!branchSelectorButton?.contains(event.target)) {
    showBranchSelector.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
