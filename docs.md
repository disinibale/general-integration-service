# Marketa General API Integration Documentation

## POST /message

### _Request body_ :

```js
{
    sub_id: "STRING",
    instance_id: "STRING",
    room_id: "STRING",
    recipient_id: "STRING",
    channel: "STRING",
    type: "SEND" || "RECEIVE",
    message: {
        type: "STRING",
        value: {
        chatId: "STRING",
        dbRoomId: "STRING",
        content: "STRING",
        files: "ARRAY",
        original_message: "<ORIGINAL CHANNEL MESSAGE OBJECT>"
        data: {},
        fromMe: "BOOLEAN",
        deleted: "BOOLEAN",
        sender_id: "STRING",
        sender_name: "STRING",
        source_id: "STRING",
        timestamp: {
        _seconds: "INTEGER",
        _nanoseconds: "INTEGER",
        },
        distributed: "BOOLEAN",
        seen: "BOOLEAN",
        seen_by: "ARRAY",
        replyMessage: "INTEGER",
        content_notification: "STRING",
        couch_timestamp: "INTEGER",
      }
    }
}
```

### Success :

> _200_

```js
{
    message: "success",
    value: {
        id: "STRING",
        chatId: "STRING",
        dbRoomId: "STRING",
        content: "STRING",
        files: "JSONB",
        original_message: "JSONB"
        data: "JSONB",
        fromMe: "BOOLEAN",
        deleted: "BOOLEAN",
        sender_id: "STRING",
        sender_name: "STRING",
        source_id: "STRING",
        timestamp: {
          _seconds: "INTEGER",
          _nanoseconds: "INTEGER",
        },
        distributed: "BOOLEAN",
        seen: "BOOLEAN",
        seen_by: "JSONB",
        replyMessage: "JSONB",
        content_notification: "STRING",
        couch_timestamp: "INTEGER",
        createdAt: "STRING",
        updatedAt: "STRING"
    }
}
```

### Errors :

> #### _400_

- if empty parameter exists :

```js
{
  message: `<PARAMS> is required`;
}
```

- if `req.body.channel` type is not correct :

```js
{
  message: "Channel is incorrect or not registered";
}
```

- if `req.body.type` value is not `"SEND"` or `"RECEIVE"` :

```js
{
  message: "type must be 'SEND' or 'RECEIVE'";
}
```

- if `req.body.message` format is incorrect :

```js
{
  message: "Message format is incorrect";
}
```

> #### _401_

- if not registered in marketa :

```js
{
  message: "User is not registered in marketa";
}
```

> #### _500_

- if an unknown error occured :

```js
{
  message: "Internal Server Error";
}
```
