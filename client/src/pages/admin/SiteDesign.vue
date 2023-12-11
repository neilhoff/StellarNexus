<template>
  <q-page>
    <div>
      <page-header title="Site Design" />
      <h3>Color Scheme</h3>
      <div class="row">
        <div class="col col-md col-sm-6 col-xs-12 bg-primary">Primary</div>
        <div class="col col-md col-sm-6 col-xs-12 bg-primary-white text-primary">Primary White</div>
        <div class="col col-md col-sm-6 col-xs-12 bg-secondary">Secondary</div>
        <div class="col col-md col-sm-6 col-xs-12 bg-secondary2">Secondary 2</div>
        <div class="col col-md col-sm-6 col-xs-12 bg-accent">Accent</div>

      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import PageHeader from 'components/PageHeader'

export default defineComponent({
  name: 'SiteDesign',
  components: {
    PageHeader
  },
  setup () {
    const store = useStore()

    return {
      store,
      userInfo: computed(() => store.state.auth.userInfo)
    }
  }
})
</script>
<style lang="scss" scoped>
.col {
  color: white;
  height: 200px;
  font-size: 1.5rem;
  text-align: center;
}
</style>
