<template>
  <q-page>
    <PageHeader title="Stellar Chat" />
    <div
      class=" row"
      style="width: 100%;"
    >
      <div
        class="sn-border"
        :style="chatWindowStyle"
        style="max-width: 1024px; min-width: 350px;"
      >
        <q-layout
          view="lHh Lpr lFf"
          class="chat-layout"
          container
        >
          <q-drawer
            v-model="leftDrawerOpen"
            bordered
            :breakpoint="690"
          >
            <q-toolbar class="sn-border-bottom">
              <q-toolbar-title class="text-subtitle2">
                Chats
              </q-toolbar-title>
              <q-btn
                flat
                round
                dense
                icon="more_vert"
              />
            </q-toolbar>
            <q-list>
              <q-item
                @click="setActiveChat(chat)"
                clickable
                :key="chat.pk"
                v-for="chat of testChatRooms"
                v-ripple
              >
                <q-item-section side>
                  <q-avatar
                    color="primary"
                    :icon="getChatIcon(chat)"
                    size="md"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>{{ chat.title }}</q-item-section>
              </q-item>
            </q-list>
          </q-drawer>
          <q-header>
            <q-toolbar class="bg-grey-3 text-black">
              <q-btn
                @click="toggleLeftDrawer"
                dense
                flat
                :icon="leftDrawerOpen ? 'fa-solid fa-caret-left' : 'fa-solid fa-caret-right'"
                round
                size="xs"
              />
              <q-toolbar-title>
                {{ activeChat.title }}
              </q-toolbar-title>
            </q-toolbar>
          </q-header>

          <q-page-container>
            <q-page class="fit column">
              <div class="col scroll q-pa-md column justify-end q-pb-sm messages-column">
                <div
                  :key="msg.key"
                  v-for="msg in messages"
                >
                  <q-chat-message
                    v-if="msg.label"
                    :label="msg.label"
                  />
                  <q-chat-message
                    v-else
                    :avatar="msg.avatar"
                    :name="msg.name"
                    :sent="msg.sent"
                    :stamp="msg.stamp"
                    :text="msg.text"
                  />
                </div>

                <!-- Tiny spacer so last message doesn't glue to input (adjust 0–12px) -->
                <div class="q-mb-sm"></div>
              </div>

              <!-- Input area at bottom -->
              <q-footer class="bg-white">
                <div class="chat-input-wrapper">
                  <!-- TODO: figure out how to set a max height/rows for this input -->
                  <q-input
                    autogrow
                    class="q-ma-md q-mt-xs q-mb-md"
                    @keydown.enter.exact="submitNewMessage"
                    @keydown.enter.shift="() => { }"
                    label="Chat"
                    outlined
                    type="textarea"
                    v-model="newMessage"
                  >
                    <template v-slot:append>
                      <q-btn
                        @click="submitNewMessage"
                        color="primary"
                        flat
                        icon="send"
                        round
                      />
                    </template>
                  </q-input>
                </div>
              </q-footer>
            </q-page>
          </q-page-container>
        </q-layout>
      </div>
    </div>
  </q-page>
</template>

<script>
import { computed, defineComponent, ref } from 'vue'
import { useQuasar } from 'quasar'
import PageHeader from 'src/components/PageHeader.vue'
import formatHelpers from 'src/services/formatHelpers'
import { useAuthStore } from 'src/stores/authStore'

