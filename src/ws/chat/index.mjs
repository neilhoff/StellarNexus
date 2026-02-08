import arc from '@architect/functions'
import { blankToNull, getRandomShard } from '@architect/shared/tableHelper.mjs'
import { getYearMonth } from '@architect/shared/format.mjs'

function getChatRoomAWSKey (chatRoomType, chatRoomId) {
  return {
    pk: `${chatRoomType}#${chatRoomId}`,
    sk: '#DETAILS'
  }
}
// function getChatRoomDetails (chatRoomType, chatRoomId) {
//   return chatTable.get({ ...getChatRoomAWSKey(chatRoomType, chatRoomId) })
// }

export async function handler (event) {
  const body = JSON.parse(event.body)
  const chatObj = blankToNull(body.data)
  // Save Types: 'newChatRoom', 'newMessage', 'editChatRoom', 'editMessage', 'deleteChatRoom', 'deleteMessage'
  const { chatRoomType, chatRoomId, saveType } = chatObj
  try {
    const tables = await arc.tables()
    const chatTable = tables.chat
    // Decide which timestamp to use
    // Prefer client-provided timestamp (supports offline sync)
    // Fallback to server time
    const clientTime = chatObj?.timeStamp
    const useTime = clientTime ? new Date(clientTime) : new Date()
    const timeStamp = useTime.toISOString()           // ISO string for SK

    if (saveType === 'newChatRoom') {
      // Save the message
      // await chatTable.put(messageEntry)
      // Create the details entry
      await chatTable.put({
        ...getChatRoomAWSKey(chatRoomType, chatRoomId),
        title: '',
        chatRoomType,
        chatRoomId: '',
        numMessages: 1,
        newestMessageTime: timeStamp,
        newestMessageFrom: chatObj.from,
        newestMessagePreview: chatObj.message,
        participants: [chatObj.from],
        createdAt: timeStamp,
        createdBy: chatObj.from
      })

    } else if (saveType === 'newMessage') {
      const month = getYearMonth(useTime)               // "2025-11"
      const shard = getRandomShard()
      // Save the chat message
      const messageEntry = {
        pk: `${chatRoomType}#${chatRoomId}#${shard}#${month}`,
        sk: `${timeStamp}`,
        ...chatObj,
        shard,
        month,
        created: timeStamp
      }
      // Save the message
      await chatTable.put(messageEntry)

      // Update the details entry
      const chatDetails = await chatTable.get({ ...getChatRoomAWSKey(chatRoomType, chatRoomId) })
      const updatedChatDetails = {
        ...chatDetails,
        numMessages: (chatDetails.numMessages || 0) + 1,
        newestMessageTime: timeStamp,
        newestMessageFrom: chatObj.from,
        newestMessagePreview: chatObj.message,
        participants: chatDetails.participants.includes(chatObj.from)
          ? chatDetails.participants
          : [...chatDetails.participants, chatObj.from]
      }
      await chatTable.put(updatedChatDetails)

    } else if (saveType === 'editChatRoom') {
      const chatDetails = await chatTable.get({ ...getChatRoomAWSKey(chatRoomType, chatRoomId) })

    } else if (saveType === 'editMessage') {
      //TODO: do we need to update the chat details if a message is edited?
      const currentMessage = await chatTable.get({ pk: messageEntry.pk, sk: messageEntry.sk })
      const messageEditObj = {
        editDate: timeStamp,
        previousMessage: currentMessage.message
      }
      messageEntry.edited = timeStamp
      // Add to the messageEdits array or create it if it doesn't exist.
      messageEntry.messageEdits = Array.isArray(messageEntry.messageEdits) ? [...messageEntry.messageEdits, messageEditObj] : [messageEditObj]
    } else if (saveType === 'deleteChatRoom') {
      // TODO: Query all the messages and the "DETAILS" entry and remove each one.

    } else if (saveType === 'deleteMessage') {
      const chatDetails = await chatTable.get({ ...getChatRoomAWSKey(chatRoomType, chatRoomId) })
      chatDetails.numMessages--
      chatTable.delete({ pk: messageEntry.pk, sk: messageEntry.sk })
    }

    return { success: true, saveType, messageEntry }

  } catch (error) {
    console.log('Failed to save message:', error)
    return { success: false, error: error.message }
  }
}