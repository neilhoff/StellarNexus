<template>
  <q-card
    class="row items-center justify-center text-white"
    :class="bgColorClass"
    flat
    :style="`height:${size.height}; width:${size.width}; border-radius:${borderRadius};`"
  >
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        class="text-center"
        :class="'data-card-' + title.trim().toLowerCase()"
      >
        <div class="data-title">{{ title }}</div>
        <div class="data-value">{{ value }}</div>
      </div>

    </transition>
    <q-inner-loading :showing="loading">
      <q-spinner
        class="data-card-loader"
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
  name: 'DataCard',
  components: {
  },
  props: {
    title: {
      type: String
    },
    value: {
      type: String,
      default: 'xx'
    },
    size: {
      type: Object,
      default () {
        return {
          height: '60px',
          width: '180px'
        }
      }
    },
    bgColorClass: {
      type: String,
      default: 'bg-primary'
    },
    borderRadius: {
      type: String,
      default: '5px'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  setup (props) {

  }
})
</script>
<style lang="scss" scoped>
.data-title {
  font-size: 1rem;
  font-weight: 500;
}

.data-value {
  font-size: .9rem;
}
</style>
