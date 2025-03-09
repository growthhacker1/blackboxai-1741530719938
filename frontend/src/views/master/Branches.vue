<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Branch Management</h1>
      <button
        v-if="authStore.hasPermission('create_branches')"
        @click="openCreateModal"
        class="btn btn-primary"
      >
        <i class="fas fa-plus mr-2"></i>
        Add Branch
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search branches..."
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select v-model="filters.status" class="form-input">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Region
          </label>
          <select v-model="filters.region" class="form-input">
            <option value="">All Regions</option>
            <option v-for="region in regions" :key="region" :value="region">
              {{ region }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Branches Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {{ column.label }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="animate-pulse">
              <td :colspan="columns.length + 1" class="px-6 py-4">
                <div class="flex justify-center">
                  <div class="loading-spinner"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredBranches.length === 0">
              <td :colspan="columns.length + 1" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No branches found
              </td>
            </tr>
            <tr
              v-for="branch in filteredBranches"
              :key="branch.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ branch.code }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ branch.name }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ branch.region }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ branch.manager }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ branch.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    branch.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  ]"
                >
                  {{ branch.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="authStore.hasPermission('edit_branches')"
                  @click="editBranch(branch)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="authStore.hasPermission('delete_branches')"
                  @click="confirmDelete(branch)"
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="btn btn-secondary"
          >
            Previous
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="btn btn-secondary"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Showing
              <span class="font-medium">{{ paginationStart }}</span>
              to
              <span class="font-medium">{{ paginationEnd }}</span>
              of
              <span class="font-medium">{{ totalItems }}</span>
              results
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                :disabled="currentPage === 1"
                @click="currentPage = 1"
                class="btn-pagination"
              >
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                :disabled="currentPage === 1"
                @click="currentPage--"
                class="btn-pagination"
              >
                <i class="fas fa-angle-left"></i>
              </button>
              <button
                v-for="page in displayedPages"
                :key="page"
                @click="currentPage = page"
                :class="[
                  'btn-pagination',
                  currentPage === page
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-300'
                ]"
              >
                {{ page }}
              </button>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage++"
                class="btn-pagination"
              >
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                :disabled="currentPage === totalPages"
                @click="currentPage = totalPages"
                class="btn-pagination"
              >
                <i class="fas fa-angle-double-right"></i>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Modal
      v-if="showModal"
      :title="isEditing ? 'Edit Branch' : 'Create Branch'"
      @close="closeModal"
    >
      <form @submit.prevent="saveBranch" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Branch Code -->
          <div>
            <label class="form-label" for="code">Branch Code</label>
            <input
              id="code"
              v-model="branchForm.code"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.code }"
            />
            <p v-if="errors.code" class="form-error">{{ errors.code }}</p>
          </div>

          <!-- Branch Name -->
          <div>
            <label class="form-label" for="name">Branch Name</label>
            <input
              id="name"
              v-model="branchForm.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <!-- Region -->
          <div>
            <label class="form-label" for="region">Region</label>
            <select
              id="region"
              v-model="branchForm.region"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.region }"
            >
              <option value="">Select Region</option>
              <option v-for="region in regions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
            <p v-if="errors.region" class="form-error">{{ errors.region }}</p>
          </div>

          <!-- Manager -->
          <div>
            <label class="form-label" for="manager">Branch Manager</label>
            <input
              id="manager"
              v-model="branchForm.manager"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.manager }"
            />
            <p v-if="errors.manager" class="form-error">{{ errors.manager }}</p>
          </div>

          <!-- Phone -->
          <div>
            <label class="form-label" for="phone">Phone</label>
            <input
              id="phone"
              v-model="branchForm.phone"
              type="tel"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.phone }"
            />
            <p v-if="errors.phone" class="form-error">{{ errors.phone }}</p>
          </div>

          <!-- Status -->
          <div>
            <label class="form-label" for="status">Status</label>
            <select
              id="status"
              v-model="branchForm.status"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.status }"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p v-if="errors.status" class="form-error">{{ errors.status }}</p>
          </div>

          <!-- Address -->
          <div class="md:col-span-2">
            <label class="form-label" for="address">Address</label>
            <textarea
              id="address"
              v-model="branchForm.address"
              rows="3"
              class="form-input"
              :class="{ 'border-red-500': errors.address }"
            ></textarea>
            <p v-if="errors.address" class="form-error">{{ errors.address }}</p>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
            {{ isEditing ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- Delete Confirmation Modal -->
    <Modal
      v-if="showDeleteModal"
      title="Confirm Delete"
      @close="closeDeleteModal"
    >
      <div class="p-6">
        <p class="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the branch "{{ branchToDelete?.name }}"?
          This action cannot be undone.
        </p>
        <div class="mt-6 flex justify-end space-x-3">
          <button
            @click="closeDeleteModal"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            @click="deleteBranch"
            class="btn btn-danger"
            :disabled="deleting"
          >
            <i v-if="deleting" class="fas fa-spinner fa-spin mr-2"></i>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'vue-toastification';
import Modal from '@/components/Modal.vue';
import axios from 'axios';

const authStore = useAuthStore();
const toast = useToast();

// Table columns
const columns = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Branch Name' },
  { key: 'manager', label: 'Manager' },
  { key: 'status', label: 'Status' }
];

// State
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const branches = ref([]);
const branchToDelete = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const regions = [
  'Province 1',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
];

const filters = reactive({
  search: '',
  status: '',
  region: ''
});

const branchForm = reactive({
  code: '',
  name: '',
  region: '',
  manager: '',
  phone: '',
  address: '',
  status: 'active'
});

const errors = reactive({
  code: '',
  name: '',
  region: '',
  manager: '',
  phone: '',
  address: '',
  status: ''
});

// Computed
const filteredBranches = computed(() => {
  let filtered = [...branches.value];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(branch =>
      branch.name.toLowerCase().includes(search) ||
      branch.code.toLowerCase().includes(search) ||
      branch.manager.toLowerCase().includes(search)
    );
  }

  if (filters.status) {
    filtered = filtered.filter(branch => branch.status === filters.status);
  }

  if (filters.region) {
    filtered = filtered.filter(branch => branch.region === filters.region);
  }

  return filtered;
});

