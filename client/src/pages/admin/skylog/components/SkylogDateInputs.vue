<template>
  <div>
    <q-input
      outlined
      dense
      label="Start"
      v-model="dateParams.start"
      ref="dateStart"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
        >
          <q-popup-proxy
            :ref="el => qDateStart = el"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="dateParams.start"
              :mask="dateMask"
              @update:model-value="closePopup(qDateStart)"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>

    <q-input
      outlined
      dense
      label="End"
      v-model="dateParams.end"
      ref="dateEnd"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer"
        >
          <q-popup-proxy
            :ref="el => qDateEnd = el"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              v-model="dateParams.end"
              :mask="dateMask"
              @update:model-value="closePopup(qDateEnd)"
            />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-btn
      @click="updateDates"
      color="primary"
      label="Submit"
      rounded
      unelevated
    />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'SkylogDateInputs',
  props: {
    dates: {
      type: Object,
      default () {
        return {
          start: '',
          end: ''
        }
      }
    }
  },
  setup (props, context) {
    const dateParams = ref(props.dates)
    const dateMask = 'MM/DD/YYYY'
    const qDateStart = ref(null)
    const qDateEnd = ref(null)

    function updateDates () {
      context.emit('updateDates', dateParams.value)
    }

    function closePopup (el) {
      el.hide()
    }

    return {
      dateParams,
      dateMask,
      qDateStart,
      qDateEnd,
      updateDates,
      closePopup
    }
  }
})
</script>
