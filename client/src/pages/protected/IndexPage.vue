<template>
  <q-page>
    <page-header :title="siteName" />
    <div
      :key="linkGroup.title"
      v-for="linkGroup in authorizedLinkGroups"
    >
      <div v-if="linkGroup.title">
        <div class="row q-mb-sm">
          <h2 class="col q-mt-none">
            {{ linkGroup.title }}
          </h2>
        </div>
        <div class="row q-mb-md">
          <EssentialCard
            :bgColor="linkGroup.bgColor"
            :display="link.authorized"
            :key="link.title"
            v-bind="link"
            v-for="link in linkGroup.links"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue'
import EssentialCard from './components/EssentialCard.vue'
import { getAuthorizedLinkGroups } from 'src/services/protected/essentialLinks.js'
import { hasAdminAccess } from 'src/services/auth/cognitoService'
import PageHeader from 'src/components/PageHeader.vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    PageHeader,
    EssentialCard
  },
  setup () {
    const siteName = process.env.APP_DISPLAY_NAME
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
      siteName
    }
  }
})
</script>
