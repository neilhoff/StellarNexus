import { getWebSocketService } from 'src/boot/defaults.js'
import { useAuthStore } from 'src/stores/authStore.js'

const chatService = {
  async saveMessage (saveType, message, chatRoomType, chatRoomId) {
    try {
      const webSocket = getWebSocketService()
      if (!webSocket.isConnected()) {
        await webSocket.connect()
      }
      const authStore = useAuthStore()
      const messageObj = {
        chatRoomType,
        chatRoomId,
        from: authStore.email,
        message: message,
        messageId: crypto.randomUUID(),
        saveType
      }
      webSocket.send('chat', { ...messageObj })
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  },
  async newChatRoom (chatRoomType, title) {
    try {
      const webSocket = getWebSocketService()
      if (!webSocket.isConnected()) {
        await webSocket.connect()
      }
      const authStore = useAuthStore()
      const chatObj = {
        chatRoomType,
        chatRoomTypeId: crypto.randomUUID(),
        createdBy: authStore.email,
        saveType: 'newChat',
        title
      }
      webSocket.send('chat', { ...chatObj })
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }
}

export { chatService }
