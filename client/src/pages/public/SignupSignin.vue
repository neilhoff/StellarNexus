<template>
  <q-page>
    <div class="absolute-center">
      <h1 class="signin-container text-center">{{ pageGreeting }}</h1>
      <!-- Sign in and Sign up card -->
      <q-card
        bordered
        class="signin-card"
        flat
      >
        <q-tabs
          v-model="tab"
          @update:model-value="updatePageGreeting"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab
            name="signin"
            label="Sign In"
          />
          <q-tab
            name="signup"
            label="Sign Up"
          />
        </q-tabs>
        <q-card-section>
          <q-tab-panels
            v-model="tab"
            animated
          >
            <q-tab-panel name="signin">
              <q-form
                class="q-gutter-md"
                @submit="handleSignIn"
              >
                <q-input
                  dense
                  label="Email"
                  outlined
                  type="email"
                  v-model="email"
                />
                <q-input
                  dense
                  label="Password"
                  outlined
                  type="password"
                  v-model="password"
                />
                <div>
                  <q-checkbox
                    left-label
                    v-model="staySignedIn"
                    label="Stay Signed In?"
                  />
                </div>
                <q-btn
                  type="submit"
                  label="Sign In"
                  color="primary"
                />
                <q-inner-loading :showing="showSpinner">
                  <q-spinner-gears
                    size="50px"
                    color="primary"
                  />
                </q-inner-loading>
              </q-form>
              <div
                class="forgot-password q-mt-md text-primary"
                @click="showForgotPasswordDialog"
              >
                Forgot Password?
              </div>
              <q-btn
                class="q-mt-md"
                @click="handleResendConfirmationCode"
                color="primary"
                label="Resend confirmation code"
                v-if="showResendConfirmationCodeButton"
              />
            </q-tab-panel>
            <q-tab-panel name="signup">
              <q-form
                class="q-gutter-md"
                @submit="handleSignUp"
              >
                <q-input
                  dense
                  label="First Name"
                  outlined
                  v-model="signUpAttributes.given_name"
                >
                  <template v-slot:append>
                    <q-icon
                      color="green-8"
                      name="fa-solid fa-check"
                      v-if="signUpAttributes.given_name"
                    />
                  </template>
                </q-input>
                <q-input
                  dense
                  label="Last Name"
                  outlined
                  v-model="signUpAttributes.family_name"
                >
                  <template v-slot:append>
                    <q-icon
                      color="green-8"
                      name="fa-solid fa-check"
                      v-if="signUpAttributes.family_name"
                    />
                  </template>
                </q-input>
                <q-input
                  dense
                  label="Email"
                  outlined
                  required
                  type="email"
                  v-model="signUpEmail"
                >
                  <template v-slot:append>
                    <q-icon
                      color="primary"
                      name="fa-solid fa-envelope-open"
                      v-if="!signUpEmail"
                    />
                    <q-icon
                      color="green-8"
                      name="fa-solid fa-check"
                      v-else
                    />
                  </template>
                </q-input>
                <q-input
                  dense
                  label="Phone Number"
                  outlined
                  type="tel"
                  v-model="signUpAttributes.phone_number"
                >
                  <template v-slot:append>
                    <q-icon
                      color="primary"
                      name="fa-solid fa-mobile-screen-button"
                      v-if="!signUpAttributes.phone_number"
                    />
                    <q-icon
                      color="green-8"
                      name="fa-solid fa-check"
                      v-else
                    />
                  </template>
                </q-input>
                <q-input
                  dense
                  label="Password"
                  outlined
                  required
                  type="password"
                  v-model="signUpPassword"
                >
                  <template v-slot:append>
                    <q-icon
                      color="primary"
                      name="fa-solid fa-unlock"
                      v-if="!signUpPassword"
                    />
                    <q-icon
                      color="green-8"
                      name="fa-solid fa-check"
                      v-else
                    />
                  </template>
                </q-input>
                <q-btn
                  type="submit"
                  label="Sign Up!"
                  color="primary"
                />
              </q-form>
              <q-inner-loading :showing="showSpinner">
                <q-spinner-gears
                  size="50px"
                  color="primary"
                />
              </q-inner-loading>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </div>
    <!-- New Signup Confirm Dialog  -->
    <q-dialog
      @before-hide="beforeSignupConfirmDialogHide"
      v-model="showSignupConfirmDialog"
    >
      <q-card
        bordered
        class="signup-confirm-card"
        flat
      >
        <q-card-section>
          <div class="q-mb-md text-subtitle2">A confirmation code has been sent to you</div>
          <q-input
            dense
            label="Confirmation Code"
            outlined
            v-model="signupConfirmationCode"
          />
          <q-btn
            class="q-mt-md"
            @click="handleSignUpConfirmationCode"
            type="submit"
            label="Confirm"
            color="primary"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Forgot Password Dialog -->
    <q-dialog
      @before-hide="beforeForgotPasswordDialogHide"
      v-model="forgotPasswordDialog"
    >
      <q-card
        bordered
        class="forgot-password-card"
        flat
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Request a New Password</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>
        <q-card-section v-if="!showCodeConfirm">
          <div class="text-subtitle1">A code will be sent to your email.</div>
          <q-form
            class="q-gutter-md q-mt-md"
            @submit="requestNewPassword"
          >
            <q-input
              dense
              label="Email"
              outlined
              type="email"
              v-model="newPasswordUsername"
            />
            <q-btn
              type="submit"
              label="Submit"
              color="primary"
            />
          </q-form>
        </q-card-section>
        <q-card-section v-else>

          <div class="q-mb-md text-subtitle2">A confirmation code has been sent to your email</div>
          <q-form
            class="q-gutter-md q-mt-md"
            @submit="saveNewPassword"
          >
            <q-input
              dense
              label="Confirmation Code"
              outlined
              v-model="newPasswordConfirmationCode"
            />
            <div class="q-my-md text-subtitle2">Create a new Password</div>
            <q-input
              dense
              label="Password"
              outlined
              type="password"
              v-model="newPassword"
            />
            <q-btn
              type="submit"
              label="Save"
              color="primary"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useRoute } from 'vue-router'

