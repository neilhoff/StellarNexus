<template>
  <q-btn
    @click="bitcoinSignIn"
    flat
    no-caps
    v-if="!store.state.web3.signedIn"
  >
    <q-img
      class="wallet-logo q-mr-sm"
      :src="walletIcon"
    /> Sign-in with a Bitcoin Wallet
  </q-btn>
  <div v-else>
    <q-chip
      class="bg-primary text-white"
      clickable
      @click="bitcoinSignOut"
      square
    >
      <q-img
        class="wallet-logo q-mr-sm"
        :src="walletIcon"
      /> {{ signedInDisplay }}
    </q-chip>

  </div>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { getAddress } from 'sats-connect'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'BitcoinSignIn',
  props: {
    walletTypes: {
      type: Array,
      default: () => ['ordinals', 'payment', 'stacks']
    },
    navigateToAfterSignIn: {
      type: String,
      default: null
    }
  },
  setup ({ walletTypes, navigateToAfterSignIn }) {
    const store = useStore()
    const router = useRouter()
    const getAddressOptions = {
      payload: {
        purposes: walletTypes,
        message: 'Address for receiving Ordinals and payments',
        network: {
          type: 'Testnet'
        }
      },
      onFinish: (response) => {
        saveAddresses(response.addresses)
      },
      onCancel: () => alert('Request canceled')
    }
    async function bitcoinSignIn () {
      await getAddress(getAddressOptions)
      if (navigateToAfterSignIn) {
        router.push({ name: 'SiteHome' })
      }
    }
    const walletCommits = { ordinals: 'setOrdinalsAddress', payment: 'setBtcPaymentAddress', stacks: 'setStacksAddress' }
    function saveAddresses (addresses) {
      if (addresses.length > 0) {
        store.commit('web3/setSignedIn', true)
        for (const wallet of walletTypes) {
          store.commit(`web3/${walletCommits[wallet]}`, addresses.find(item => item.purpose === wallet))
        }
      }
    }
    async function bitcoinSignOut () {
      store.commit('web3/setSignedIn', false)
      const availableWalletTypes = ['ordinals', 'payment', 'stacks']
      for (const wallet of availableWalletTypes) {
        store.commit(`web3/${walletCommits[wallet]}`, null)
      }
    }

    // const isSignedIn = ref(store.state.web3.signedIn)
    const signedInDisplay = computed(() => {
      const s = store.state.web3
      let address = ''
      if (s.btcPaymentAddress) {
        address = s.btcPaymentAddress.address
      } else if (s.ordinalsAddress) {
        address = s.ordinalsAddress.address
      } else if (s.stacksAddress) {
        address = s.stacksAddress.address
      }
      if (address.length > 9) {
        address = address.substring(0, 5) + '...' + address.substring(address.length - 5)
      }
      return address
    })

    const walletIcon = computed(() => {
      const s = store.state.web3
      if (s.btcPaymentAddress) {
        return require('src/assets/web3/bitcoin-circle.svg')
      } else if (s.ordinalsAddress) {
        return require('src/assets/web3/ordinals.png')
      } else if (s.stacksAddress) {
        return require('src/assets/web3/stacks-logo.svg')
      } else {
        return require('src/assets/web3/bitcoin-circle.svg')
      }
    })

    return {
      bitcoinSignIn,
      store,
      signedInDisplay,
      walletIcon,
      bitcoinSignOut
    }
  }
})
</script>
<style lang="scss">
.wallet-logo {
  height: 30px;
  width: 30px;
}
</style>
