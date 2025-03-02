<template>
  <q-page class="q-mb-lg">
    <div class="bg-primary top-banner">
      <div class="align-center justify-center q-pt-xl row text-primary-white">
        <div class="col-12 col-md-7">
          <h1 class="q-mb-sm">
            SERVERLESS & FRONT-END
            <br /> VUEJS DEVELOPMENT
            <br /> SIMPLIFIED!
          </h1>
          <h2 class="q-mb-md">Start building your new web app in minutes!</h2>

          <q-btn
            class="call-to-action-btn"
            color="white"
            href="https://github.com/neilhoff/StellarNexus"
            icon="fab fa-github"
            label="Try it Now!"
            size="lg"
            textColor="primary"
            unelevated
          />
        </div>

      </div>
      <div class="row justify-end">
        <img
          class="col-7"
          src="~/assets/logos/StellarNexusClipped.svg"
        >
      </div>
    </div>
    <h2 class="text-center">Built With</h2>
    <div class="row justify-center q-pa-lg">
      <div class="coll-auto">
        <div class="built-with-item q-ml-sm">
          <a
            href="https://quasar.dev"
            target="_blank"
          ><img
              class="quasar-logo q-mr-sm"
              src="~/assets/home-page/QUASAR_icon_light_background_RGB.svg"
            >
            <img
              class="quasar-logo-type"
              src="~/assets/home-page/QUASAR - logotype.svg"
            >
          </a>
        </div>
        <br />
        <div class="built-with-item">
          <a
            href="https://arc.codes"
            target="_blank"
          ><img
              class="architect-logo q-pt-md"
              src="~/assets/home-page/Architect-logo-black.svg"
            >
          </a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'SiteHome',
  components: {

  },
  setup () {
    const siteName = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()
    return {
      siteName,
      horizontal: computed(() => {
        return $q.screen.gt.sm
      })
    }
  }
})
</script>
<style lang="scss" scoped>
.top-banner {
  min-width: 350px;

}

h1 {
  color: $primary-white;
  line-height: 4.6rem;
  font-family: 'Anton';
  font-size: 5rem;
}

h2 {
  font-family: 'Poppins Medium';
  font-size: 2rem;
  line-height: 1.9rem;
}

.built-with-item {
  a {
    display: flex;
    align-items: center;
  }
}

.call-to-action-btn {
  font-family: 'Poppins Medium';
  font-weight: bold;
}

.quasar-logo {
  height: 50px;
}

.quasar-logo-type {
  height: 20px;
}

.architect-logo {
  height: 75px;
}

.stellar-nexus-logo {
  max-width: 300px;
}
</style>
