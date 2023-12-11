<template>
  <q-page class="flex flex-center">
    <div>
      <div class="row q-mb-lg">
        <img
          src="~assets/sign-in-logo.png"
          alt="Sign-in Logo"
        >
      </div>
      <div class="row q-mb-sm">
        <div class="col text-center text-subtitle1">Please Sign in to Continue</div>
      </div>
      <div class="row">
        <q-btn
          class="q-pa-sm col self-center q-mx-xl"
          color="white"
          @click="signIn"
        >
          <img
            style="max-width: 125px;"
            src="~assets/microsoft.png"
          />
        </q-btn>
      </div>
    </div>

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