const totalItems = computed(() => filteredBranches.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedBranches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredBranches.value.slice(start, end);
});

const paginationStart = computed(() => {
  return (currentPage.value - 1) * itemsPerPage + 1;
});

const paginationEnd = computed(() => {
  return Math.min(currentPage.value * itemsPerPage, totalItems.value);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxPages = 5;
  const halfMaxPages = Math.floor(maxPages / 2);

  let startPage = Math.max(1, currentPage.value - halfMaxPages);
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1);

  if (endPage - startPage + 1 < maxPages) {
    startPage = Math.max(1, endPage - maxPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

// Methods
const fetchBranches = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/master/branches');
    branches.value = response.data.data;
  } catch (error) {
    toast.error('Failed to fetch branches');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  Object.keys(branchForm).forEach(key => {
    branchForm[key] = key === 'status' ? 'active' : '';
  });
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  showModal.value = true;
};

const editBranch = (branch) => {
  isEditing.value = true;
  Object.keys(branchForm).forEach(key => {
    branchForm[key] = branch[key];
  });
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });

  if (!branchForm.code) {
    errors.code = 'Branch code is required';
    isValid = false;
  }

  if (!branchForm.name) {
    errors.name = 'Branch name is required';
    isValid = false;
  }

  if (!branchForm.region) {
    errors.region = 'Region is required';
    isValid = false;
  }

  if (!branchForm.manager) {
    errors.manager = 'Branch manager is required';
    isValid = false;
  }

  if (!branchForm.phone) {
    errors.phone = 'Phone number is required';
    isValid = false;
  } else if (!/^[0-9+\-\s()]*$/.test(branchForm.phone)) {
    errors.phone = 'Invalid phone number format';
    isValid = false;
  }

  return isValid;
};

const saveBranch = async () => {
  if (!validateForm()) return;

  try {
    saving.value = true;
    if (isEditing.value) {
      await axios.put(`/api/master/branches/${branchForm.id}`, branchForm);
      toast.success('Branch updated successfully');
    } else {
      await axios.post('/api/master/branches', branchForm);
      toast.success('Branch created successfully');
    }
    await fetchBranches();
    closeModal();
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.keys(error.response.data.errors).forEach(key => {
        errors[key] = error.response.data.errors[key][0];
      });
    } else {
      toast.error(isEditing.value ? 'Failed to update branch' : 'Failed to create branch');
    }
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (branch) => {
  branchToDelete.value = branch;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  branchToDelete.value = null;
};

const deleteBranch = async () => {
  try {
    deleting.value = true;
    await axios.delete(`/api/master/branches/${branchToDelete.value.id}`);
    toast.success('Branch deleted successfully');
    await fetchBranches();
    closeDeleteModal();
  } catch (error) {
    toast.error('Failed to delete branch');
  } finally {
    deleting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchBranches();
});
</script>

<style scoped>
.btn-pagination {
  @apply relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50;
}

.loading-spinner {
  @apply animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-600;
}
</style>
