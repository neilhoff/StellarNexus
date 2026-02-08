## Chat Data Model

- Each message is saved as a single entry.
- The pk is the Chat room Type with its unique id.
- Chat Room Types
    - Group - messages between users
    - Page - messages associated with a page
    - Table - messages associated with a table
    - TableRow - messages associated with a row of a table
    - Custom - Create your own message type
  

### Messages

```

{
  pk: 'PAGE#<Chat Room id>#SHARD02#2025-12',
  sk: '<created time stamp>',
  messageId: 'cryptoUUID',
  chatRoomType: 'page_123',
  chatRoomId: 'chat room unique id',
  text: 'This is a great page!',
  from: 'user@gmail.com',
  name: 'name'
  created: '2025-12-25T14:30:45.123Z',
  edited: '2025-12-25T14:30:45.123Z',
  messageEdits: [
    { 
      editDate: '2025-12-25T14:30:45.123Z', 
      previousMessage: 'this is a great pppgge!'
    }
  ],
  shard: '02',
  month: '2025-12'
}

```

### Group Details

```

{
  pk: 'PAGE#<Chat Room type id>',
  sk: '#DETAILS',
  title: 'Wonderful Chat!',
  chatRoomType: 'PAGE',
  chatRoomId: 'page_123',
  numMessages: '32',
  newestMessageTime: '2025-12-25T14:30:45.123Z',
  newestMessageFrom: 'user@gmail.com',
  newestMessagePreview: 'Great to hear!',
  participants: ['user@gmail.com', 'user2@gmail.com'],
  createdAt: '2025-01-15T09:00:00.000Z',
  createdBy: 'user2@gmail.com',
  isArchived: false,  
}

```