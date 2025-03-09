<template>
  <div>
    <!-- Success Message -->
    <div v-if="passwordReset" class="rounded-md bg-green-50 dark:bg-green-900 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-check-circle text-green-400"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
            Password reset successful!
          </h3>
          <div class="mt-2 text-sm text-green-700 dark:text-green-300">
            <p>
              Your password has been successfully reset.
              You can now log in with your new password.
            </p>
          </div>
          <div class="mt-4">
            <router-link
              to="/auth/login"
              class="text-sm font-medium text-green-800 dark:text-green-200 hover:text-green-700 dark:hover:text-green-100"
            >
              Proceed to login
              <span aria-hidden="true"> &rarr;</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Reset Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Password Field -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          New Password
        </label>
        <div class="mt-1 relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
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

      <!-- Confirm Password Field -->
      <div>
        <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Confirm New Password
        </label>
        <div class="mt-1 relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            autocomplete="new-password"
            class="form-input pr-10"
            :class="{ 'border-red-500': errors.confirmPassword }"
          />
          <button
            type="button"
            @click="toggleConfirmPassword"
            class="absolute inset-y-0 right-0 px-3 flex items-center"
          >
            <i :class="['fas', showConfirmPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
          </button>
          <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
            {{ errors.confirmPassword }}
          </p>
        </div>
      </div>

      <!-- Password Requirements -->
      <div class="rounded-md bg-blue-50 dark:bg-blue-900 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-info-circle text-blue-400"></i>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
              Password Requirements
            </h3>
            <div class="mt-2 text-sm text-blue-700 dark:text-blue-300">
              <ul class="list-disc pl-5 space-y-1">
                <li>At least 8 characters long</li>
                <li>Must contain at least one uppercase letter</li>
                <li>Must contain at least one lowercase letter</li>
                <li>Must contain at least one number</li>
                <li>Must contain at least one special character</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="!loading">Reset Password</span>
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
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

// Form state
const form = reactive({
  password: '',
  confirmPassword: ''
});

const errors = reactive({
  password: '',
  confirmPassword: ''
});

const loading = ref(false);
const passwordReset = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Methods
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const validateForm = () => {
  let isValid = true;
  errors.password = '';
  errors.confirmPassword = '';

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required';
    isValid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    isValid = false;
  } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(form.password)) {
    errors.password = 'Password must contain uppercase, lowercase, number, and special character';
    isValid = false;
  }

  // Confirm Password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await authStore.resetPassword(route.params.token, form.password);
    passwordReset.value = true;
  } catch (error) {
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        errors[key] = serverErrors[key][0];
      });
    } else {
      toast.error('Failed to reset password. Please try again.');
    }
  } finally {
    loading.value = false;
  }
};

// Validate token on mount
onMounted(async () => {
  if (!route.params.token) {
    toast.error('Invalid reset token');
    router.push('/auth/login');
    return;
  }

  try {
    // Optional: Verify token validity with backend
    // await authStore.verifyResetToken(route.params.token);
  } catch (error) {
    toast.error('Invalid or expired reset token');
    router.push('/auth/forgot-password');
  }
});
</script>

<style scoped>
.form-input {
  @apply appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white;
}

.loading-spinner {
  @apply animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent;
}
</style>
