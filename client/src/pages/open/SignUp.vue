<template>
  <q-page class="flex flex-center">
    <q-card
      bordered
      class="sign-up-card"
      flat
    >
      <q-card-section class="q-pb-none">
        <q-item class="sign-up-title">Sign Up</q-item>
      </q-card-section>
      <q-card-section>
        <q-form
          @submit="signUp"
          class="q-gutter-xs"
        >
          <q-input
            :label="userInput.label"
            :key="userInput.label"
            lazy-rules
            outlined
            :type="userInput.type"
            v-model="userInput.model"
            v-for="userInput of userInputs"
            :rules="[userInput.rules]"
          />

          <div>
            <q-btn label="Submit" type="submit" color="primary"/>
          </div>
        </q-form>
      </q-card-section>

    </q-card>
  </q-page>
</template>
<script>
import { defineComponent, ref } from 'vue'
import { standardAuth } from 'src/services/auth/AuthService'

// import { useStore } from 'vuex'

export default defineComponent({
  name: 'SignUp',
  setup () {
    // const store = useStore()
    const userInputs = ref([
      {
        key: 'email',
        label: 'Email',
        type: 'text',
        model: '',
        rules: (val) => (val && val.length > 0) || 'You must include an email to sign up.'
      },
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        model: '',
        rules: ''
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        model: '',
        rules: ''
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        model: '',
        rules: (val) => (val && val.length > 0) || 'Password is required.'
      },
      {
        key: 'verifyPassword',
        label: 'Verify Password',
        type: 'password',
        model: '',
        rules: (val) => {
          const pw = userInputs.value.find(item => item.label === 'Password').model
          return (val && val.length > 0 && val === pw) || 'Passwords must match.'
        }
      }
    ])

    async function signUp () {
      console.log('signup')
      console.log(userInputs.value)
      const params = {}
      for (const item of userInputs.value) {
        params[item.key] = item.model
      }
      const result = await standardAuth.postSignUp(params)
      console.log(result)
    }

    return {
      signUp,
      userInputs
    }
  }
})
</script>
<style lang="scss">
.sign-up-card {
  min-width: 350px;
}
.sign-up-title {
  font-size: 1.6rem;
}
</style>
