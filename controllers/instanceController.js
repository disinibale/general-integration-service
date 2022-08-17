const database = require("../models")
const registeredChannels = require("./channels.json")
const { validateFormat, formatLastMessage, formatMessage } = require('../helpers')

const saveMessageToDatabase = async (req, res, next) => {
	try {
		
		const { sub_id, instance_id, channel, type, message } = req.body

		// body validations
		if (!sub_id) throw { type: 'BAD_REQUEST', payload: 'sub_id' }
		if (!instance_id) throw { type: 'BAD_REQUEST', payload: 'instance_id' }

		const foundChannel = registeredChannels.find((el) => el === channel)
		if (!foundChannel) throw { type: 'BAD_REQUEST', payload: 'channel' }

		if (type !== 'SEND' && type !== 'RECEIVE') throw { type: 'BAD_REQUEST', payload: 'type' }
		if (!message) throw { type: 'BAD_REQUEST', payload: 'message' }

		const messageValidated = validateFormat(message)
		if (!messageValidated) throw { type: 'BAD_REQUEST', payload: 'message' }

		// declare database variables
		const messageDb = await require("../models/messages.models")(
			database.sequelize,
			database.Sequelize,
			`${sub_id}_messages`
		);
		const roomDb = await require("../models/rooms.models")(
			database.sequelize,
			database.Sequelize,
			`${sub_id}_rooms`
		);
		const settingsDb = await require("../models/settings.model")(
			database.sequelize,
			database.Sequelize,
			`${sub_id}_settings`
		);
		const usersDb = database.users_subscriptions

		const marketaUser = await usersDb.findOne({
			where: { sub_id },
			raw: true
		})
		if (!marketaUser) throw { type: 'NOT_AUTHORIZED' }

		if (type === 'SEND') {
			// insert send operation here
			message.fromMe = true
			message.seen = true
			message.sender_id = message.marketa_user.id
			message.sender_name = message.marketa_user.name
		}

		if (type === 'RECEIVE') {
			message.fromMe = true
			message.seen = false
			message.sender_id = message.associated_user.id
			message.sender_name = message.associated_user.name
		}

		const formattedMessage = formatMessage(instance_id, message)
		if (!formattedMessage) throw { type: 'ERROR' }
		// console.log('@@@@@@@@', formattedMessage)

		const insertedMessage = await messageDb.create(formattedMessage, {
			raw: true
		})
		if (!insertedMessage) throw { type: 'FAILED_OPERATION' }
		// console.log(insertedMessage, '@@@@@@@@@@')

		// start update room
		let room = await roomDb.findOne({
			where: { roomId: `${instance_id}-${message.associated_user.id}` }
		})

		if (!room) {
			const roomParticipants = [
				{
					_id: message.associated_user.id,
					avatar: message.marketa_user.profile_picture,
					status: null,
					username: message.associated_user.id,
				},
				{
					_id: marketaUser.phone_number,
					avatar: message.associated_user.profile_picture,
					status: null,
					username: marketaUser.name,
				},
			];
			const roomTemplate = {
				phone_number: message.associated_user.id,
				name: message.associated_user.id,
				phone_number_show: message.associated_user.id,
				profile_picture: message.profile_picture,
				instance_id: instance_id,
				sync_firestore: false,
				// unread_count: 0,
				roomId: `${instance_id}-${message.associated_user.id}`,
				pinned: false,
				last_interaction: null,
				unread_count: 0,
				archived: false,
				roomStatus: "on_queue",
				unreplied: false,
				last_reply: 0,
				last_message: 0,
				lastMessage: null,
				// message_from_me: 0,
				roomName: message.associated_user.id,
				roomOwnerId: marketaUser.phone_number,
				roomOwnerName: marketaUser.name,
				subId: sub_id,
				users: roomParticipants,
				channel_source: channel,
				last_message_status: null,
			};

			room = await roomDb.create(roomTemplate)
		}

		const roomUpdatePayload = {
			last_reply: insertedMessage.couch_timestamp,
			last_message: insertedMessage.couch_timestamp,
			lastMessage: formatLastMessage(insertedMessage),
			message_from_me: insertedMessage.couch_timestamp,
			unread_count: 0,
			unreplied: true,
		}
		const updatedRoom = await roomDb.update(roomUpdatePayload, {
			where: { roomId: insertedMessage.dbRoomId },
			returning: true
		});
		if (!updatedRoom) throw { type: 'FAILED_OPERATION' }

		res.status(200).json({ message: 'success' })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	saveMessageToDatabase
}

const example = {
	"sub_id": "sptdvu0z2",
	"instance_id": "zlgjjky9",
	"room_id": "sxgcoe-62822153798927",
	"recipient_id": "62822153798927",
	"channel": "WHATSAPP",
	"type": "SEND",
	"message": {
		"type": "TEXT",
		"value": {
			"chatId": "sxgcoe-3A7A0FF697371292C753",
			"dbRoomId": "sxgcoe-62822153798927",
			"content": "makan ikan",
			"files": [],
			"original_message": "3A7A0FF697371292C753",
			"data": { "quotedStanzaID": "3A66126D11755031F198" },
			"fromMe": false,
			"deleted": null,
			"sender_id": "6288261487893",
			"sender_name": "Testing",
			"source_id": "3A7A0FF697371292C753",
			// "timestamp": {"_seconds": 1660646300, "_nanoseconds": 0},
			"distributed": true,
			"seen": false,
			"seen_by": [],
			"replyMessage": { "content": "Makan apa tadi", "senderId": "6282215379892" },
			"content_notification": "makan ayam"
			// "couch_timestamp": "1660646300"
		}
	}
}

const realExample = {
	"sub_id": "STRING",
	"instance_id": "STRING",
	"channel": "WHATSAPP" || "FACEBOOK" || "INSTAGRAM" || "TWITTER" || "WHATSAPP_CLOUD",
	"type": "SEND" || "RECEIVE",
	"message": {
		"timestamp": "INTEGER",
		"type": "TEXT" || "MEDIA",
		"sender_id": "STRING",
		"recipient_id": "STRING",
		"attachments": [
			{
				"type": "image" || "audio" || "video" || "file",
				"data": {
					// data dari attachment isi disini
				}
			}
		],
		"content": "STRING"
	}
}