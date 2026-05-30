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
        <div class="drawer-header column flex flex-center q-py-md q-gutter-sm">
          <img
            :class="leftDrawerState === 'mini' ? 'title-img-mini' : 'title-img-max'"
            :src="drawerLogo"
          >
          <div
            class="q-ml-none drawer-site-title"
            data-cy="drawer-site-title"
            v-if="leftDrawerState !== 'mini'"
          >
            {{ siteTitle }}
          </div>
          <div
            class="env-indicator"
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
          <avatar-with-menu v-if="authStore.email" />
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
import AvatarWithMenu from 'src/layouts/components/AvatarWithMenu.vue'
import { getAuthorizedLinkGroups } from 'src/services/protected/essentialLinks.js'
import { hasAdminAccess } from 'src/services/auth/cognitoService'
import { useQuasar } from 'quasar'

import { computed, defineComponent, onMounted, ref } from 'vue'

import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()
import { useAuthStore } from 'src/stores/authStore'

export default defineComponent({
  name: 'ProtectedLayout',
  components: {
    EssentialLink,
    AvatarWithMenu
  },
  setup () {
    const env = process.env.ENV
    const siteTitle = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()
    const authStore = useAuthStore()
    const isAdmin = ref(false)

    onMounted(async () => {
      try {
        isAdmin.value = await hasAdminAccess()
      } catch {
        isAdmin.value = false
      }
    })

    return {
      authorizedLinkGroups: computed(() => getAuthorizedLinkGroups(isAdmin.value)),
      env,
      isProduction: () => process.env.ENV === 'production',
      leftDrawerState: computed(() => configStore.leftDrawerState),
      siteTitle,
      drawerLogo: computed(() => $q.dark.mode ? process.env.DRAWER_LOGO_DARK_MODE : process.env.DRAWER_LOGO),
      drawerClass: computed(() => $q.dark.mode ? 'drawer-dark-mode' : 'drawer-light-mode'),
      authStore
    }
  }
})
</script>

<style lang="scss">
.drawer-light-mode {
  background-color: $card-bg;
  border-right: 1px solid $sn-border;
}

.drawer-dark-mode {
  background-color: $dark-surface;
  border-right: 1px solid $dark-border;
}

.drawer-header {
  padding-top: 16px;
  padding-bottom: 16px;
}

.title-img-max {
  height: 80px;
}

.title-img-mini {
  width: 50px;
}

.drawer-site-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: $text-primary;
}

body.body--dark .drawer-site-title {
  color: $dark-text-primary;
}

.env-indicator {
  font-size: 0.75rem;
  color: $text-muted;
}

body.body--dark .env-indicator {
  color: $dark-text-muted;
}

.profile-pic {
  cursor: pointer;
}
</style>
