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
			channel,
			sub_id,
			is_loading: false,
			instance_id,
			label_server: label,
			setting_sync: false,
			...instance_data
		}

		// New Instance
		const formattedInstancePayload = formatInstanceSettings(formatInstance)

		// Temp Instance
		const tempInstance = instanceSetting?.dataValues?.value
		let newInstance = []

		// Unique Instance Id
		const instanceIndex = tempInstance.findIndex((el) => {
			el._id === instance_id
		})
		tempInstance.splice(instanceIndex, 1)
		tempInstance.forEach((el) => {
			newInstance.push(el)
		})

		// Combine Instance
		newInstance.push({ ...formattedInstancePayload })

		// res.send(newInstance)
		// console.log(uniqueInstance)

		const updateInstance = await settingsDb.update({ value: newInstance }, { where: { key: 'instances' } })
		console.log(updateInstance, 'UPDATED')

		res.status(200).send({
			updated: updateInstance[0] === 1 ? 'success' : 'failed',
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
		console.log(req.body)
		const { sub_id, instance_id, recipient_id, message, room, selectedRoom, files, replyMessage, channel } = req.body;

		if (!sub_id) return res.status(402).send({ message: 'sub_id is Required', payload: 'sub_id' })
		if (!instance_id) return res.status(402).send({ message: 'instance_id is Required', payload: 'instance_id' })
		if (!recipient_id) return res.status(402).send({ message: 'recipient_id is Required', payload: 'recipient_id' })
		if (!message) return res.status(402).send({ message: 'message is Required', payload: 'message' })
		if (!room) return res.status(402).send({ message: 'room is Required', payload: 'room' })
		if (!selectedRoom) return res.status(402).send({ message: 'selectedRoom is Required', payload: 'selectedRoom' })
		if (!files) return res.status(402).send({ message: 'files is Required', payload: 'files' })
		if (!replyMessage) return res.status(402).send({ message: 'replyMessage is Required', payload: 'replyMessage' })
		if (!channel) return res.status(402).send({ message: 'channel is Required', payload: 'channel' })

		const foundChannel = registeredChannels.find((el) => el === channel)
		if (!foundChannel) res.status(404).send({ message: 'Channel Not Found', payload: 'channel' })

		const usersDb = database.users_subscrxiptions
		const marketaUser = await usersDb.findOne({ where: { sub_id } })
		if (!marketaUser) return res.status(404).send({ message: 'Marketa User Not Found', payload: sub_id })

		const settingsDb = await require("../models/settings.model")(database.sequelize, database.Sequelize, `${sub_id}_settings`)
		const instanceData = await settingsDb.findOne({ where: { key: "instances" } })

		const instance = instanceData?.dataValues?.value
		const found = instance.find((el) => {
			if (el._id === instance_id) return el
		})

		let instance_data
		let channelCfg
		let endpoint

		if ('instance_data' in found) instance_data = found.instance_data
		if ('channel' in instance_data) channelCfg = endpointConfig.find((el) => el.name === channel)

		if (!instance_data) {
			return res.status(404).send({ message: 'Data of channel instances is not found', status: false })
		}

		if (!channelCfg) {
			return res.status(404).send({ message: 'Channel configuration not found inside instance data', status: false })
		} else {
			endpoint = channelCfg.endpoint
			try {
				// TODO: Tinggal buat function buat save ke db room & message
				const dataPayload = { sub_id, instance_id, recipient_id, message, instance_data }
				const { data } = axios.post(endpoint, dataPayload)

				// TODO: Create Save Room & Message Function below
				// TODO: ...

				return res.send(data)
			} catch (e) {
				console.log(e)
				return res.status(500).send('Internal Server Error')
			}

		}

		// if ('endpoint' in channelConfig) {
		// 	endpoint = channelCfg.endpoint
		// 	try {
		// 		// ! DONE: Create Function to hit api from existing channel

		// 		const { data } = await axios.post(endpoint, instance_data)

		// 		// TODO: Write a function to get response message from channel API and save to the Room and Message DB
		// 	} catch (e) {
		// 		console.log(e)
		// 		return res.status(500).send({ message: e?.message })
		// 	}
		// }

		// if (instance.phone_number_id) {
		// 	channel = 'WA_CLOUD'
		// 	const endpoint = endpointConfig.waCloud
		// 	const chatPayload = {
		// 		content: message,
		// 		sub_id,
		// 		instance_id,
		// 		room_id: room,
		// 		recipient_number: recipient_id
		// 	}

		// 	response = await axios.post(endpoint, chatPayload);

		// 	console.log(response.data);
		// } else if (instance.username) {
		// 	channel = 'TWITTER'
		// 	const endpoint = endpointConfig.twitter
		// 	const chatPayload = {
		// 		sub_id,
		// 		instance_id,
		// 		room_id: selectedRoom,
		// 		content: {
		// 			text: message
		// 		}
		// 	}
		// 	response = await axios.post(endpoint, chatPayload)

		// 	console.log(response.data);

		// } else if (instance.id_page) {
		// 	channel = 'FACEBOOK'
		// 	const endpoint = endpointConfig.facebook
		// 	const chatPayload = {
		// 		to: recipient_id,
		// 		platform: 'facebook',
		// 		message,
		// 		pageAccessToken: instance.pageAccessToken
		// 	}
		// 	const messageParams = {
		// 		subId: sub_id,
		// 		instanceId: instance_id
		// 	}

		// 	response = await axios.post(endpoint, chatPayload, {
		// 		params: messageParams
		// 	})

		// 	console.log(response.data);

		// 	//operation to facebook account
		// }
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

		return res.status(404).json({
			message: 'Instance Not Found'
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