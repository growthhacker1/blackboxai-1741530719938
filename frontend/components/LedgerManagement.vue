<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Ledger Management</h1>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center"
      >
        <i class="fas fa-plus mr-2"></i>
        Create New Ledger
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search ledgers..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Account Group</label>
          <select
            v-model="selectedGroup"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Groups</option>
            <option v-for="group in accountGroups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
          <select
            v-model="selectedType"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Types</option>
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="ledger in filteredLedgers" :key="ledger.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ ledger.code }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ ledger.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ ledger.group_name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span
                :class="{
                  'px-2 py-1 rounded-full text-xs font-semibold': true,
                  'bg-green-100 text-green-800': ledger.account_type === 'asset',
                  'bg-red-100 text-red-800': ledger.account_type === 'liability',
                  'bg-blue-100 text-blue-800': ledger.account_type === 'equity',
                  'bg-yellow-100 text-yellow-800': ledger.account_type === 'income',
                  'bg-purple-100 text-purple-800': ledger.account_type === 'expense'
                }"
              >
                {{ ledger.account_type }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span :class="{ 'text-red-600': ledger.current_balance < 0 }">
                {{ formatCurrency(ledger.current_balance) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <button
                @click="viewStatement(ledger)"
                class="text-blue-600 hover:text-blue-900"
                title="View Statement"
              >
                <i class="fas fa-file-alt"></i>
              </button>
              <button
                @click="editLedger(ledger)"
                class="text-green-600 hover:text-green-900"
                title="Edit"
              >
                <i class="fas fa-edit"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4">
        <div class="p-6">
          <h2 class="text-xl font-bold mb-6">
            {{ isEditing ? 'Edit Ledger Account' : 'Create New Ledger Account' }}
          </h2>
          <form @submit.prevent="saveLedger" class="space-y-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  v-model="ledgerForm.name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  v-model="ledgerForm.code"
                  type="text"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Account Group</label>
                <select
                  v-model="ledgerForm.groupId"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="group in accountGroups" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                <input
                  v-model.number="ledgerForm.openingBalance"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Contact Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  v-model="ledgerForm.address"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  v-model="ledgerForm.contactPerson"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  v-model="ledgerForm.phone"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  v-model="ledgerForm.email"
                  type="email"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Additional Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  v-model="ledgerForm.panNumber"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Credit Limit</label>
                <input
                  v-model.number="ledgerForm.creditLimit"
                  type="number"
                  step="0.01"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ isEditing ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Statement Modal -->
    <div v-if="showStatementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg w-full max-w-4xl mx-4">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Ledger Statement</h2>
            <button @click="closeStatementModal" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <nepali-date-picker
                  v-model="statementDates.startDate"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <nepali-date-picker
                  v-model="statementDates.endDate"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              @click="fetchStatement"
              class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Generate Statement
            </button>
          </div>

          <div v-if="statement" class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Opening Balance</div>
                <div class="text-lg font-semibold">{{ formatCurrency(statement.summary.openingBalance) }}</div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Total Credits</div>
                <div class="text-lg font-semibold text-green-600">
                  {{ formatCurrency(statement.summary.totalCredits) }}
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Total Debits</div>
                <div class="text-lg font-semibold text-red-600">
                  {{ formatCurrency(statement.summary.totalDebits) }}
                </div>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="text-sm text-gray-500">Closing Balance</div>
                <div class="text-lg font-semibold">{{ formatCurrency(statement.summary.closingBalance) }}</div>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="transaction in statement.transactions" :key="transaction.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ transaction.transaction_date_np }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-900">
                      {{ transaction.description }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {{ transaction.type === 'debit' ? formatCurrency(transaction.amount) : '' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {{ transaction.type === 'credit' ? formatCurrency(transaction.amount) : '' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                      {{ formatCurrency(transaction.running_balance) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import NepaliDatePicker from './NepaliDatePicker.vue';
import axios from 'axios';

export default {
  name: 'LedgerManagement',
  components: {
    NepaliDatePicker
  },

  setup() {
    // State
    const ledgers = ref([]);
    const accountGroups = ref([]);
    const searchQuery = ref('');
    const selectedGroup = ref('');
    const selectedType = ref('');
    const showModal = ref(false);
    const showStatementModal = ref(false);
    const isEditing = ref(false);
    const statement = ref(null);

    const ledgerForm = ref({
      name: '',
      code: '',
      groupId: '',
      openingBalance: 0,
      address: '',
      contactPerson: '',
      phone: '',
      email: '',
      panNumber: '',
      creditLimit: 0
    });

    const statementDates = ref({
      startDate: '',
      endDate: ''
    });

    // Computed
    const filteredLedgers = computed(() => {
      return ledgers.value.filter(ledger => {
        const matchesSearch = ledger.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            ledger.code.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesGroup = !selectedGroup.value || ledger.group_id === selectedGroup.value;
        const matchesType = !selectedType.value || ledger.account_type === selectedType.value;
        return matchesSearch && matchesGroup && matchesType;
      });
    });

    // Methods
    const fetchLedgers = async () => {
      try {
        const response = await axios.get('/api/ledger/accounts');
        ledgers.value = response.data.data;
      } catch (error) {
        console.error('Error fetching ledgers:', error);
      }
    };

    const fetchAccountGroups = async () => {
      try {
        const response = await axios.get('/api/master/account-groups');
        accountGroups.value = response.data.data;
      } catch (error) {
        console.error('Error fetching account groups:', error);
      }
    };

    const openCreateModal = () => {
      isEditing.value = false;
      ledgerForm.value = {
        name: '',
        code: '',
        groupId: '',
        openingBalance: 0,
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        panNumber: '',
        creditLimit: 0
      };
      showModal.value = true;
    };

    const editLedger = (ledger) => {
      isEditing.value = true;
      ledgerForm.value = {
        id: ledger.id,
        name: ledger.name,
        code: ledger.code,
        groupId: ledger.group_id,
        openingBalance: ledger.opening_balance,
        address: ledger.address,
        contactPerson: ledger.contact_person,
        phone: ledger.phone,
        email: ledger.email,
        panNumber: ledger.pan_number,
        creditLimit: ledger.credit_limit
      };
      showModal.value = true;
    };

    const saveLedger = async () => {
      try {
        if (isEditing.value) {
          await axios.put(`/api/ledger/accounts/${ledgerForm.value.id}`, ledgerForm.value);
        } else {
          await axios.post('/api/ledger/accounts', ledgerForm.value);
        }
        await fetchLedgers();
        closeModal();
      } catch (error) {
        console.error('Error saving ledger:', error);
      }
    };

    const closeModal = () => {
      showModal.value = false;
      ledgerForm.value = {
        name: '',
        code: '',
        groupId: '',
        openingBalance: 0,
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        panNumber: '',
        creditLimit: 0
      };
    };

    const viewStatement = (ledger) => {
      ledgerForm.value.id = ledger.id;
      showStatementModal.value = true;
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      statementDates.value = {
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      };
    };

    const fetchStatement = async () => {
      try {
        const response = await axios.get(`/api/ledger/accounts/${ledgerForm.value.id}/statement`, {
          params: statementDates.value
        });
        statement.value = response.data.data;
      } catch (error) {
        console.error('Error fetching statement:', error);
      }
    };

    const closeStatementModal = () => {
      showStatementModal.value = false;
      statement.value = null;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-NP', {
        style: 'currency',
        currency: 'NPR'
      }).format(amount);
    };

    // Lifecycle hooks
    onMounted(() => {
      fetchLedgers();
      fetchAccountGroups();
    });

    return {
      ledgers,
      accountGroups,
      searchQuery,
      selectedGroup,
      selectedType,
      showModal,
      showStatementModal,
      isEditing,
      ledgerForm,
      statementDates,
      statement,
      filteredLedgers,
      openCreateModal,
      editLedger,
      saveLedger,
      closeModal,
      viewStatement,
      fetchStatement,
      closeStatementModal,
      formatCurrency
    };
  }
};
</script>
