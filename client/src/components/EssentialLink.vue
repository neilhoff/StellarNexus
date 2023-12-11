<template>
  <q-item
    active-class="left-drawer-active-class"
    :class="title.replace(/ /g, '-').toLowerCase()"
    clickable
    data-cy="essential-link"
    :to="link.location"
    v-if="display && link.internal && auth"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon">
        <q-tooltip
          anchor="center right"
          :offset="[10, 10]"
          self="center left"
          transition-hide="scale"
          transition-show="scale"
        >
          {{ title }}
        </q-tooltip>
      </q-icon>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label
        v-if="caption"
        caption
      >
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>

  <q-item
    active-class="left-drawer-active-class"
    :class="title.replace(/ /g, '-').toLowerCase()"
    clickable
    data-cy="essential-link"
    :href="link.location"
    target="_blank"
    v-if="display && !link.internal && auth"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon">
        <q-tooltip
          anchor="center right"
          :offset="[10, 10]"
          self="center left"
          transition-hide="scale"
          transition-show="scale"
        >
          {{ title }}
        </q-tooltip>
      </q-icon>
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label
        v-if="caption"
        caption
      >
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'EssentialLink',
  components: {

  },
  props: {
    auth: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
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
    displayTerms: {
      type: Array,
      default: () => {
        return []
      }
    }
  }
}
</script>
