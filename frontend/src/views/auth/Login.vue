<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Username Field -->
    <div>
      <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Username
      </label>
      <div class="mt-1">
        <input
          id="username"
          v-model="form.username"
          type="text"
          required
          autocomplete="username"
          class="form-input"
          :class="{ 'border-red-500': errors.username }"
        />
        <p v-if="errors.username" class="mt-1 text-sm text-red-600">
          {{ errors.username }}
        </p>
      </div>
    </div>

    <!-- Password Field -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Password
      </label>
      <div class="mt-1 relative">
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          required
          autocomplete="current-password"
          class="form-input pr-10"
          :class="{ 'border-red-500': errors.password }"
        />
        <button
          type="button"
          @click="togglePassword"
          class="absolute inset-y-0 right-0 px-3 flex items-center"
        >
          <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
        </button>
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">
          {{ errors.password }}
        </p>
      </div>
    </div>

    <!-- Remember Me & Forgot Password -->
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember-me"
          v-model="form.rememberMe"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          Remember me
        </label>
      </div>

      <div class="text-sm">
        <router-link
          to="/auth/forgot-password"
          class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Forgot your password?
        </router-link>
      </div>
    </div>

    <!-- Submit Button -->
    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <span v-if="!loading">Sign in</span>
        <div v-else class="loading-spinner"></div>
      </button>
    </div>

    <!-- Register Link -->
    <div class="text-sm text-center">
      <span class="text-gray-600 dark:text-gray-400">Don't have an account?</span>
      <router-link
        to="/auth/register"
        class="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Sign up now
      </router-link>
    </div>

    <!-- Client Portal Link -->
    <div class="text-sm text-center">
      <router-link
        to="/client-portal/login"
        class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Login to Client Portal
      </router-link>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

// Form state
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
});

const errors = reactive({
  username: '',
  password: ''
});

const loading = ref(false);
const showPassword = ref(false);

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const validateForm = () => {
  let isValid = true;
  errors.username = '';
  errors.password = '';

  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  }

  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await authStore.login({
      username: form.username,
      password: form.password,
      rememberMe: form.rememberMe
    });
  } catch (error) {
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        errors[key] = serverErrors[key][0];
      });
    } else {
      toast.error('Failed to sign in. Please check your credentials.');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.form-input {
  @apply appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white;
}

.loading-spinner {
  @apply animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent;
}
</style>
