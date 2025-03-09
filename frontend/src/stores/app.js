import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarOpen = ref(true);
  const currentBranch = ref(null);
  const branches = ref([]);
  const darkMode = ref(localStorage.getItem('darkMode') === 'true');
  const loading = ref(false);
  const breadcrumbs = ref([]);

  // Settings
  const settings = ref({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    vatNumber: '',
    panNumber: '',
    logo: null,
    dateFormat: 'YYYY-MM-DD',
    currency: 'NPR',
    language: 'en',
    timezone: 'Asia/Kathmandu'
  });

  // Computed
  const isMobile = computed(() => window.innerWidth < 768);
  
  const currentBranchName = computed(() => {
    return currentBranch.value?.name || 'All Branches';
  });

  // Actions
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value;
    localStorage.setItem('darkMode', darkMode.value);
    updateTheme();
  };

  const updateTheme = () => {
    if (darkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const setBranches = (newBranches) => {
    branches.value = newBranches;
  };

  const setCurrentBranch = (branch) => {
    currentBranch.value = branch;
    localStorage.setItem('currentBranch', JSON.stringify(branch));
  };

  const setBreadcrumbs = (items) => {
    breadcrumbs.value = items;
  };

  const updateSettings = async (newSettings) => {
    try {
      loading.value = true;
      // Here you would typically make an API call to update settings
      settings.value = { ...settings.value, ...newSettings };
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Initialize
  const initialize = () => {
    // Load dark mode
    updateTheme();

    // Load current branch from localStorage
    const savedBranch = localStorage.getItem('currentBranch');
    if (savedBranch) {
      currentBranch.value = JSON.parse(savedBranch);
    }

    // Handle mobile sidebar
    if (isMobile.value) {
      sidebarOpen.value = false;
    }

    // Add window resize listener
    window.addEventListener('resize', () => {
      if (isMobile.value && sidebarOpen.value) {
        sidebarOpen.value = false;
      }
    });
  };

  // Call initialize
  initialize();

  return {
    // State
    sidebarOpen,
    currentBranch,
    branches,
    darkMode,
    loading,
    settings,
    breadcrumbs,

    // Computed
    isMobile,
    currentBranchName,

    // Actions
    toggleSidebar,
    toggleDarkMode,
    setBranches,
    setCurrentBranch,
    setBreadcrumbs,
    updateSettings
  };
});