export default defineComponent({
  name: 'StellarChat',
  components: {
    PageHeader
  },
  setup () {
    const authStore = useAuthStore()
    const testChatRooms = [
      {
        pk: 'GROUP#g1234',
        sk: '#DETAILS',
        title: 'Our Group Chat!',
        chatRoomType: 'GROUP',
        chatRoomId: 'g1234',
        numMessages: '32',
        newestMessageTime: '2025-12-25T14:30:45.123Z',
        newestMessageFrom: 'user@gmail.com',
        newestMessagePreview: 'Great to hear!',
        participants: ['user@gmail.com', 'user2@gmail.com'],
        createdAt: '2025-01-15T09:00:00.000Z',
        createdBy: 'user2@gmail.com',
        isArchived: false,
      },
      {
        pk: 'PAGE#p1234',
        sk: '#DETAILS',
        title: 'Page X Chat',
        chatRoomType: 'PAGE',
        chatRoomId: 'p1234',
        numMessages: '32',
        newestMessageTime: '2025-12-25T14:30:45.123Z',
        newestMessageFrom: 'user@gmail.com',
        newestMessagePreview: 'Great to hear!',
        participants: ['user@gmail.com', 'user2@gmail.com'],
        createdAt: '2025-01-15T09:00:00.000Z',
        createdBy: 'user2@gmail.com',
        isArchived: false,
      }
    ]
    const { screen } = useQuasar()
    const chatWindowStyle = computed(() => ({
      height: screen.height - 100 + 'px',
      width: '100%'
    }))
    const inputMaxHeight = computed(() => ({
      maxHeight: (screen.height - 100) * 0.5 + 'px'
    }))

    const leftDrawerOpen = ref(true)
    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    function getChatIcon (details) {
      const iconMap = {
        GROUP: 'fa-solid fa-user-group',
        SINGLE: 'fa-solid fa-user',
        PAGE: 'fa-solid fa-newspaper'
      }
      if (details.chatRoomType === 'GROUP' && details.participants.length === 2) return iconMap.SINGLE

      return iconMap[details.chatRoomType]
    }

    const activeChat = ref('')
    const messages = ref([])
    function setActiveChat (chat) {
      activeChat.value = chat
      messages.value = getChatMessages(chat)
    }

    const newMessage = ref()
    function submitNewMessage (e) {
      if (!e.shiftKey) {
        e.preventDefault();
        if (newMessage.value?.trim()) {
          // send logic here
          console.log('Send:', newMessage.value);
          newMessage.value = '';
        }
      }
    }

    function getChatMessages (chat) {
      console.log('getting messages for chat:', chat)
      const response = [
        {
          name: 'Jane',
          avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
          from: 'jane@example.com',
          text: 'Hello, are you there?',
          created: '2025-12-25T14:30:45.123Z'
        },
        {
          name: 'Neil Hoff',
          avatar: 'https://cdn.quasar.dev/img/avatar4.jpg',
          from: 'neilhoff@protonmail.com',
          text: 'hey, how are you?',
          created: '2026-01-25T14:32:45.123Z'
        },
        {
          name: 'Jane',
          avatar: 'https://cdn.quasar.dev/img/avatar3.jpg',
          from: 'jane@example.com',
          text: 'doing fine, how r you?',
          created: '2026-01-25T14:35:45.123Z'
        }
      ]
      const baseMessages = response.map((msg, index) => ({
        key: `${msg.created}-${index}`,
        name: msg.name,
        avatar: msg.avatar,
        text: [msg.text],
        sent: msg.from === authStore.email,
        stamp: formatHelpers.getRelativeTimeStamp(msg.created),
        created: msg.created
      }))
      const withLabels = addDateLabels(baseMessages)
      console.log('formatted messages:', withLabels)
      return withLabels
    }

    function addDateLabels (items) {
      const result = []
      let lastDayKey = ''
      for (const msg of items) {
        const dayKey = formatHelpers.formatDateLabel(msg.created, 'yyyy-MM-dd')
        if (dayKey !== lastDayKey) {
          result.push({
            key: `label-${dayKey}`,
            label: formatHelpers.formatDateLabel(msg.created, 'EEEE, do')
          })
          lastDayKey = dayKey
        }
        result.push(msg)
      }
      return result
    }

    return {
      chatWindowStyle,
      inputMaxHeight,
      leftDrawerOpen,
      toggleLeftDrawer,
      testChatRooms,
      getChatIcon,

      activeChat,
      messages,
      setActiveChat,

      newMessage,
      submitNewMessage
    }
  }
})
</script>
<style lang="scss">
.chat-layout {
  z-index: 4000;
  height: 100%;
  width: 100%;
  border-radius: 5px;
}

.chat-messages-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-input-wrapper {
  max-height: 30vh;
  overflow-y: auto;
}

.chat-input-wrapper :deep(textarea) {
  max-height: 180px !important; // stronger if needed
  overflow-y: auto;
  resize: none; // already have this – prevents manual drag-resize
}

.full-height {
  height: 100%;
}

.scroll-y {
  overflow-y: auto;
}
</style>
