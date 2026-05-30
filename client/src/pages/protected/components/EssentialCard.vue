<template>
  <a
    class="essential-link"
    :class="title.replace(/ /g, '-').toLowerCase()"
    :href="link.internal ? `#${link.location}` : link.location"
    :target="link.internal ? '' : '_blank'"
    v-if="display"
  >
    <q-card
      class="essential-card"
      flat
    >
      <div class="metric-icon-wrapper">
        <q-icon
          class="card-icon"
          :name="icon"
          :color="iconColor"
        />
      </div>
      <div class="card-title">{{ title }}</div>
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
    },
    authorized: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    iconColor () {
      const colorMap = {
        primary: 'primary',
        accent: 'accent',
        secondary: 'secondary',
        positive: 'positive',
        warning: 'warning',
        info: 'info'
      }
      return colorMap[this.bgColor] || 'primary'
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
  padding: 16px;
  background-color: $card-bg;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
}

body.body--dark .essential-card {
  background-color: $dark-card-bg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
}

.metric-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: $surface;
  border-radius: 8px;
}

body.body--dark .metric-icon-wrapper {
  background-color: $dark-elevated;
}

.card-icon {
  font-size: 1.25rem;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
  text-align: center;
}

body.body--dark .card-title {
  color: $dark-text-primary;
}
</style>
