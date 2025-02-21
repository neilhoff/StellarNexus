<template>
  <q-header class="q-mb-lg">
    <q-toolbar :class="titleBarClass">
      <q-btn
        aria-label="Menu"
        :class="titleTextClass"
        class="self-center"
        @click="toggleLeftDrawer"
        data-cy="toggle-left-drawer-btn"
        dense
        flat
        icon="menu"
        round
      />
      <q-toolbar-title data-cy="page-title">
        <h1
          class="q-mb-sm"
          :class="titleTextClass"
        >{{ title }}
          <span
            style="font-size: 1rem;"
            v-if="env !== 'production'"
          >{{ env }}</span>
        </h1>
      </q-toolbar-title>
    </q-toolbar>
  </q-header>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useConfigStore } from 'src/stores/configStore.js'
const configStore = useConfigStore()

export default defineComponent({
  name: 'PageHeader',
  props: {
    title: {
      type: String
    },
    showNewSearch: {
      type: Boolean
    }
  },
  setup () {
    const env = process.env.ENV
    const siteTitle = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()
    function isProduction () {
      return process.env.ENV === 'production'
    }

    return {
      env,
      isProduction,
      siteTitle,
      titleTextClass: computed(() => $q.dark.mode ? 'font-dark-mode' : 'font-primary'),
      titleBarClass: computed(() => $q.dark.mode ? 'title-dark-mode' : 'title-light-mode'),

      toggleLeftDrawer () {
        const options = configStore.leftDrawerOptions
        const currentState = configStore.leftDrawerState
        const index = options.indexOf(currentState)
        if (index !== -1) {
          const nextIndex = (index + 1) % options.length
          configStore.leftDrawerState = options[nextIndex]
        } else {
          configStore.leftDrawerState = options[0]
        }
      }
    }
  }
})
</script>
<style lang="scss">
.title-light-mode {
  background-color: #ffffff;
}

.title-dark-mode {
  background-color: #121212;
  color: #ffffff;
}
</style>
