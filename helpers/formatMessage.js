// {
// 	"sub_id": "STRING",
// 	"instance_id": "STRING",
// 	"channel": "WHATSAPP" || "FACEBOOK" || "INSTAGRAM" || "TWITTER" || "WHATSAPP_CLOUD",
// 	"type": "SEND" || "RECEIVE",
// 	"message": {
//      "channel_message_id": "STRING"
// 		"timestamp": "INTEGER",
// 		"type": "TEXT" || "MEDIA",
// 		"marketa_user": {
//          id: "STRING",
//          name: "STRING",
//          profile_picture: "STRING"
//      },
// 		"assosciated_user": {
//          id: "STRING",
//          name: "STRING",
//          profile_picture: "STRING"
//      },,
// 		"attachments"*: [
// 			{
// 				"type": "image" || "audio" || "video" || "file",
// 				"data": {
// 					// data dari attachment isi disini
// 				}
// 			}
// 		],
// 		"content"**: "STRING",
//      "reply"*: {}
// 	}
// }
// CATATAN
// * Opsional
// ** Opsional kalo message.type !== "TEXT"

// {
//     "sub_id": "sptdvu0z2",
//     "instance_id": "zlgjjky9",
//     "room_id": "sxgcoe-62822153798927",
//     "recipient_id": "62822153798927",
//     "channel": "WHATSAPP",
//     "type": "SEND",
//     "message": {
//         "type": "TEXT",
//         "value": {
//             "chatId": "sxgcoe-3A7A0FF697371292C753",
//             "dbRoomId": "sxgcoe-62822153798927",
//             "content": "makan ikan",
//             "files": [],
//             "original_message": "3A7A0FF697371292C753",
//             "data": {"quotedStanzaID": "3A66126D11755031F198"},
//             "fromMe": false,
//             "deleted": null,
//             "sender_id": "6288261487893",
//             "sender_name": "Testing",
//             "source_id": "3A7A0FF697371292C753",
//             // "timestamp": {"_seconds": 1660646300, "_nanoseconds": 0},
//             "distributed": true,
//             "seen": false,
//             "seen_by": [],
//             "replyMessage": {"content": "Makan apa tadi", "senderId": "6282215379892"},
//             "content_notification": "makan ayam"
//             // "couch_timestamp": "1660646300"
//         }
//     }
// }

const formatMessage = (instance_id, message) => {
    if (!instance_id) return false
    if (!message) return false

    const formattedMessage = {
        chatId: `${instance_id}-${message.channel_message_id}`,
        dbRoomId: `${instance_id}-${message.associated_user.id}`,
        content: message.content,
        files: [],
        original_message: message.channel_message_id,
        data: message.reply ? message.reply : {},
        fromMe: message.fromMe,
        deleted: null,
        sender_id: message.sender_id,
        sender_name: message.sender_name,
        source_id: message.channel_message_id,
        timestamp: {_seconds: Math.floor(message.timestamp / 1000), _nanoseconds: 0},
        distributed: true,
        seen: message.seen,
        seen_by: [],
        replyMessage: message.reply ? message.reply : {},
        content_notification: message.content,
        couch_timestamp: message.timestamp
    }

    return formattedMessage
}

module.exports = formatMessage