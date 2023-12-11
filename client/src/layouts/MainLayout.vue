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
            v-if="leftDrawerState !== 'mini' && showSiteTitle"
          >
            {{ siteTitle }}
          </div>
          <div
            class="q-ma-none"
            style="font-size: .8rem;"
            v-if="leftDrawerState !== 'mini'"
          > {{ isProduction() ? '' : env }}</div>
        </div>
        <q-separator />
        <q-list>
          <EssentialLink
            v-for="link in defaultLinks"
            :key="link.title"
            v-bind="link"
          />

          <q-item-label
            header
            v-if="isAdmin()"
          >
            Admin
          </q-item-label>

          <EssentialLink
            v-for="link in adminLinks"
            :key="link.title"
            v-bind="link"
            :display="isAdmin()"
          />
        </q-list>
        <div
          class="absolute-bottom"
          data-cy="profile-photo-menu"
        >
          <q-separator class="q-mb-md" />
          <avatar-with-menu v-if="userInfo" />
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view class="q-py-xs q-px-md" />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import AvatarWithMenu from 'src/layouts/components/AvatarWithMenu.vue'
import { essentialLinks } from '../services/essentialLinks'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'MainLayout',
  components: {
    EssentialLink,
    AvatarWithMenu
  },
  setup () {
    const store = useStore()
    const env = process.env.ENV
    const siteTitle = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()

    return {
      defaultLinks: essentialLinks.default,
      adminLinks: essentialLinks.admin,
      env,
      isProduction: () => process.env.ENV === 'production',
      isAdmin: () => store.state.auth.adminAccess,
      leftDrawerState: computed(() => store.state.config.leftDrawerState),
      siteTitle,
      showSiteTitle: true,
      drawerLogo: computed(() => $q.dark.mode ? process.env.DRAWER_LOGO_DARK_MODE : process.env.DRAWER_LOGO),
      store,
      userInfo: computed(() => store.state.auth.userInfo),
      drawerClass: computed(() => $q.dark.mode ? 'drawer-dark-mode' : 'drawer-light-mode')
    }
  }
})
</script>

<style lang="scss">
.drawer-light-mode {
  background-color: #fafafa;

  .drawer-site-title {
    color: $primary;
  }
}

.drawer-dark-mode {
  background-color: #1d1d1d;

  .drawer-site-title {
    color: $primary-white;
  }
}

.drawer-site-title {
  font-family: 'Impact'
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
