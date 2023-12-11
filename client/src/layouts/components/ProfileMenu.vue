<template>
  <q-menu>
    <q-list bordered>
      <q-item
        @click="signOut"
        clickable
      >
        <div class="items-center row">
          <q-icon
            class="q-mr-sm"
            name="fas fa-sign-out-alt"
            size="xs"
          />
          <div>
            Sign Out
          </div>
        </div>

      </q-item>
    </q-list>
  </q-menu>
</template>
<script>

import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'ProfileMenu',
  setup () {
    const store = useStore()
    async function signOut () {
      await store.dispatch('auth/logout')
    }

    return {
      signOut
    }
  }
})
</script >
<style lang="scss" scoped></style>
