<template>
  <div>
    <!-- Success Message -->
    <div v-if="emailSent" class="rounded-md bg-green-50 dark:bg-green-900 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-check-circle text-green-400"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
            Reset instructions sent!
          </h3>
          <div class="mt-2 text-sm text-green-700 dark:text-green-300">
            <p>
              We've sent password reset instructions to your email address.
              Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
          <div class="mt-4">
            <router-link
              to="/auth/login"
              class="text-sm font-medium text-green-800 dark:text-green-200 hover:text-green-700 dark:hover:text-green-100"
            >
              Return to login
              <span aria-hidden="true"> &rarr;</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email address
        </label>
        <div class="mt-1">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            autocomplete="email"
            class="form-input"
            :class="{ 'border-red-500': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-sm text-red-600">
            {{ errors.email }}
          </p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="!loading">Send Reset Instructions</span>
          <div v-else class="loading-spinner"></div>
        </button>
      </div>

      <!-- Back to Login -->
      <div class="text-sm text-center">
        <router-link
          to="/auth/login"
          class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <i class="fas fa-arrow-left mr-1"></i>
          Back to login
        </router-link>
      </div>

      <!-- Help Text -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Need help?
            </span>
          </div>
        </div>

        <div class="mt-6 text-center text-sm">
          <p class="text-gray-600 dark:text-gray-400">
            If you're having trouble accessing your account, please contact
            <a
              href="mailto:support@example.com"
              class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              our support team
            </a>
          </p>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const authStore = useAuthStore();
const toast = useToast();

// Form state
const form = reactive({
  email: ''
});

const errors = reactive({
  email: ''
});

const loading = ref(false);
const emailSent = ref(false);

// Methods
const validateForm = () => {
  let isValid = true;
  errors.email = '';

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await authStore.forgotPassword(form.email);
    emailSent.value = true;
  } catch (error) {
    if (error.response?.data?.errors?.email) {
      errors.email = error.response.data.errors.email[0];
    } else {
      toast.error('Failed to send reset instructions. Please try again.');
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
