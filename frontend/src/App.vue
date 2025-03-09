<template>
  <div class="min-h-screen" :class="{ 'dark': appStore.darkMode }">
    <!-- Loading Overlay -->
    <div v-if="authStore.loading || appStore.loading" 
         class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div class="loading-spinner"></div>
    </div>

    <!-- Main Content -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- Toast Container (automatically handled by vue-toastification) -->
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useAppStore } from './stores/app';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const appStore = useAppStore();
const router = useRouter();

// Handle authentication token expiration
let tokenCheckInterval;

onMounted(() => {
  // Check token expiration every minute
  tokenCheckInterval = setInterval(() => {
    if (authStore.token) {
      const tokenData = JSON.parse(atob(authStore.token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // If token expires in less than 5 minutes, refresh it
      if (expirationTime - currentTime < 300000) {
        authStore.checkAuth();
      }
      
      // If token is expired, logout
      if (currentTime > expirationTime) {
        authStore.logout();
      }
    }
  }, 60000);

  // Handle network status
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  clearInterval(tokenCheckInterval);
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});

// Network status handlers
const handleOnline = () => {
  // Refresh data when coming back online
  if (authStore.isAuthenticated) {
    authStore.checkAuth();
  }
};

const handleOffline = () => {
  // Show offline notification
  toast.warning('You are currently offline');
};

// Handle keyboard shortcuts
const handleKeyPress = (event) => {
  // Ctrl/Cmd + / to toggle dark mode
  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    appStore.toggleDarkMode();
  }
  
  // Ctrl/Cmd + B to toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault();
    appStore.toggleSidebar();
  }
};

// Add keyboard shortcut listener
document.addEventListener('keydown', handleKeyPress);
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress);
});
</script>

<style>
/* Transition Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Dark Mode Styles */
.dark {
  @apply bg-gray-900 text-white;
}

.dark .card {
  @apply bg-gray-800 border-gray-700;
}

.dark .table th {
  @apply bg-gray-800 text-gray-200;
}

.dark .table td {
  @apply border-gray-700 text-gray-300;
}

.dark .table tr:hover {
  @apply bg-gray-700;
}

.dark .form-input {
  @apply bg-gray-700 border-gray-600 text-white;
}

.dark .form-input:focus {
  @apply border-blue-500;
}

/* Loading Spinner Animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  @apply w-12 h-12;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Scrollbar Styles */
::-webkit-scrollbar {
  @apply w-2;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 dark:bg-gray-600 rounded;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500 dark:bg-gray-500;
}

/* Global Utility Classes */
.card {
  @apply bg-white rounded-lg shadow-sm p-6;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700;
}

.form-input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.form-error {
  @apply text-sm text-red-600 dark:text-red-400 mt-1;
}
</style>
