<template>
  <q-page>
    <div>
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
    </div>
  </q-page>
</template>

<script>
import { computed, defineComponent } from 'vue'
import EssentialCard from './components/EssentialCard.vue'
import { essentialLinks } from 'src/services/protected/essentialLinks.js'
import PageHeader from 'src/components/PageHeader.vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    PageHeader,
    EssentialCard
  },
  setup () {
    const siteName = process.env.APP_DISPLAY_NAME

    return {
      authorizedLinkGroups: computed(() => essentialLinks.filter(lg => lg.authorized)),
      siteName
    }
  }
})
</script>
