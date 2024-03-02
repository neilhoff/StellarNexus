<template>
  <q-layout view="lHh Lpr lFf">

    <q-page-container>
      <q-header>
        <q-toolbar class="bg-primary text-primary-white">
          <img
            class="stellar-nexus-logo"
            src="~/assets/StellarNexusLogo2.svg"
          >
          <q-toolbar-title>
            Stellar Nexus
          </q-toolbar-title>

          <q-btn
            dense
            flat
            href="https://github.com/neilhoff/StellarNexus"
            icon="fab fa-github"
            round
          />
        </q-toolbar>
      </q-header>
      <router-view />

      <q-toolbar class="bg-primary q-py-md text-primary-white">
        <q-btn
          flat
          href="https://github.com/neilhoff/StellarNexus"
          icon="fab fa-github"
          label="Fork the project on Github"
          size="md"
          textColor="white"
        />
      </q-toolbar>
    </q-page-container>
  </q-layout>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'OpenLayout',
  components: {
  },
  setup () {
    return {

    }
  }
})
</script>

<style lang="scss">
.stellar-nexus-logo {
  height: 50px;

  margin-bottom: 5px;
  margin-top: 5px;
}
</style>
