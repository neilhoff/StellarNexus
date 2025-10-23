// Define global WebSocket message handler (e.g., for chat window)
export const globalMessageHandler = (data) => {
  // TODO: Setup persistent chat ws once it is built
  console.log('Global WebSocket message received:', data)
  if (data.type === 'chat_message') {
    // Example: Show chat notification

  }
}
