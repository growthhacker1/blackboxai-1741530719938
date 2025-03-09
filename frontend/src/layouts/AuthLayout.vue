<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Logo -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <router-link to="/" class="flex justify-center">
        <img src="@/assets/logo.svg" alt="Logo" class="h-12 w-auto" />
      </router-link>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
        {{ title }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        {{ subtitle }}
      </p>
    </div>

    <!-- Auth Card -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Router View -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

    <!-- Footer Links -->
    <div class="mt-8 text-center">
      <div class="space-x-4">
        <a
          href="#"
          class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Terms of Service
        </a>
        <span class="text-gray-400">|</span>
        <a
          href="#"
          class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Privacy Policy
        </a>
        <span class="text-gray-400">|</span>
        <a
          href="#"
          class="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Contact Support
        </a>
      </div>
      <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        &copy; {{ currentYear }} Transport Management System. All rights reserved.
      </div>
    </div>

    <!-- Dark Mode Toggle -->
    <button
      @click="appStore.toggleDarkMode"
      class="fixed bottom-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
    >
      <i :class="['fas', appStore.darkMode ? 'fa-sun' : 'fa-moon']"></i>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';

const route = useRoute();
const appStore = useAppStore();

// Computed properties
const currentYear = computed(() => new Date().getFullYear());

const title = computed(() => {
  switch (route.name) {
    case 'login':
      return 'Sign in to your account';
    case 'register':
      return 'Create a new account';
    case 'forgot-password':
      return 'Reset your password';
    case 'reset-password':
      return 'Set new password';
    default:
      return 'Welcome back';
  }
});

const subtitle = computed(() => {
  switch (route.name) {
    case 'login':
      return 'Enter your credentials to access your account';
    case 'register':
      return 'Fill in your information to create an account';
    case 'forgot-password':
      return 'Enter your email to receive password reset instructions';
    case 'reset-password':
      return 'Enter your new password';
    default:
      return '';
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
