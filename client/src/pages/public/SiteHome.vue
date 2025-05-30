<template>
  <q-page class="q-mb-lg">
    <section class="bg-primary row">
      <div class="col-12 col-md-7 q-pa-xl">
        <div class="sn-banner-heading text-primary-white">
          <h1 class="q-mb-sm">
            SERVERLESS & FRONT-END
            VUEJS DEVELOPMENT
            SIMPLIFIED!
          </h1>
          <h2 class="q-mb-md">Start building your new web app in minutes!</h2>

          <q-btn
            class="call-to-action-btn"
            color="accent"
            href="https://github.com/neilhoff/StellarNexus"
            icon="fab fa-github"
            label="Fork it Now!"
            size="lg"
            textColor="white"
            unelevated
          />
        </div>
      </div>
      <img
        class="col-12 col-md-5 self-end"
        src="~/assets/logos/StellarNexusClipped.svg"
      >
    </section>
    <section class="bg-secondary sn-section">
      <div class="row justify-content-center">
        <q-card
          flat
          class="q-ma-md"
        >
          <q-card-section>
            <h2 class="text-center text-primary">Front-end</h2>
            <div class="built-with-item">
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
          </q-card-section>
        </q-card>
        <q-card
          flat
          class="q-ma-md"
        >
          <q-card-section>
            <h2 class="text-center text-primary">Serverless</h2>
            <div class="built-with-item">
              <a
                href="https://arc.codes"
                target="_blank"
              ><img
                  class="architect-logo"
                  src="~/assets/home-page/Architect-logo-black.svg"
                >
              </a>
            </div>
          </q-card-section>
        </q-card>
        <q-card
          flat
          class="q-ma-md"
        >
          <q-card-section>
            <h2 class="text-center text-primary">Authentication</h2>
            <div class="built-with-item">
              <a
                href="https://aws.amazon.com/cognito"
                target="_blank"
              ><img
                  class="cognito-logo"
                  src="~/assets/home-page/cognito.webp"
                >
                <div class="q-ml-md text-h3">AWS Cognito</div>
              </a>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </section>
    <section class="sn-section bg-secondary">
      <div class="">


      </div>
    </section>
    <section class="sn-section">
      <div class="sn-section-content">
        <div class="sn-section-heading">Why use Stellar Nexus for your next project?</div>
        <p>
          Quasar JS is a fantastic front-end framework built on top of VueJS. There are tons of built in
          components
          to make designing your next web app a breeze.
        </p>
        <p>
          Easily add and maintain serverless functions with the Architect Framework.
        </p>
        <p>
          AWS Cognito is a robust standards based Authentication platform that is fully integrated into Stellar
          Nexus.
        </p>

        <h3> Stellar Nexus combines all of these wonderful frameworks into one.</h3>
        <ul>
          <li>Build your backend with ease and only pay for what you use with AWS Lambdas. Architect makes this a
            breeze!</li>
          <li>Fantastic builtin front-end components supplied by Quasar JS. Supply your colors, fonts and logo and you
            are ready to go!</li>
          <li>User Authentication using AWS Cognito is built in with easy setup instructions to get you up and running
            fast.</li>
          <li>Beautiful protected section secured through AWS Cognito</li>
          <li>User analytics</li>
          <li>Robust error logging</li>
          <li>Simple build tools to get your Staging and Production environment running in AWS in no time!</li>
          <li>Cheap hosting through AWS.</li>
          <li>Free and open source!</li>
          <li>And much more....</li>

        </ul>

        <div v-if="user">
          {{ user }}
          <q-btn
            color="primary"
            label="Sign Out"
            @click="signOut"
          />
        </div>
        <div v-else>
          <div class="sign-up-text">Sign up now to test out the protected pages</div>
          <q-btn
            class="q-mt-sm"
            @click="gotoSignup"
            color="accent"
            label="Sign up"
            textColor="white"
            unelevated
          />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script>
import { computed, defineComponent, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
// import { signOutRedirect, userManager } from 'src/services/auth/cognitoService'
// import Auth from 'src/services/auth/cognitoService'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'SiteHome',
  components: {

  },
  setup () {
    const siteName = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()
    const user = ref(null)
    const router = useRouter()

    function gotoSignup () {
      router.push('/auth/signup')
    }

    onMounted(async () => {
      // await userInfo()
      // user.value = await Auth.currentAuthenticatedUser()
      // console.log('USER', user.value)
    })
    return {
      siteName,
      horizontal: computed(() => {
        return $q.screen.gt.sm
      }),
      gotoSignup,
      user
    }
  }
})
</script>
<style lang="scss" scoped>
.top-banner {
  min-width: 350px;
}

h1,
.text-h1 {
  color: $primary-white;
  line-height: 4.6rem;
  font-family: 'Anton';
  font-size: 5rem;
}

h2 {
  font-family: 'Anton';
  font-size: 2rem;
  line-height: 1.9rem;
}

.home-page-section {
  max-width: 1080px;
}

.built-with-item {
  margin-top: 20px;

  a {
    display: flex;
    align-items: center;
  }
}

.quasar-logo,
.architect-logo,
.cognito-logo {
  height: 50px;
}

.quasar-logo-type {
  height: 20px;
}

.sign-up-text {
  font-family: "Poppins Medium";
  font-size: 2rem;
}

// .call-to-action-btn {
//   font-family: 'Poppins Medium';
//   font-weight: bold;
// }

// .stellar-nexus-logo {
//   max-width: 300px;
// }</style>
