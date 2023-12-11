<template>
  <q-page>
    <page-header title="Example Page" />
    <div>
      This page generates an error on purpose for testing out the Admin Error Logs page.
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import PageHeader from 'src/components/PageHeader'

export default defineComponent({
  name: 'ExamplePage',
  components: {
    PageHeader
  },
  setup () {
    // Generate an error
    console.log({}.x.y)

    return {

    }
  }
})
</script>
