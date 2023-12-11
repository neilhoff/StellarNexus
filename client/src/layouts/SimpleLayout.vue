<template>
  <q-layout view="lHh Lpr lFf">

    <q-page-container>
      <router-view class="q-py-xs q-px-md" />
    </q-page-container>
  </q-layout>
</template>

<script>

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SimpleLayout',
  components: {
  },
  setup () {
    return {

    }
  }
})
</script>

<style lang="scss"></style>
