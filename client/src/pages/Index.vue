<template>
  <q-page :class="userInfo ? '' : 'flex flex-center'">
    <div v-if="userInfo">
      <page-header :title="siteName" />
      <div class="row q-mb-sm">
        <h2 class="col q-mt-none">
          Apps
        </h2>
      </div>
      <div class="row q-mb-md">
        <EssentialCard
          v-for="link in defaultLinks"
          :key="link.title"
          v-bind="link"
          :display="link.title !== 'Home'"
        />
      </div>

      <div
        class="row"
        v-if="store.state.auth.adminAccess"
      >
        <h2 class="col q-mt-none">
          Admin
        </h2>
      </div>
      <div class="row q-mb-md">
        <EssentialCard
          v-for="link in adminLinks"
          :key="link.title"
          v-bind="link"
          bgColor="accent"
          :display="store.state.auth.adminAccess"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import EssentialCard from 'components/EssentialCard'
import { essentialLinks } from '../services/essentialLinks'
import PageHeader from 'components/PageHeader'

export default defineComponent({
  name: 'PageIndex',
  components: {
    PageHeader,
    EssentialCard
  },
  setup () {
    const store = useStore()
    const siteName = process.env.APP_DISPLAY_NAME

    return {
      defaultLinks: essentialLinks.default,
      adminLinks: essentialLinks.admin,
      store,
      userInfo: computed(() => store.state.auth.userInfo),
      siteName
    }
  }
})
</script>
