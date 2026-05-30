import { globalMessageHandler } from './globalMessageHandler.js'
import { useAuthStore } from 'src/stores/authStore.js'

function normalizeWebSocketUrl (rawUrl) {
  const fallback = typeof window !== 'undefined' ? window.location.origin : 'ws://localhost:3333'
  const source = rawUrl || fallback

  try {
    const parsed = new URL(source, fallback)
    if (parsed.protocol === 'http:') parsed.protocol = 'ws:'
    if (parsed.protocol === 'https:') parsed.protocol = 'wss:'
    return parsed.toString()
  } catch {
    if (source.startsWith('http://')) return source.replace('http://', 'ws://')
    if (source.startsWith('https://')) return source.replace('https://', 'wss://')
    return source
  }
}

function getConnectionUrl () {
  const url = new URL(normalizeWebSocketUrl(process.env.WS_URL))

  try {
    const authStore = useAuthStore()
    if (authStore?.idToken) {
      url.searchParams.set('token', authStore.idToken)
    }
    if (authStore?.email) {
      url.searchParams.set('email', authStore.email)
    }
  } catch {
    // Ignore auth metadata if store is unavailable during app bootstrap.
  }

  return url.toString()
}

function createBaseWebSocketService () {
  let ws = null
  let messageHandlers = [] // Array to store all message handlers
  let reconnectAttempts = 0
  let reconnectTimer = null
  let shouldReconnect = true

  function clearReconnectTimer () {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function scheduleReconnect () {
    if (!shouldReconnect || reconnectTimer) return
    const delay = Math.min(1000 * (2 ** reconnectAttempts), 15000)
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      reconnectAttempts += 1
      connect().catch((error) => {
        console.error('WebSocket reconnect failed:', error)
      })
    }, delay)
  }

  function connect () {
    return new Promise((resolve, reject) => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        resolve(ws)
        return
      }

      clearReconnectTimer()
      shouldReconnect = true

      ws = new WebSocket(getConnectionUrl())

      ws.onopen = () => {
        console.log('Connected to WebSocket server')
        reconnectAttempts = 0
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
        scheduleReconnect()
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        reject(error)
      }
    })
  }

  function isConnected () {
    return ws !== null && ws.readyState === WebSocket.OPEN
  }

  function send (action, data, includeMe = false) {
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

  function disconnect () {
    shouldReconnect = false
    clearReconnectTimer()
    if (ws) {
      ws.close()
    }
    ws = null
    messageHandlers = [] // Clear handlers on disconnect
  }

  // Add a message handler (global or page-specific)
  function addMessageHandler (handler) {
    if (typeof handler === 'function' && !messageHandlers.includes(handler)) {
      messageHandlers.push(handler)
      return handler // Return handler for reference (useful for removal)
    }
    return null
  }

  // Register global message handler
  addMessageHandler(globalMessageHandler)

  // Remove a specific message handler
  function removeMessageHandler (handler) {
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
