<template>
  <div>
    <div class="analytics-list-title q-mb-sm">{{props.title}}</div>
    <q-list
        bordered
        separator
    >
      <q-item>
        <q-item-section data-cy="list-header-type">{{props.columnTitle}}</q-item-section>
        <q-item-section>Views</q-item-section>
      </q-item>
      <q-item
        v-for="item in viewsBy" :key="item"
        data-cy="list-item"
      >
        <q-item-section data-cy="list-item-desc">{{item.x}}</q-item-section>
        <q-item-section data-cy="list-item-value">{{item.y}}</q-item-section>
      </q-item>
    </q-list>
  </div>

</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'ViewsByList',
  components: {
  },
  props: {
    analytics: {
      type: Array
    },
    columnTitle: {
      type: String
    },
    title: {
      type: String
    },
    viewsByFunc: {
      type: Function
    }
  },
  setup (props) {
    const viewsBy = ref([])
    watch(() => props.analytics, (analytics, prevAnalytics) => {
      viewsBy.value = props.viewsByFunc(analytics)
    })
    return {
      viewsBy,
      props
    }
  }
})
</script>
<style lang="scss" scoped>
  .analytics-list-title {
    font-size: 16px;
  }
</style>
