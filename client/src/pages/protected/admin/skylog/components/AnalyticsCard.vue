<template>
  <q-card flat class="q-pa-md col-12 col-md-6">
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <slot></slot>

    </transition>
    <q-inner-loading :showing="props.loading">
      <q-spinner
        color="primary"
        size="3em"
        :thickness="10"
      />
    </q-inner-loading>
  </q-card>
</template>
<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AnalyticsCard',
  props: {
    loading: {
      type: Boolean
    }
  },
  setup (props) {
    return {
      props
    }
  }
})
</script>
