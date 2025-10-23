import { globalMessageHandler } from './globalMessageHandler.js'

const createBaseWebSocketService = () => {
  let ws = null
  let messageHandlers = [] // Array to store all message handlers

  const connect = () => {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        resolve(ws)
        return
      }

      ws = new WebSocket(process.env.WS_URL)

      ws.onopen = () => {
        console.log('Connected to WebSocket server')
        resolve(ws)
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        // Call all registered message handlers
        messageHandlers.forEach(handler => handler(data))
      }

      ws.onclose = () => {
        console.log('Disconnected from WebSocket server')
        ws = null
        // Optionally, attempt to reconnect
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }
    })
  }

  const isConnected = () => {
    return ws !== null && ws.readyState === WebSocket.OPEN
  }

  const send = (action, data, includeMe = false) => {
    const sendData = JSON.stringify({
      action: action,
      data: { ...data },
      includeMe,
    })
    if (isConnected()) {
      return ws.send(sendData)
    } else {
      console.error('Not connected')
      return null
    }
  }

  const disconnect = () => {
    if (ws) {
      ws.close()
    }
    ws = null
    messageHandlers = [] // Clear handlers on disconnect
  }

  // Add a message handler (global or page-specific)
  const addMessageHandler = (handler) => {
    if (typeof handler === 'function' && !messageHandlers.includes(handler)) {
      messageHandlers.push(handler)
      return handler // Return handler for reference (useful for removal)
    }
    return null
  }

  // Register global message handler
  addMessageHandler(globalMessageHandler)

  // Remove a specific message handler
  const removeMessageHandler = (handler) => {
    messageHandlers = messageHandlers.filter(h => h !== handler)
  }

  return {
    send,
    connect,
    disconnect,
    isConnected,
    addMessageHandler,
    removeMessageHandler
  }
}

export default createBaseWebSocketService()
