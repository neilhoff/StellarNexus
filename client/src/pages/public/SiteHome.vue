<template>
  <q-page class="q-mb-lg">
    <section class="hero-section">
      <div class="stars-container" ref="starsContainer">
        <SnIcon
          v-for="n in 40"
          :key="n"
          name="sparkle"
          class="star"
          :class="`star-${n % 3}`"
          :style="{
            top: `${starPositions[n].top}%`,
            left: `${starPositions[n].left}%`,
            animationDelay: `${starPositions[n].delay}s`,
            width: `${starPositions[n].size}px`,
            height: `${starPositions[n].size}px`
          }"
        />
      </div>
      <div class="hero-text-box">
        <h1 class="hero-title">
          SERVERLESS &amp; FRONT-END<br>
          VUEJS DEVELOPMENT SIMPLIFIED!
        </h1>

        <h2 class="hero-subtitle">Start building your new web app in minutes!</h2>
        <q-btn
          class="call-to-action-btn"
          color="accent"
          href="https://github.com/neilhoff/StellarNexus"
          icon="fab fa-github"
          label="Fork it Now!"
          size="lg"
          unelevated
        />
      </div>
      <img
        ref="heroPlanet"
        class="hero-planet"
        src="~/assets/logos/StellarNexusClipped.svg"
      >
    </section>

    <section class="tech-section">
      <div class="tech-grid">
        <q-card class="tech-card sn-card">
          <q-card-section>
            <h2 class="text-center tech-card-title">Front-end</h2>
            <div class="built-with-item">
              <a
                href="https://quasar.dev"
                target="_blank"
              >
                <img
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
        <q-card class="tech-card sn-card">
          <q-card-section>
            <h2 class="text-center tech-card-title">Serverless</h2>
            <div class="built-with-item">
              <a
                href="https://arc.codes"
                target="_blank"
              >
                <img
                  class="architect-logo"
                  src="~/assets/home-page/Architect-logo-black.svg"
                >
              </a>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <section class="features-section">
      <div class="features-content">
        <div class="features-heading">Why use Stellar Nexus for your next project?</div>
        <p>
          Quasar JS is a fantastic front-end framework built on top of VueJS. There are tons of built in
          components to make designing your next web app a breeze.
        </p>
        <p>
          Easily add and maintain serverless functions with the Architect Framework.
        </p>
        <p>
          AWS Cognito is a robust standards based Authentication platform that is fully integrated into Stellar Nexus.
        </p>

        <h3 class="features-subheading">Stellar Nexus combines all of these wonderful frameworks into one.</h3>
        <ul class="features-list">
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
            unelevated
          />
        </div>
      </div>
    </section>
  </q-page>
</template>

<script>
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import SnIcon from 'src/components/SnIcon.vue'

export default defineComponent({
  name: 'SiteHome',
  components: {
    SnIcon
  },
  setup () {
    const siteName = process.env.APP_DISPLAY_NAME
    const $q = useQuasar()
    const user = ref(null)
    const router = useRouter()
    const heroPlanet = ref(null)
    const starsContainer = ref(null)

    function generateStarPositions () {
      const positions = {}
      const sizes = [8, 12, 16]
      for (let i = 1; i <= 40; i++) {
        positions[i] = {
          top: Math.random() * 100,
          left: Math.random() * 100,
          delay: Math.random() * 3,
          size: sizes[i % 3]
        }
      }
      return positions
    }

    const starPositions = generateStarPositions()

    function gotoSignup () {
      router.push('/auth/signup')
    }

    function handleScroll () {
      if (!heroPlanet.value) return
      const scrollY = window.scrollY
      const heroHeight = heroPlanet.value.closest('.hero-section')?.offsetHeight || window.innerHeight
      const progress = Math.min(scrollY / heroHeight, 1)
      const scale = 1 + progress * 0.4
      heroPlanet.value.style.transform = `scale(${scale})`

      if (starsContainer.value) {
        const stars = starsContainer.value.querySelectorAll('.star')
        stars.forEach((star, index) => {
          const speed = 0.5 + (index % 5) * 0.15
          const opacity = 1 - progress * 0.6
          star.style.transform = `translateY(${progress * speed * -40}px)`
          star.style.opacity = Math.max(opacity, 0.4)
        })
      }
    }

    onMounted(async () => {
      window.addEventListener('scroll', handleScroll, { passive: true })
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })
    return {
      siteName,
      horizontal: computed(() => {
        return $q.screen.gt.sm
      }),
      gotoSignup,
      user,
      heroPlanet,
      starsContainer,
      starPositions
    }
  }
})
</script>
<style lang="scss" scoped>
.hero-section {
  background-color: $primary;
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  padding: 120px 80px 80px;
}

