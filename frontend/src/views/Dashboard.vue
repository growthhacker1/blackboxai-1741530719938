<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
      <div class="flex items-center space-x-4">
        <button
          @click="refreshData"
          class="btn btn-primary"
          :disabled="loading"
        >
          <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Revenue -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(stats.totalRevenue) }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <i class="fas fa-money-bill-wave text-blue-600 dark:text-blue-400"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <span :class="[
              'text-sm font-medium',
              stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            ]">
              <i :class="[
                'fas',
                stats.revenueGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
              ]"></i>
              {{ Math.abs(stats.revenueGrowth) }}%
            </span>
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">vs last month</span>
          </div>
        </div>
      </div>

      <!-- Total Shipments -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.totalShipments }}
            </p>
          </div>
          <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
            <i class="fas fa-truck text-green-600 dark:text-green-400"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <span :class="[
              'text-sm font-medium',
              stats.shipmentGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            ]">
              <i :class="[
                'fas',
                stats.shipmentGrowth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'
              ]"></i>
              {{ Math.abs(stats.shipmentGrowth) }}%
            </span>
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">vs last month</span>
          </div>
        </div>
      </div>

      <!-- Active Trucks -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Trucks</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ stats.activeTrucks }}
            </p>
          </div>
          <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
            <i class="fas fa-truck-moving text-yellow-600 dark:text-yellow-400"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ stats.totalTrucks }} Total
            </span>
            <span class="mx-2 text-gray-500 dark:text-gray-400">•</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              {{ ((stats.activeTrucks / stats.totalTrucks) * 100).toFixed(1) }}% Active
            </span>
          </div>
        </div>
      </div>

      <!-- Pending Payments -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {{ formatCurrency(stats.pendingPayments) }}
            </p>
          </div>
          <div class="p-3 bg-red-100 dark:bg-red-900 rounded-full">
            <i class="fas fa-clock text-red-600 dark:text-red-400"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center">
            <span class="text-sm font-medium text-gray-900 dark:text-white">
              {{ stats.overduePayments }} Overdue
            </span>
            <span class="mx-2 text-gray-500 dark:text-gray-400">•</span>
            <router-link
              to="/transactions/ledger"
              class="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View All
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
        <LineChart
          :chart-data="revenueChartData"
          :options="revenueChartOptions"
          class="h-80"
        />
      </div>

      <!-- Shipments Chart -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipments Overview</h3>
        <DoughnutChart
          :chart-data="shipmentChartData"
          :options="shipmentChartOptions"
          class="h-80"
        />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
        <div class="mt-4">
          <div v-if="loading" class="flex justify-center py-4">
            <div class="loading-spinner"></div>
          </div>
          <div v-else-if="activities.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            No recent activities
          </div>
          <div v-else class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in activities" :key="activity.id">
                <div class="relative pb-8">
                  <span
                    v-if="index !== activities.length - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span
                        :class="[
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800',
                          activityTypeStyles[activity.type].bgColor
                        ]"
                      >
                        <i
                          :class="[
                            'fas',
                            activityTypeStyles[activity.type].icon,
                            activityTypeStyles[activity.type].textColor
                          ]"
                        ></i>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-900 dark:text-white">
                          {{ activity.description }}
                        </p>
                        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {{ activity.details }}
                        </p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <time :datetime="activity.timestamp">{{ formatDate(activity.timestamp) }}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Line as LineChart, Doughnut as DoughnutChart } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// State
const loading = ref(false);
const stats = ref({
  totalRevenue: 0,
  revenueGrowth: 0,
  totalShipments: 0,
  shipmentGrowth: 0,
  activeTrucks: 0,
  totalTrucks: 0,
  pendingPayments: 0,
  overduePayments: 0
});

const activities = ref([]);

// Activity type styles
const activityTypeStyles = {
  shipment: {
    bgColor: 'bg-green-100 dark:bg-green-900',
    textColor: 'text-green-600 dark:text-green-400',
    icon: 'fa-truck'
  },
  payment: {
    bgColor: 'bg-blue-100 dark:bg-blue-900',
    textColor: 'text-blue-600 dark:text-blue-400',
    icon: 'fa-money-bill-wave'
  },
  alert: {
    bgColor: 'bg-red-100 dark:bg-red-900',
    textColor: 'text-red-600 dark:text-red-400',
    icon: 'fa-exclamation-triangle'
  },
  info: {
    bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    icon: 'fa-info-circle'
  }
};

// Chart data
const revenueChartData = ref({
  labels: [],
  datasets: [{
    label: 'Revenue',
    data: [],
    borderColor: '#3B82F6',
    tension: 0.4
  }]
});

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => formatCurrency(value)
      }
    }
  }
};

const shipmentChartData = ref({
  labels: ['Delivered', 'In Transit', 'Pending'],
  datasets: [{
    data: [0, 0, 0],
    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B']
  }]
});

const shipmentChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

// Methods
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR'
  }).format(value);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-NP', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
};

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/dashboard');
    const data = response.data.data;

    // Update stats
    stats.value = data.stats;

    // Update revenue chart
    revenueChartData.value.labels = data.revenueChart.labels;
    revenueChartData.value.datasets[0].data = data.revenueChart.data;

    // Update shipment chart
    shipmentChartData.value.datasets[0].data = data.shipmentChart;

    // Update activities
    activities.value = data.activities;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchDashboardData();
};

// Lifecycle hooks
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.loading-spinner {
  @apply animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600;
}
</style>
