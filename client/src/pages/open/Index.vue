<template>
  <q-page class="q-mb-lg">
    <div class="bg-primary top-banner">
      <div class="align-center justify-center q-pt-xl row text-primary-white">
        <div class="col-12 col-md-7">
          <h1>FULLSTACK FRAMEWORK BUILT
            <br /> WITH QUASAR VUEJS
            <a
              href="https://quasar.dev"
              target="_blank"
            ><img
                class="quasar-logo"
                src="~/assets/QUASAR_icon_dark_background_RGB.svg"
              >
            </a>
            <br /> AND THE
            <a
              href="https://arc.codes"
              target="_blank"
            ><img
                class="architect-logo q-pt-md"
                src="~/assets/Architect-logo-white.svg"
              ></a>
            <br /> SERVERLESS FRAMEWORK
          </h1>
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
          class="col-6"
          src="~/assets/StellarNexusClipped.svg"
        >
      </div>

    </div>
    <div class="row justify-start q-mt-xl">
      <q-card
        bordered
        class="align-items-center col-12 col-lg-6"
        flat
      >
        <q-card-section
          class="bg-secondary text-white"
          :horizontal="horizontal"
        >
          <q-card-section>
            <h2>
              Build beautiful front-ends using all your favorite Quasar components and some enhanced by Stellar Nexus.
            </h2>
          </q-card-section>

          <q-img
            alt=""
            class="col-7"
            src="~/assets/front-end-design.png"
          />
        </q-card-section>

      </q-card>
    </div>
    <div class="row justify-end q-mt-xl">
      <q-card
        bordered
        class="align-items-center col-12 col-lg-6"
        flat
      >
        <q-card-section
          class="bg-accent text-white"
          :horizontal="horizontal"
        >
          <q-card-section>
            <h2>Do the heavy lifting with AWS Lambda Serverless applications using the Architect Framework.</h2>
          </q-card-section>

          <q-img
            alt=""
            class="col-7"
            src="~/assets/serverless-code.png"
          />
        </q-card-section>

      </q-card>
    </div>
    <div class="row justify-start q-mt-xl">
      <q-card
        bordered
        class="align-items-center col-12 col-lg-6"
        flat
      >
        <q-card-section
          class="bg-primary text-white"
          :horizontal="horizontal"
        >
          <q-card-section>
            <h2>Built-in support to secure it all with the enterprise grade user store from Microsoft: Entra Id.</h2>
          </q-card-section>

          <q-img
            alt=""
            class="col-7"
            src="~/assets/Entra_ID_Diagram_new.avif"
          />
        </q-card-section>

      </q-card>
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

.call-to-action-btn {
  font-family: 'Poppins Medium';
  font-weight: bold;
}

.quasar-logo {
  height: 50px;
}

.architect-logo {
  height: 75px;
}

.stellar-nexus-logo {
  max-width: 300px;
}
</style>
