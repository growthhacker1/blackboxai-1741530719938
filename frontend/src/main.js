import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import axios from 'axios';
import { useAuthStore } from './stores/auth';
import { useAppStore } from './stores/app';

// Import styles
import 'vue-toastification/dist/index.css';
import './assets/main.css';

// Configure axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Axios interceptors
axios.interceptors.response.use(
  response => response,
  error => {
    const status = error.response ? error.response.status : null;

    // Handle 401 Unauthorized
    if (status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
    }

    // Handle 403 Forbidden
    if (status === 403) {
      router.push('/403');
    }

    // Handle 404 Not Found
    if (status === 404) {
      router.push('/404');
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      router.push('/500');
    }

    return Promise.reject(error);
  }
);

// Create Vue app
const app = createApp(App);

// Use Pinia
const pinia = createPinia();
app.use(pinia);

// Initialize stores
const authStore = useAuthStore();
const appStore = useAppStore();

// Configure toast
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
};

// Use plugins
app.use(router);
app.use(Toast, toastOptions);

// Global error handler
app.config.errorHandler = (error, vm, info) => {
  console.error('Global error:', error);
  console.error('Error info:', info);
};

// Global properties
app.config.globalProperties.$axios = axios;

// Global directives
app.directive('focus', {
  mounted: (el) => el.focus()
});

app.directive('click-outside', {
  mounted: (el, binding) => {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted: (el) => {
    document.removeEventListener('click', el.clickOutsideEvent);
  }
});

// Global filters
app.config.globalProperties.$filters = {
  currency: (value, currency = 'NPR') => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: currency
    }).format(value);
  },
  
  date: (value, format = 'YYYY-MM-DD') => {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-NP');
  },
  
  capitalize: (value) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
};

// Check authentication on app start
const initializeApp = async () => {
  try {
    // Check if user is authenticated
    if (authStore.token) {
      await authStore.checkAuth();
    }

    // Mount the app
    app.mount('#app');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Mount the app anyway to show error state
    app.mount('#app');
  }
};

// Initialize the application
initializeApp();

// Export app instance
export default app;
