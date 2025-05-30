<template>
  <q-menu>
    <q-list bordered>
      <q-item>
        <q-item-section>
          <q-item-label overline>{{ darkMode ? 'Dark Mode' : 'Light Mode' }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-toggle
            checked-icon="fas fa-moon"
            color="primary"
            data-cy="dark-mode-toggle"
            :model-value="darkMode"
            unchecked-icon="fas fa-sun"
            @update:model-value="toggleDarkMode()"
          />
        </q-item-section>
      </q-item>
      <q-separator />
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

import { defineComponent, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore.js'
const authStore = useAuthStore()
import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()

export default defineComponent({
  name: 'ProfileMenu',
  setup () {
    const router = useRouter()
    const $q = useQuasar()
    const darkMode = ref($q.dark.mode)

    function toggleDarkMode () {
      $q.dark.toggle()
      darkMode.value = $q.dark.mode
      configStore.darkMode = $q.dark.mode
    }

    onMounted(() => {
      if (configStore) {
        $q.dark.set(configStore.darkMode)
        darkMode.value = $q.dark.mode
      }
    })
    async function signOut () {
      await authStore.signOut()
      router.push('/')
    }

    return {
      darkMode,
      toggleDarkMode,
      signOut
    }
  }
})
</script>
<style lang="scss" scoped></style>
