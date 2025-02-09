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
          <q-item class="self-center">
            <img
              alt="Sign-in Logo"
              class="sign-in-logo"
              src="~assets/sign-in-logo.png"
            >
          </q-item>
        </q-card-section>
        <q-card-section>
          <q-item class="sign-in-title">Sign in</q-item>
          <q-item>
            <q-form
              @submit="signIn"
              class="q-gutter-xs"
              style="width:100%;"
            >
              <q-input
                dense
                label="Username or email"
                lazy-rules
                outlined
                type="text"
                v-model="user.username"
              />
              <q-input
                dense
                label="Password"
                lazy-rules
                outlined
                type="password"
                v-model="user.password"
              />
              <div>
                <q-btn class="q-mt-sm" label="Submit" type="submit" color="primary"/>
              </div>
            </q-form>
          </q-item>
          <q-item class="items-center">
            <div class="text-h3 text-center" style="width: 100%; line-height: 1rem;">
              or
            </div>
          </q-item>
          <q-item>
            <bitcoin-sign-in navigateToAfterSignIn="SiteHome"/>
          </q-item>
          <!-- <q-card-actions
            align="center"
            class="q-mt-md"
            vertical
          >

          </q-card-actions> -->
        </q-card-section>

      </q-card-section>
    </q-card>
    <br />
    <q-btn color="primary" icon="check" label="Auth Check" @click="authCheck()" />
  </q-page>
</template>
<script>
import { defineComponent, ref } from 'vue'
// import { useStore } from 'vuex'
import BitcoinSignIn from './web3/BitcoinSignIn.vue'
import { standardAuth } from 'src/services/auth/AuthService'

export default defineComponent({
  name: 'SignIn',
  components: {
    BitcoinSignIn
  },
  setup () {
    // const store = useStore()
    const user = ref({
      username: '',
      password: ''
    })
    async function signIn () {
      // await store.dispatch('auth/login')
      console.log(user.value)
      const response = await standardAuth.signIn(user.value)
      console.log(response)
    }
    async function authCheck () {
      const response = await standardAuth.authCheck()
      console.log(response)
    }
    return {
      authCheck,
      signIn,
      user
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
