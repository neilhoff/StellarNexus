<template>
  <q-header
    class="q-mb-lg page-header"
    :class="titleBarClass"
    bordered
  >
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
          class="q-mb-sm page-title"
          :class="titleTextClass"
        >{{ title }}
          <span
            class="env-badge"
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
.page-header {
  height: 64px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.title-light-mode {
  background-color: $card-bg;
  border-bottom: 1px solid $sn-border;
}

.title-dark-mode {
  background-color: $dark-surface;
  border-bottom: 1px solid $dark-border;
}

.page-title {
  font-size: 1.25rem;
  line-height: 1.5rem;
  margin-bottom: 0;
  font-weight: 600;
}

.env-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: $surface;
  color: $text-muted;
  margin-left: 8px;
  font-weight: 500;
}

body.body--dark .env-badge {
  background-color: $dark-elevated;
  color: $dark-text-muted;
}
</style>
