<template>
  <a
    class="essential-link"
    :class="title.replace(/ /g, '-').toLowerCase()"
    :href="link.internal ?  `#${link.location}` : link.location"
    :target="link.internal ?  '' : '_blank'"
    v-if="display"
  >
    <q-card
      class="essential-card q-ma-sm q-pa-md text-center text-white"
      :class="`bg-${bgColor}`"
      flat
    >
      <q-icon
        class="card-icon q-ma-sm"
        :name="icon"
      />
      <div class="text-subtitle2">{{title}}</div>

    </q-card>
  </a>
</template>

<script>
export default {
  name: 'EssentialCard',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: Object,
      default: function () {
        return {
          location: '#',
          internal: false
        }
      }
    },
    icon: {
      type: String,
      default: ''
    },
    display: {
      type: Boolean,
      default: true
    },
    bgColor: {
      type: String,
      default: 'primary'
    }
  }
}
</script>
<style lang="scss" scoped>
.essential-link {
  text-decoration: none;
}
.essential-card {
  min-width: 150px;

}
.card-icon {
  font-size: 1.5rem;
}
</style>
