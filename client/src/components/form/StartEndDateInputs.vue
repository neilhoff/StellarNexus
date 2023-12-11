<template>
  <div>
    <q-input
      outlined
      dense
      label="Start"
      v-model="dateParams.dateStart"
      ref="dateStartRef"
      name="date_start"
      :disable="disable"
      :rules="[val => validateDate('dateStart', val)]"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
        >
          <q-popup-proxy
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="dateParams.dateStart"
              :mask="dateMask"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input
      outlined
      dense
      label="End"
      v-model="dateParams.dateEnd"
      ref="dateEndRef"
      name="date_end"
      :disable="disable"
      :rules="[val => validateDate('dateEnd', val)]"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
        >
          <q-popup-proxy
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="dateParams.dateEnd"
              :mask="dateMask"
            >
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </div>

</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import { date } from 'quasar'

export default defineComponent({
  name: 'StartEndDateInputs',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    maxDateRange: {
      type: Number,
      default: 120
    },
    dateMask: {
      type: String,
      default: 'MM/DD/YYYY'
    },
    validationOn: {
      type: Boolean,
      default: true
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    // Setup the 2-way binding for the dateParams Object
    const dateParams = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const dateStartRef = ref(null)
    const dateEndRef = ref(null)

    function resetValidation (refName) {
      if (refName === 'dateStart') {
        dateStartRef.value.resetValidation()
      } else if (refName === 'dateEnd') {
        dateEndRef.value.resetValidation()
      }
    }

    function setValidDates () {
      resetValidation('dateStart')
      resetValidation('dateEnd')
    }

    function validateDate (version, val) {
      if (props.validationOn) {
        // Note: lazy-rules needs to be set on the input or this will cause issues
        const dateFormat = 'MM/DD/YYYY'

        const dateStart = new Date(props.modelValue.dateStart)
        const dateEnd = new Date(props.modelValue.dateEnd)
        // If dates are in the future we calculate dateDiff based on today's date
        const today = new Date()
        const todayDateDiff = date.getDateDiff(today, dateStart, 'days')
        const dateFromToday = date.formatDate(date.subtractFromDate(today, { days: props.maxDateRange }), dateFormat)
        const diff = date.getDateDiff(dateEnd, dateStart, 'days')

        // First clear the validations for better ux
        setValidDates()

        // Validate
        if (!val) {
          return 'Date is Required'
        } else if (dateEnd > today && todayDateDiff > props.maxDateRange) {
          return `The start date must be ${dateFromToday} or later because the end date is in the future`
        } else if (diff < 0) {
          return 'End date must be later then the Start date'
        } else if (version === 'dateStart' && diff > props.maxDateRange && dateEnd <= today) {
          return `The start date must be ${date.formatDate(date.subtractFromDate(dateEnd, { days: props.maxDateRange }), dateFormat)} or later. The max date range is ${props.maxDateRange} days`
        } else if (version === 'dateEnd' && diff > props.maxDateRange && dateEnd <= today) {
          return `The end date must be ${date.formatDate(date.addToDate(dateStart, { days: props.maxDateRange }), dateFormat)} or earlier. The max date range is ${props.maxDateRange} days`
        } else {
          setValidDates()
        }
      } else { // Validation is turned off
        setValidDates()
      }
    }
    return {
      dateParams,
      validateDate,
      dateStartRef,
      dateEndRef
    }
  }
})
</script>
