<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Place Management</h1>
      <button
        v-if="authStore.hasPermission('create_places')"
        @click="openCreateModal"
        class="btn btn-primary"
      >
        <i class="fas fa-plus mr-2"></i>
        Add Place
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
            placeholder="Search places..."
            class="form-input"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Province
          </label>
          <select v-model="filters.province" class="form-input">
            <option value="">All Provinces</option>
            <option v-for="province in provinces" :key="province" :value="province">
              {{ province }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <select v-model="filters.type" class="form-input">
            <option value="">All Types</option>
            <option value="city">City</option>
            <option value="town">Town</option>
            <option value="village">Village</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Places Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Province/District
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Distance (km)
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-4">
                <div class="flex justify-center">
                  <div class="loading-spinner"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="filteredPlaces.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No places found
              </td>
            </tr>
            <tr
              v-for="place in paginatedPlaces"
              :key="place.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ place.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900 dark:text-white">{{ place.province }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ place.district }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    {
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': place.type === 'city',
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': place.type === 'town',
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': place.type === 'village'
                    }
                  ]"
                >
                  {{ place.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ place.distance }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  v-if="authStore.hasPermission('edit_places')"
                  @click="editPlace(place)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="authStore.hasPermission('delete_places')"
                  @click="confirmDelete(place)"
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
      :title="isEditing ? 'Edit Place' : 'Create Place'"
      @close="closeModal"
    >
      <form @submit.prevent="savePlace" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Place Name -->
          <div>
            <label class="form-label" for="name">Place Name</label>
            <input
              id="name"
              v-model="placeForm.name"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="form-error">{{ errors.name }}</p>
          </div>

          <!-- Province -->
          <div>
            <label class="form-label" for="province">Province</label>
            <select
              id="province"
              v-model="placeForm.province"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.province }"
            >
              <option value="">Select Province</option>
              <option v-for="province in provinces" :key="province" :value="province">
                {{ province }}
              </option>
            </select>
            <p v-if="errors.province" class="form-error">{{ errors.province }}</p>
          </div>

          <!-- District -->
          <div>
            <label class="form-label" for="district">District</label>
            <input
              id="district"
              v-model="placeForm.district"
              type="text"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.district }"
            />
            <p v-if="errors.district" class="form-error">{{ errors.district }}</p>
          </div>

          <!-- Type -->
          <div>
            <label class="form-label" for="type">Type</label>
            <select
              id="type"
              v-model="placeForm.type"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.type }"
            >
              <option value="">Select Type</option>
              <option value="city">City</option>
              <option value="town">Town</option>
              <option value="village">Village</option>
            </select>
            <p v-if="errors.type" class="form-error">{{ errors.type }}</p>
          </div>

          <!-- Distance -->
          <div>
            <label class="form-label" for="distance">Distance (km)</label>
            <input
              id="distance"
              v-model.number="placeForm.distance"
              type="number"
              min="0"
              step="0.1"
              required
              class="form-input"
              :class="{ 'border-red-500': errors.distance }"
            />
            <p v-if="errors.distance" class="form-error">{{ errors.distance }}</p>
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
          Are you sure you want to delete the place "{{ placeToDelete?.name }}"?
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
            @click="deletePlace"
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

// State
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const places = ref([]);
const placeToDelete = ref(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const provinces = [
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
  province: '',
  type: ''
});

const placeForm = reactive({
  name: '',
  province: '',
  district: '',
  type: '',
  distance: 0
});

const errors = reactive({
  name: '',
  province: '',
  district: '',
  type: '',
  distance: ''
});

// Computed
const filteredPlaces = computed(() => {
  let filtered = [...places.value];

  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(place =>
      place.name.toLowerCase().includes(search) ||
      place.district.toLowerCase().includes(search)
    );
  }

  if (filters.province) {
    filtered = filtered.filter(place => place.province === filters.province);
  }

  if (filters.type) {
    filtered = filtered.filter(place => place.type === filters.type);
  }

  return filtered;
});

const totalItems = computed(() => filteredPlaces.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

const paginatedPlaces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredPlaces.value.slice(start, end);
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
const fetchPlaces = async () => {
  try {
    loading.value = true;
    const response = await axios.get('/api/master/places');
    places.value = response.data.data;
  } catch (error) {
    toast.error('Failed to fetch places');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  Object.keys(placeForm).forEach(key => {
    placeForm[key] = key === 'distance' ? 0 : '';
  });
  Object.keys(errors).forEach(key => {
    errors[key] = '';
  });
  showModal.value = true;
};

const editPlace = (place) => {
  isEditing.value = true;
  Object.keys(placeForm).forEach(key => {
    placeForm[key] = place[key];
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

  if (!placeForm.name) {
    errors.name = 'Place name is required';
    isValid = false;
  }

  if (!placeForm.province) {
    errors.province = 'Province is required';
    isValid = false;
  }

  if (!placeForm.district) {
    errors.district = 'District is required';
    isValid = false;
  }

  if (!placeForm.type) {
    errors.type = 'Type is required';
    isValid = false;
  }

  if (placeForm.distance < 0) {
    errors.distance = 'Distance must be a positive number';
    isValid = false;
  }

  return isValid;
};

const savePlace = async () => {
  if (!validateForm()) return;

  try {
    saving.value = true;
    if (isEditing.value) {
      await axios.put(`/api/master/places/${placeForm.id}`, placeForm);
      toast.success('Place updated successfully');
    } else {
      await axios.post('/api/master/places', placeForm);
      toast.success('Place created successfully');
    }
    await fetchPlaces();
    closeModal();
  } catch (error) {
    if (error.response?.data?.errors) {
      Object.keys(error.response.data.errors).forEach(key => {
        errors[key] = error.response.data.errors[key][0];
      });
    } else {
      toast.error(isEditing.value ? 'Failed to update place' : 'Failed to create place');
    }
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (place) => {
  placeToDelete.value = place;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  placeToDelete.value = null;
};

const deletePlace = async () => {
  try {
    deleting.value = true;
    await axios.delete(`/api/master/places/${placeToDelete.value.id}`);
    toast.success('Place deleted successfully');
    await fetchPlaces();
    closeDeleteModal();
  } catch (error) {
    toast.error('Failed to delete place');
  } finally {
    deleting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchPlaces();
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
