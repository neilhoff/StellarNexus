<template>
  <transition
    appear
    enter-active-class="animated fadeIn"
  >
    <div
      class="q-mt-xl row justify-center default-spinner"
      v-if="showSpinner"
    >
      <div class="col-auto">
        <q-spinner
          :color="color"
          data-cy="default-spinner"
          :size="size"
          :thickness="thickness"
        />
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'DefaultSpinner',
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    size: {
      type: String,
      default: '6rem'
    },
    thickness: {
      type: Number,
      default: 4
    },
    showSpinner: {
      type: Boolean,
      default: true
    }
  }
}
</script>
<style lang="scss">
.default-spinner {
  --animate-duration: 2s;
}
</style>
