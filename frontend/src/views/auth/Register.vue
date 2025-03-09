<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Full Name Field -->
    <div>
      <label for="fullName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Full Name
      </label>
      <div class="mt-1">
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          required
          autocomplete="name"
          class="form-input"
          :class="{ 'border-red-500': errors.fullName }"
        />
        <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">
          {{ errors.fullName }}
        </p>
      </div>
    </div>

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

    <!-- Email Field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Email
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

    <!-- Mobile Field -->
    <div>
      <label for="mobile" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Mobile Number
      </label>
      <div class="mt-1">
        <input
          id="mobile"
          v-model="form.mobile"
          type="tel"
          required
          autocomplete="tel"
          class="form-input"
          :class="{ 'border-red-500': errors.mobile }"
        />
        <p v-if="errors.mobile" class="mt-1 text-sm text-red-600">
          {{ errors.mobile }}
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
        Confirm Password
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

    <!-- Terms and Conditions -->
    <div class="flex items-center">
      <input
        id="terms"
        v-model="form.acceptTerms"
        type="checkbox"
        required
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        :class="{ 'border-red-500': errors.acceptTerms }"
      />
      <label for="terms" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
        I agree to the
        <a href="#" class="text-blue-600 hover:text-blue-500">Terms and Conditions</a>
        and
        <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
      </label>
    </div>

    <!-- Submit Button -->
    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <span v-if="!loading">Create Account</span>
        <div v-else class="loading-spinner"></div>
      </button>
    </div>

    <!-- Login Link -->
    <div class="text-sm text-center">
      <span class="text-gray-600 dark:text-gray-400">Already have an account?</span>
      <router-link
        to="/auth/login"
        class="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
      >
        Sign in
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
  fullName: '',
  username: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
});

const errors = reactive({
  fullName: '',
  username: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  acceptTerms: ''
});

const loading = ref(false);
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
  
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  // Full Name validation
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required';
    isValid = false;
  }

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username is required';
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
    isValid = false;
  }

  // Email validation
  if (!form.email.trim()) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
    isValid = false;
  }

  // Mobile validation
  if (!form.mobile.trim()) {
    errors.mobile = 'Mobile number is required';
    isValid = false;
  } else if (!/^[0-9+\-\s()]*$/.test(form.mobile)) {
    errors.mobile = 'Invalid mobile number format';
    isValid = false;
  }

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

  // Terms acceptance validation
  if (!form.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    loading.value = true;
    await authStore.register({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      mobile: form.mobile,
      password: form.password
    });
    toast.success('Registration successful! Please check your email for verification.');
  } catch (error) {
    if (error.response?.data?.errors) {
      const serverErrors = error.response.data.errors;
      Object.keys(serverErrors).forEach(key => {
        errors[key] = serverErrors[key][0];
      });
    } else {
      toast.error('Registration failed. Please try again.');
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
