<template>
  <div v-if="showForm">
    <div
      class="q-mb-sm"
      v-if="showHideFormBtn"
    >
      <q-chip
        clickable
        @click="$emit('setShowForm', false)"
        color="primary"
        text-color="white"
      >
        Hide Search Form
      </q-chip>
    </div>
    <q-card
      bordered
      class="default-form"
      flat
    >
      <q-card-section>
        <q-form
          class="q-gutter-md"
          ref="defaultForm"
          @submit="onSubmit"
        >
          <div class="row q-gutter-md">
            <div class="col-6 col-sm">
              <div class="text-h5 q-mb-sm">{{ leftColumnTitle }}</div>
              <slot name="left"></slot>
            </div>
            <div
              class="col-6 col-sm"
              v-if="rightColumnTitle"
            >
              <div class="text-h5 q-mb-sm">{{ rightColumnTitle }}</div>
              <slot name="right"></slot>
            </div>
          </div>
          <div class="row justify-end">
            <q-btn
              class="default-form-submit-btn"
              color="primary"
              data-cy="default-form-submit"
              :disable="disableSubmit"
              label="Submit"
              rounded
              type="submit"
              unelevated
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>

  <div v-else>
    <span v-if="!showForm">
      <q-chip
        clickable
        @click="setShowForm"
        color="primary"
        text-color="white"
      >
        New Search
      </q-chip>
    </span>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'defaultForm',
  props: {
    disableSubmit: {
      type: Boolean,
      default: false
    },
    leftColumnTitle: {
      type: String,
      default: 'Details'
    },
    rightColumnTitle: {
      type: String,
      default: 'Date'
    },
    showForm: {
      type: Boolean,
      default: true
    }
  },
  emits: ['onSubmit', 'setShowForm'],
  setup (props, { emit }) {
    function onSubmit () {
      emit('onSubmit')
    }

    const showHideFormBtn = ref(false)
    function setShowForm () {
      showHideFormBtn.value = true
      emit('setShowForm', true)
    }
    return {
      onSubmit,
      setShowForm,
      showHideFormBtn
    }
  }
})
</script>
