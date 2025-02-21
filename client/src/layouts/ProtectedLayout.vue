<template>
  <q-layout view="lHh Lpr lFf">

    <q-drawer
      behavior="desktop"
      :class="drawerClass"
      :mini="leftDrawerState === 'mini'"
      :model-value="leftDrawerState !== 'hidden'"
      show-if-above
    >
      <q-scroll-area class="fit">
        <div class="column flex flex-center q-py-md q-gutter-sm">
          <img
            :class="leftDrawerState === 'mini' ? 'title-img-mini' : 'title-img-max'"
            :src="drawerLogo"
          >
          <div
            class="q-ml-none text-h5 drawer-site-title"
            data-cy="drawer-site-title"
            v-if="leftDrawerState !== 'mini'"
          >
            {{ siteTitle }}
          </div>
          <div
            class="q-ma-none"
            style="font-size: .8rem;"
            v-if="leftDrawerState !== 'mini'"
          > {{ isProduction() ? '' : env }}</div>
        </div>

        <q-separator class="q-mb-md" />
        <q-list :dense="leftDrawerState !== 'mini'">
          <div
            :key="linkGroup.title"
            v-for="(linkGroup, index) in authorizedLinkGroups"
          >
            <q-item-label
              header
              v-if="linkGroup.title"
            >
              {{ linkGroup.title }}
            </q-item-label>
            <EssentialLink
              :display="link.authorized"
              :key="link.title"
              v-bind="link"
              v-for="link in linkGroup.links"
            />
            <q-separator
              class="q-mt-sm"
              v-if="index !== authorizedLinkGroups.length - 1"
            />
          </div>
        </q-list>
        <div
          class="absolute-bottom"
          data-cy="profile-photo-menu"
        >
          <q-separator class="q-mb-md" />
          <!-- <avatar-with-menu v-if="userInfo" /> -->
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view class="q-py-xs q-px-md" />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from './components/EssentialLink.vue'
// import AvatarWithMenu from 'src/layouts/components/AvatarWithMenu.vue'
import { essentialLinks } from 'src/services/protected/essentialLinks.js'
import { useQuasar } from 'quasar'

import { computed, defineComponent } from 'vue'

import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()

export default defineComponent({
  name: 'ProtectedLayout',
  components: {
    EssentialLink
    // AvatarWithMenu
  },
  setup () {
    const env = process.env.ENV
    const siteTitle = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()

    return {
      authorizedLinkGroups: computed(() => essentialLinks.filter(lg => lg.authorized)),
      env,
      isProduction: () => process.env.ENV === 'production',
      leftDrawerState: computed(() => configStore.leftDrawerState),
      siteTitle,
      drawerLogo: computed(() => $q.dark.mode ? process.env.DRAWER_LOGO_DARK_MODE : process.env.DRAWER_LOGO),
      drawerClass: computed(() => $q.dark.mode ? 'drawer-dark-mode' : 'drawer-light-mode')
    }
  }
})
</script>

<style lang="scss">
.drawer-light-mode {
  background-color: $off-white;
}

.drawer-dark-mode {
  background-color: #1d1d1d;
}

.title-img-max {
  height: 100px;
}

.title-img-mini {
  width: 50px;
}

.profile-pic {
  cursor: pointer;
}
</style>
