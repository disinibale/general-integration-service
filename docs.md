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
        content: "STRING"
    }
}
```

### Success :
> _200_
```js
{
    message: "success",
    value: {
        
    }
}
```

### Errors :
> #### _400_
- if empty parameter exists :
```js
{
    message: `<PARAMS> is required`
}
```
- if `req.body.channel` type is not correct :
```js
{
    message: 'Channel is incorrect or not registered'
}
```
- if `req.body.type` value is not `"SEND"` or `"RECEIVE"` :
```js
{
    message: "type must be 'SEND' or 'RECEIVE'"
}
```
- if `req.body.message` format is incorrect :
```js
{
    message: 'Message format is incorrect'
}
```

> #### _401_
- if not registered in marketa :
```js
{
    message: "User is not registered in marketa"
}
```

> #### _500_
- if an unknown error occured :
```js
{
    message: 'Internal Server Error'
}
```