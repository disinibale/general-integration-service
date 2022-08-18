const database = require("../models")
const registeredChannels = require("./channels.json")
const { validateFormat, formatLastMessage, formatMessage, formatInstanceSettings } = require('../helpers')
const axios = require('axios');
const endpointConfig = require('../config/integrationEndpoint.config')

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
				profile_picture: message.associated_user.profile_picture,
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

const registerChannel = async (req, res, next) => {
	try {
		const { sub_id, instance_id, channel, label, instance_data } = req.body
		console.log(req.body)

		if (!sub_id) throw { status: 402, message: 'Bad Request', payload: 'sub_id' }
		if (!instance_id) throw { status: 402, message: 'Bad Request', payload: 'instance_id' }

		const foundChannel = registeredChannels.find((el) => el === channel)
		if (!foundChannel) throw { type: 'BAD_REQUEST', payload: 'channel' }

		const settingsDb = await require('../models/settings.model')(database.sequelize, database.Sequelize, `${sub_id}_settings`)
		const instanceSetting = await settingsDb.findOne({ where: { key: 'instances' } })
		const formatInstance = {
			_id: instance_id,
			color: '#' + Math.floor(Math.random() * 16777215).toString(16),
			label,
			status: 0,
			sub_id,
			is_loading: false,
			instance_id,
			label_server: label,
			setting_sync: false,
			...instance_data
		}

		const formattedInstancePayload = formatInstanceSettings(formatInstance)
		const tempInstance = instanceSetting?.dataValues?.value
		let newInstance = []
		tempInstance.forEach((el) => {
			newInstance.push(el)
		})
		newInstance.push({ ...formattedInstancePayload })

		// TODO: Must Create function For eliminate Duplicated Object Values
		// TODO: Create the function below (You can create a helper function or for this specific purposes)

		// TODO: Create the function above
		const updateInstance = await settingsDb.update({ value: newInstance }, { where: { key: 'instances' } })
		console.log(updateInstance, 'UPDATED')

		res.status(204).json(() => {
			if (updateInstance[0] === 1) return {message: true}
			
			return {message: false}
		})
	} catch (e) {
		console.log(e)
		res.status(500).json({
			message: 'Internal Server Error'
		})
	}
}

const checkInstance = async (req, res, next) => {
	try {
		const { sub_id, instance_id, recipient_id, message, room, selectedRoom, files, replyMessage } = req.body;


		const settingsDb = await require("../models/settings.model")(
			database.sequelize,
			database.Sequelize,
			`${sub_id}_settings`
		);

		const instanceData = await settingsDb.findOne({
			where: {
				key: "instances"
			}
		})

		const instance = instanceData?.dataValues?.value;
		const channel = ''
		let response
		// ++++++ TINGGAL DI UNCOMENT DAN DISESUAIKAN 

		if (instance.phone_number_id) {
			channel = 'WA_CLOUD'
			const endpoint = endpointConfig.waCloud
			const chatPayload = {
				content: message,
				sub_id,
				instance_id,
				room_id: room,
				recipient_number: recipient_id
			}

			response = await axios.post(endpoint, chatPayload);

			console.log(response.data);
		} else if (instance.username) {
			channel = 'TWITTER'
			const endpoint = endpointConfig.twitter
			const chatPayload = {
				sub_id,
				instance_id,
				room_id: selectedRoom,
				content: {
					text: message
				}
			}
			response = await axios.post(endpoint, chatPayload)

			console.log(response.data);

		} else if (instance.id_page) {
			channel = 'FACEBOOK'
			const endpoint = endpointConfig.facebook
			const chatPayload = {
				to: recipient_id,
				platform: 'facebook',
				message,
				pageAccessToken: instance.pageAccessToken
			}
			const messageParams = {
				subId: sub_id,
				instanceId: instance_id
			}

			response = await axios.post(endpoint, chatPayload, {
				params: messageParams
			})

			console.log(response.data);

			//operation to facebook account
		}
		// else if (instance.id_instagram) {
		// 	channel = 'INSTAGRAM'
		// 	const endpoint = endpointConfig.instagram
		// 	const chatPayload = {
		// 		to: recipient_id,
		// 		platform: 'instagram',
		// 		message,
		// 		pageAccessToken: instance.pageAccessToken
		// 	}
		// 	//operation to instagram account
		// }
		// ++++++ TINGGAL DI UNCOMENT DAN DISESUAIKAN 

		if (response.data) console.log('wakwaw')

		res.status(200).json({
			message: "OK"
		})
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "ADA ERROR"
		})
	}
}

module.exports = {
	saveMessageToDatabase,
	checkInstance,
	registerChannel
}