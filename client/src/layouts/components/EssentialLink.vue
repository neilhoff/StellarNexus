<template>
  <q-item
    active-class="left-drawer-active-class"
    :class="title.replace(/ /g, '-').toLowerCase()"
    clickable
    data-cy="essential-link"
    :dense="dense"
    :to="link.location"
    v-if="display && link.internal"
  >
    <q-item-section
      v-if="icon || imageIcon"
      avatar
    >
      <q-icon
        :name="icon"
        v-if="icon && !imageIcon"
      >
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
      <q-img
        class="essential-link-image-icon"
        :src="imageIcon"
        v-if="imageIcon"
      ><q-tooltip
          anchor="center right"
          :offset="[10, 10]"
          self="center left"
          transition-hide="scale"
          transition-show="scale"
        >
          {{ title }}
        </q-tooltip>
      </q-img>
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
    v-if="display && !link.internal"
  >
    <q-item-section
      v-if="icon || imageIcon"
      avatar
    >
      <q-icon
        :name="icon"
        v-if="icon && !imageIcon"
      >
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
      <q-img
        class="essential-link-image-icon"
        :src="imageIcon"
        v-if="imageIcon"
      ><q-tooltip
          anchor="center right"
          :offset="[10, 10]"
          self="center left"
          transition-hide="scale"
          transition-show="scale"
        >
          {{ title }}
        </q-tooltip>
      </q-img>
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
    imageIcon: {
      type: String,
      default: null
    },
    display: {
      type: Boolean,
      default: true
    },
    dense: {
      type: Boolean,
      default: true
    },
    authorized: {
      type: Boolean,
      default: true
    }
  }
}
</script>
<style lang="scss" scoped>
.essential-link-image-icon {
  height: 30px;
  width: 30px;
}
</style>
