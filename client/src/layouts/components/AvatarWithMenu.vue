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
          data-stellar-track="Left drawer profile image"
          :src="authStore.userPhoto"
          v-if="authStore.userPhoto"
        >
          <profile-menu />
        </q-img>
        <i
          class="fas fa-user text-primary"
          data-stellar-track="Left drawer profile image"
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
            {{ authStore.email.split('@')[0] }}
          </div>
        </div>
        <div>

          <q-icon
            class="menu-ellipsis q-pa-xs"
            data-stellar-track="Left drawer profile ellipsis"
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
import { defineComponent } from 'vue'

import ProfileMenu from './ProfileMenu.vue'
import { useAuthStore } from 'src/stores/authStore.js'
const authStore = useAuthStore()


export default defineComponent({
  name: 'AvatarWithMenu',
  components: {
    ProfileMenu
  },
  setup () {
    async function signOut () {
      await authStore.signOut()
    }

    return {
      signOut,
      authStore
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
