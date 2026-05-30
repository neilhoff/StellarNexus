<template>
  <span
    class="sn-icon"
    :style="iconStyle"
    v-html="iconSvg"
  />
</template>

<script>
import { computed, defineComponent } from 'vue'

const iconModules = import.meta.glob('../assets/icons/*.svg', { query: '?raw', import: 'default', eager: true })

export default defineComponent({
  name: 'SnIcon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: [Number, String],
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    }
  },
  setup (props) {
    const iconSvg = computed(() => {
      const path = `../assets/icons/${props.name}.svg`
      return iconModules[path] || ''
    })

    const iconStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      color: props.color
    }))

    return { iconSvg, iconStyle }
  }
})
</script>

<style scoped>
.sn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.sn-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.sn-icon :deep(svg path) {
  fill: none;
  stroke: currentColor;
}
</style>
