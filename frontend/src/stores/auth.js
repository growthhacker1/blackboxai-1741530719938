import { defineStore } from 'pinia';
import axios from 'axios';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  // Router and Toast instances
  const router = useRouter();
  const toast = useToast();

  // State
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const loading = ref(false);

  // Computed
  const isAuthenticated = computed(() => !!token.value);
  
  const hasPermission = computed(() => (permission) => {
    return user.value?.permissions?.includes(permission) || false;
  });

  const hasRole = computed(() => (role) => {
    return user.value?.role === role;
  });

  // Actions
  const setAuthHeader = () => {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const login = async (credentials) => {
    try {
      loading.value = true;
      const response = await axios.post('/api/auth/login', credentials);
      
      const { token: newToken, user: userData } = response.data.data;
      
      token.value = newToken;
      user.value = userData;
      
      localStorage.setItem('token', newToken);
      setAuthHeader();

      // Redirect to intended route or dashboard
      const redirectPath = router.currentRoute.value.query.redirect || '/';
      await router.push(redirectPath);

      toast.success('Successfully logged in');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData) => {
    try {
      loading.value = true;
      await axios.post('/api/auth/register', userData);
      toast.success('Registration successful. Please login.');
      await router.push('/auth/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      // Optional: Call logout endpoint if you need to invalidate token on server
      // await axios.post('/api/auth/logout');
      
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      setAuthHeader();
      
      await router.push('/auth/login');
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    if (!token.value) return;

    try {
      loading.value = true;
      const response = await axios.get('/api/auth/user');
      user.value = response.data.data;
    } catch (error) {
      token.value = null;
      user.value = null;
      localStorage.removeItem('token');
      setAuthHeader();
      await router.push('/auth/login');
    } finally {
      loading.value = false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      loading.value = true;
      await axios.post('/api/auth/forgot-password', { email });
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset instructions');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      loading.value = true;
      await axios.post('/api/auth/reset-password', { token, password });
      toast.success('Password successfully reset. Please login with your new password.');
      await router.push('/auth/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      loading.value = true;
      await axios.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password successfully changed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      loading.value = true;
      const response = await axios.put('/api/auth/profile', profileData);
      user.value = response.data.data;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Initialize auth header
  setAuthHeader();

  return {
    // State
    user,
    token,
    loading,

    // Computed
    isAuthenticated,
    hasPermission,
    hasRole,

    // Actions
    login,
    register,
    logout,
    checkAuth,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile
  };
});
