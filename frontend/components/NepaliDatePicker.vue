<template>
  <div class="relative">
    <input
      type="text"
      :value="displayValue"
      readonly
      @click="toggleCalendar"
      class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
      :placeholder="placeholder"
    />
    
    <!-- Calendar Dropdown -->
    <div
      v-if="showCalendar"
      class="absolute z-50 mt-1 bg-white rounded-lg shadow-lg border p-4 w-72"
      @click.stop
    >
      <!-- Calendar Header -->
      <div class="flex justify-between items-center mb-4">
        <button
          @click="previousMonth"
          class="p-1 hover:bg-gray-100 rounded-full"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <div class="flex items-center space-x-2">
          <select
            v-model="currentMonth"
            class="px-2 py-1 border rounded"
            @change="updateCalendar"
          >
            <option v-for="(month, index) in nepaliMonths" :key="index" :value="index + 1">
              {{ month }}
            </option>
          </select>
          
          <select
            v-model="currentYear"
            class="px-2 py-1 border rounded"
            @change="updateCalendar"
          >
            <option v-for="year in yearRange" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        
        <button
          @click="nextMonth"
          class="p-1 hover:bg-gray-100 rounded-full"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-1">
        <!-- Weekday Headers -->
        <div
          v-for="day in nepaliWeekdays"
          :key="day"
          class="text-center text-sm font-medium text-gray-700 py-1"
        >
          {{ day }}
        </div>

        <!-- Calendar Days -->
        <div
          v-for="{ date, isCurrentMonth, isToday } in calendarDays"
          :key="date.toString()"
          class="text-center py-1"
        >
          <button
            @click="selectDate(date)"
            :class="{
              'w-8 h-8 rounded-full flex items-center justify-center': true,
              'hover:bg-blue-100': isCurrentMonth,
              'text-gray-400': !isCurrentMonth,
              'bg-blue-500 text-white hover:bg-blue-600': isSelected(date),
              'ring-2 ring-blue-200': isToday && !isSelected(date)
            }"
            :disabled="!isCurrentMonth"
          >
            {{ date.getDate() }}
          </button>
        </div>
      </div>

      <!-- Today Button -->
      <div class="mt-4 text-center">
        <button
          @click="goToToday"
          class="text-sm text-blue-600 hover:text-blue-800"
        >
          Today
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import DateConverter from '../utils/dateConverter';

export default {
  name: 'NepaliDatePicker',
  
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Select date'
    },
    minYear: {
      type: Number,
      default: 2070
    },
    maxYear: {
      type: Number,
      default: 2090
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    // State
    const showCalendar = ref(false);
    const currentDate = ref(new Date());
    const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null);
    const currentYear = ref(0);
    const currentMonth = ref(0);

    // Constants
    const nepaliMonths = [
      'Baisakh', 'Jestha', 'Ashadh', 'Shrawan',
      'Bhadra', 'Ashwin', 'Kartik', 'Mangsir',
      'Poush', 'Magh', 'Falgun', 'Chaitra'
    ];

    const nepaliWeekdays = ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'];

    // Computed
    const yearRange = computed(() => {
      const years = [];
      for (let year = props.minYear; year <= props.maxYear; year++) {
        years.push(year);
      }
      return years;
    });

    const displayValue = computed(() => {
      if (!selectedDate.value) return '';
      const bsDate = DateConverter.convertADToBS(selectedDate.value);
      return DateConverter.formatBSDate(bsDate);
    });

    const calendarDays = computed(() => {
      const days = [];
      const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1);
      const lastDay = new Date(currentYear.value, currentMonth.value, 0);
      
      // Add previous month's days
      const firstDayOfWeek = firstDay.getDay();
      const prevMonthLastDay = new Date(currentYear.value, currentMonth.value - 1, 0);
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(prevMonthLastDay.getFullYear(), prevMonthLastDay.getMonth(), prevMonthLastDay.getDate() - i),
          isCurrentMonth: false,
          isToday: false
        });
      }

      // Add current month's days
      for (let date = 1; date <= lastDay.getDate(); date++) {
        const currentDate = new Date(currentYear.value, currentMonth.value - 1, date);
        days.push({
          date: currentDate,
          isCurrentMonth: true,
          isToday: isToday(currentDate)
        });
      }

      // Add next month's days
      const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
      for (let date = 1; date <= remainingDays; date++) {
        days.push({
          date: new Date(currentYear.value, currentMonth.value, date),
          isCurrentMonth: false,
          isToday: false
        });
      }

      return days;
    });

    // Methods
    const toggleCalendar = () => {
      showCalendar.value = !showCalendar.value;
      if (showCalendar.value) {
        initializeCalendar();
      }
    };

    const initializeCalendar = () => {
      const date = selectedDate.value || new Date();
      const bsDate = DateConverter.convertADToBS(date);
      const [year, month] = bsDate.split('-').map(Number);
      currentYear.value = year;
      currentMonth.value = month;
    };

    const updateCalendar = () => {
      // Validate year and month ranges
      if (currentYear.value < props.minYear) currentYear.value = props.minYear;
      if (currentYear.value > props.maxYear) currentYear.value = props.maxYear;
      if (currentMonth.value < 1) {
        currentMonth.value = 12;
        currentYear.value--;
      }
      if (currentMonth.value > 12) {
        currentMonth.value = 1;
        currentYear.value++;
      }
    };

    const previousMonth = () => {
      currentMonth.value--;
      updateCalendar();
    };

    const nextMonth = () => {
      currentMonth.value++;
      updateCalendar();
    };

    const selectDate = (date) => {
      selectedDate.value = date;
      emit('update:modelValue', date.toISOString().split('T')[0]);
      showCalendar.value = false;
    };

    const isSelected = (date) => {
      if (!selectedDate.value) return false;
      return date.toDateString() === selectedDate.value.toDateString();
    };

    const isToday = (date) => {
      const today = new Date();
      return date.toDateString() === today.toDateString();
    };

    const goToToday = () => {
      const today = new Date();
      const bsDate = DateConverter.convertADToBS(today);
      const [year, month] = bsDate.split('-').map(Number);
      currentYear.value = year;
      currentMonth.value = month;
      selectDate(today);
    };

    // Click outside handler
    const handleClickOutside = (event) => {
      const element = event.target;
      if (!element.closest('.nepali-date-picker')) {
        showCalendar.value = false;
      }
    };

    // Lifecycle hooks
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      initializeCalendar();
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    // Watch for prop changes
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        selectedDate.value = new Date(newValue);
        initializeCalendar();
      }
    });

    return {
      showCalendar,
      currentYear,
      currentMonth,
      nepaliMonths,
      nepaliWeekdays,
      yearRange,
      calendarDays,
      displayValue,
      toggleCalendar,
      previousMonth,
      nextMonth,
      selectDate,
      isSelected,
      goToToday,
      updateCalendar
    };
  }
};
</script>

<style scoped>
.nepali-date-picker {
  position: relative;
  display: inline-block;
}
</style>
