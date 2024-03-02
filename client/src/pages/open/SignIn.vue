<template>
  <q-page class="flex flex-center">
    <q-card
      bordered
      flat
    >
      <q-card-section
        align="center"
        class="q-mb-none q-pb-none"
        horizontal
      >
        <q-card-section>
          <q-item>
            <img
              alt="Sign-in Logo"
              class="sign-in-logo"
              src="~assets/sign-in-logo.png"
            >
          </q-item>
        </q-card-section>
        <q-card-section>
          <q-item class="sign-in-title">Sign in</q-item>
          <q-separator />
          <q-card-actions
            align="center"
            class="q-mt-md"
            vertical
          >
            <q-btn
              @click="signIn"
              flat
              no-caps
            >
              <img
                class="q-pr-md q-pt-sm q-pb-sm"
                style="width: 50px;"
                src="~assets/Microsoft_icon.svg"
              />
              Continue with Microsoft
            </q-btn>

          </q-card-actions>
        </q-card-section>

      </q-card-section>

    </q-card>
  </q-page>
</template>
<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'SignIn',
  setup () {
    const store = useStore()
    async function signIn () {
      await store.dispatch('auth/login')
    }

    return {
      signIn
    }
  }
})
</script>
<style lang="scss">
.sign-in-logo {
  max-height: 150px;
}

.sign-in-title {
  font-size: 1.6rem;
}
</style>
