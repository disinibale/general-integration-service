/* Message format that needs to be fulfilled

	{
		type: STRING,
		value: {
			chatId: "STRING",
			dbRoomId: "STRING",
			content: "STRING",
			files: "ARRAY", // WIP
			original_message: "<ORIGINAL CHANNEL MESSAGE OBJECT>"
			data: {}, // WIP
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
  
*/

const validateFormat = (message) => {
	if (!message.hasOwnProperty('type')) {
		return false
	} else if (!message.hasOwnProperty('value')) {
		return false
	}

	return true
}

module.exports = validateFormat