import { forgotPassword, confirmNewPassword, signUp, confirmSignUp, resendConfirmationCode } from 'src/services/auth/cognitoService.js'
import { useAuthStore } from 'src/stores/authStore'

export default {
  setup () {
    const $q = useQuasar()
    const route = useRoute()
    const showSpinner = ref(false)
    const tab = ref('signup')
    const error = ref({})
    const router = useRouter()
    const authStore = useAuthStore()
    const signUpGreeting = 'Join Now to Get Started!'
    const signInGreeting = 'Sign in to Continue'
    const pageGreeting = ref()

    function updatePageGreeting (val) {
      if (val === 'signin') {
        pageGreeting.value = signInGreeting
      } else if (val === 'signup') {
        pageGreeting.value = signUpGreeting
      }
    }

    async function cognitoServiceCallWrapper (cognitoFunc, successMessage, backupErrorMsg = 'Error') {
      try {
        showSpinner.value = true
        error.value = {}
        showResendConfirmationCodeButton.value = false
        await cognitoFunc()
        if (successMessage) {
          $q.notify({
            message: successMessage,
            color: 'positive'
          })
        }
      } catch (err) {
        console.log(JSON.stringify(err))
        error.value.message = err.message || backupErrorMsg
        error.value.code = err.code
        $q.notify({
          message: error.value.message,
          color: 'negative'
        })
      } finally {
        showSpinner.value = false
      }
    }

    // Sign In
    const email = ref('')
    const password = ref('')
    const staySignedIn = ref(false)
    const showResendConfirmationCodeButton = ref(false)
    async function handleSignIn () {
      await cognitoServiceCallWrapper(async () => {
        // const { accessToken, idToken } = await signIn(email.value, password.value)
        await authStore.signIn(email.value, password.value, staySignedIn.value)
        router.push('/protected') // Redirect to protected route
      }, null, 'Sign in failed')
      if (error.value.code === 'UserNotConfirmedException') {
        showResendConfirmationCodeButton.value = true
      }
      if (error.value.code === 'NotAuthorizedException') {
        password.value = ''
      }
    }
    async function handleResendConfirmationCode () {
      await cognitoServiceCallWrapper(async () => {
        const response = await resendConfirmationCode(email.value)
        console.log(response)
        showSignupConfirmDialog.value = true
        showResendConfirmationCodeButton.value = false
        signUpEmail.value = email.value
      }, 'Confirmation Code was sent', 'Error sending confirmation code')
    }

    // Sign Up
    function formatPhoneNumberToE164 (phoneNumber, countryCode) {
      // Remove all non-digit characters from the phone number
      const digitsOnly = phoneNumber.replace(/\D/g, '');

      // Check if the number starts with '0' and if so, remove it
      const numberWithoutLeadingZero = digitsOnly.startsWith('0') ? digitsOnly.substring(1) : digitsOnly;

      // Concatenate the country code and the formatted number
      const e164Number = `+${countryCode}${numberWithoutLeadingZero}`;

      return e164Number;
    }
    const signUpEmail = ref()
    const signUpPassword = ref()
    const signUpAttributes = reactive({
      phone_number: '',
      given_name: '',
      family_name: ''
    })
    const showSignupConfirmDialog = ref(false)
    async function handleSignUp () {
      cognitoServiceCallWrapper(async () => {
        const attr = { ...signUpAttributes }
        attr.phone_number = formatPhoneNumberToE164(attr.phone_number, 1)
        const response = await signUp(signUpEmail.value, signUpPassword.value, attr)
        console.log(response)
        showSignupConfirmDialog.value = true
      }, 'Signup was a success!', 'Signup failed')
    }
    const signupConfirmationCode = ref('')
    async function handleSignUpConfirmationCode () {
      cognitoServiceCallWrapper(async () => {
        const response = await confirmSignUp(signUpEmail.value, signupConfirmationCode.value)
        console.log(response)
      }, 'Signup confirmed!', 'Signup confirmation failed')
    }
    function beforeSignupConfirmDialogHide () {
      signupConfirmationCode.value = ''
    }

    // Forgot Password
    const forgotPasswordDialog = ref(false)
    function showForgotPasswordDialog () {
      forgotPasswordDialog.value = true
      error.value = {}
    }
    const newPasswordUsername = ref()
    const showCodeConfirm = ref(false)
    const newPasswordConfirmationCode = ref('')
    const newPassword = ref('')
    async function requestNewPassword () {
      cognitoServiceCallWrapper(async () => {
        console.log(newPasswordUsername.value)
        const { message, delivery } = await forgotPassword(newPasswordUsername.value)
        console.log(message, delivery)
        showCodeConfirm.value = true
      }, 'Confirmation code has been sent.', 'Request new password failed')

    }
    async function saveNewPassword () {
      cognitoServiceCallWrapper(async () => {
        const response = await confirmNewPassword(newPasswordUsername.value, newPasswordConfirmationCode.value, newPassword.value)
        console.log(response)
        forgotPasswordDialog.value = false
      }, 'New password has been confirmed!', 'Confirmation failed')
    }
    function beforeForgotPasswordDialogHide () {
      newPasswordConfirmationCode.value = ''
      newPassword.value = ''
      showCodeConfirm.value = false
    }

    function setTab (type) {
      const validTypes = ['signin', 'signup']
      const resolvedType = validTypes.includes(type) ? type : 'signup'
      tab.value = resolvedType
      updatePageGreeting(resolvedType)
    }
    watch(() => route.params.type, (newType) => {
      setTab(newType)
    }
    )
    onMounted(() => {
      const tabChoice = route.params.type || 'signup'
      setTab(tabChoice)
    })

    return {
      showSpinner,
      tab,
      error,
      pageGreeting,
      updatePageGreeting,

      email,
      password,
      staySignedIn,
      handleSignIn,
      showResendConfirmationCodeButton,
      handleResendConfirmationCode,

      signUpEmail,
      signUpPassword,
      signUpAttributes,
      handleSignUp,
      signupConfirmationCode,
      showSignupConfirmDialog,
      handleSignUpConfirmationCode,
      beforeSignupConfirmDialogHide,

      forgotPasswordDialog,
      showForgotPasswordDialog,
      newPasswordUsername,
      showCodeConfirm,
      newPasswordConfirmationCode,
      newPassword,
      requestNewPassword,
      saveNewPassword,
      beforeForgotPasswordDialogHide
    }
  },
}
</script>
<style lang="scss">
.signin-container {
  width: 400px;
}

.signin-card {
  width: 400px;
  min-height: 300px;
}

.forgot-password {
  cursor: pointer;
}

.forgot-password-card,
.signup-confirm-card {
  width: 400px;
}
</style>
