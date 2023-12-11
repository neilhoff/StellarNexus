<template>
  <q-item>
    <q-item-section
      top
      avatar
    >
      <q-avatar
        class="profile-pic"
        data-cy="profile-pic"
      >
        <q-img
          :src="store.state.auth.userPhoto"
          v-if="store.state.auth.userPhoto"
        >
          <profile-menu />
        </q-img>
        <i
          class="fas fa-user text-primary"
          style="font-size: 1.5rem;"
          v-else
        >
          <profile-menu />
        </i>
      </q-avatar>
    </q-item-section>
    <q-item-section>
      <div class="row">
        <div
          class="profile-details self-center"
          data-cy="profile-details"
        >
          <div class="display-name q-mb-none">
            {{ store.state.auth.userInfo.displayName }}
          </div>

          <div
            class="company text-grey-7"
            v-if="store.state.auth.userInfo.officeLocation"
          >
            {{ store.state.auth.userInfo.officeLocation }} - {{ store.state.auth.userInfo.companyName }}
          </div>
        </div>
        <div>
          <q-toggle
            checked-icon="fas fa-moon"
            color="primary"
            data-cy="dark-mode-toggle"
            :model-value="darkMode"
            unchecked-icon="fas fa-sun"
            @update:model-value="toggleDarkMode()"
          />
          <q-icon
            class="menu-ellipsis q-pa-xs"
            name="fas fa-ellipsis-h"
          >
            <profile-menu />
          </q-icon>
        </div>
        <div>

        </div>
      </div>
    </q-item-section>

  </q-item>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import ProfileMenu from './ProfileMenu'

export default defineComponent({
  name: 'AvatarWithMenu',
  components: {
    ProfileMenu
  },
  setup () {
    const store = useStore()
    async function signOut () {
      await store.dispatch('auth/logout')
    }

    const $q = useQuasar()
    const darkMode = ref($q.dark.mode)

    function toggleDarkMode () {
      $q.dark.toggle()
      darkMode.value = $q.dark.mode
      store.commit('config/setDarkMode', $q.dark.mode)
    }

    onMounted(() => {
      if (store.state.config) {
        $q.dark.set(store.state.config.darkMode)
        darkMode.value = $q.dark.mode
      }
    })

    return {
      store,
      signOut,
      darkMode,
      toggleDarkMode
    }
  }
})
</script>
<style lang="scss" scoped>
.profile-pic {
  cursor: pointer;
}

.profile-details {
  line-height: .8rem;
  width: 130px;
}

.display-name {
  font-weight: bold;

}

.company {
  font-size: .8rem;
}

.menu-ellipsis {
  cursor: pointer;
}
</style>
