<template>
  <q-layout view="lHh Lpr lff">

    <q-page-container>
      <q-header class="public-header">
        <q-toolbar>
          <img
            class="stellar-nexus-logo"
            src="~/assets/logos/StellarNexusLogo2.svg"
          >
          <q-toolbar-title class="public-toolbar-title">
            Stellar Nexus
          </q-toolbar-title>

          <q-btn
            dense
            flat
            href="https://github.com/neilhoff/StellarNexus"
            icon="fab fa-github"
            round
          />
          <!-- <BitcoinSignIn /> -->
        </q-toolbar>
      </q-header>

      <router-view />

      <q-footer class="public-footer">
        <q-toolbar>
          <q-btn
            flat
            href="https://github.com/neilhoff/StellarNexus"
            icon="fab fa-github"
            label="Fork the project on Github"
            size="md"
          />
        </q-toolbar>
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<script>

import { defineComponent } from 'vue'
// import BitcoinSignIn from 'pages/open/web3/BitcoinSignIn'

export default defineComponent({
  name: 'PublicLayout',
  components: {
    // BitcoinSignIn
  },
  setup () {
    return {

    }
  }
})
</script>

<style lang="scss">
.public-header {
  background-color: $primary;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.public-toolbar-title {
  color: $primary-white;
  font-weight: 600;
}

.public-footer {
  background-color: $primary;
}

.stellar-nexus-logo {
  height: 40px;
  margin-bottom: 5px;
  margin-top: 5px;
}
</style>