.stars-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  color: #FFFFFF !important;
  animation: twinkle 3s ease-in-out infinite;
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}

.star :deep(svg),
.star :deep(path) {
  stroke: #FFFFFF !important;
}

.star-0 {
  opacity: 0.3;
}

.star-1 {
  opacity: 0.6;
}

.star-2 {
  opacity: 1;
  filter: drop-shadow(0 0 3px rgba(255, 255, 234, 0.4));
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.hero-text-box {
  position: relative;
  z-index: 2;
  max-width: 950px;
  margin-right: 10%;
}

.hero-title {
  color: $primary-white;
  font-family: 'Anton';
  font-size: 5.5rem;
  line-height: 5rem;
  margin: 0;
}

.hero-subtitle {
  color: $primary-white;
  font-family: 'Poppins Medium';
  font-size: 1.5rem;
  line-height: 2rem;
  margin-top: 24px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.hero-planet {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 55%;
  max-width: 800px;
  height: auto;
  z-index: 1;
  opacity: 0.9;
  transform-origin: bottom right;
  transition: transform 0.1s ease-out;
}

.call-to-action-btn {
  font-weight: 600;
  padding: 14px 32px;
  border-radius: 8px;
}

@media (max-width: 1024px) {
  .hero-section {
    padding: 48px;
    min-height: 80vh;
  }

  .hero-text-box {
    margin-right: 5%;
  }

  .hero-title {
    font-size: 4rem;
    line-height: 3.5rem;
  }

  .hero-planet {
    width: 50%;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 32px 24px;
    min-height: 70vh;
    align-items: flex-start;
    justify-content: center;
  }

  .hero-text-box {
    margin-left: 0;
    margin-right: 0;
    text-align: center;
    max-width: 100%;
  }

  .hero-title {
    font-size: 3rem;
    line-height: 2.8rem;
  }

  .hero-planet {
    width: 60%;
    opacity: 0.5;
  }
}

.tech-section {
  padding: 32px 24px;
  background-color: $background;
}

.tech-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.tech-card {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
}

.tech-card-title {
  color: $primary;
  font-family: 'Anton';
  font-size: 1.5rem;
  margin-bottom: 16px;
}

body.body--dark .tech-card-title {
  color: $primary;
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

.cognito-text {
  font-size: 1.5rem;
  color: $primary;
  font-weight: 600;
}

body.body--dark .cognito-text {
  color: $primary;
}

.features-section {
  padding: 32px 24px;
  display: flex;
  justify-content: center;
}

.features-content {
  max-width: 800px;
  width: 100%;
}

.features-heading {
  font-family: 'Anton';
  font-size: 2.5rem;
  margin-bottom: 24px;
  color: $text-primary;
}

body.body--dark .features-heading {
  color: $dark-text-primary;
}

.features-subheading {
  font-family: 'Anton';
  font-size: 1.25rem;
  margin-top: 24px;
  margin-bottom: 16px;
  color: $text-primary;
}

body.body--dark .features-subheading {
  color: $dark-text-primary;
}

.features-list {
  margin-bottom: 32px;

  li {
    margin-bottom: 8px;
    color: $text-secondary;
  }
}

body.body--dark .features-list li {
  color: $dark-text-secondary;
}

.sign-up-text {
  font-family: "Poppins Medium";
  font-size: 1.5rem;
  color: $text-primary;
  margin-bottom: 16px;
}

body.body--dark .sign-up-text {
  color: $dark-text-primary;
}

@media (max-width: 768px) {
  .tech-grid {
    flex-direction: column;
    align-items: center;
  }

  .tech-card {
    max-width: 100%;
  }
}
</style>
