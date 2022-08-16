const database = require("../models")
const registeredChannels = require("./channels.json")
const { validateFormat } = require('../helpers')
const axios = require('axios');


const saveMessageToDatabase = async (req, res, next) => {
	try {
		const { sub_id, instance_id, room_id, recipient_id, channel, type, message } = req.body
		// body validations
		if (!sub_id) throw { type: 'BAD_REQUEST', payload: 'sub_id' }
		if (!instance_id) throw { type: 'BAD_REQUEST', payload: 'instance_id' }
		if (!room_id) throw { type: 'BAD_REQUEST', payload: 'room_id' }
		if (!recipient_id) throw { type: 'BAD_REQUEST', payload: 'recipient_id' }

		const foundChannel = registeredChannels.find((el) => el === channel)
		if (!foundChannel) throw { type: 'BAD_REQUEST', payload: 'channel'}

		if (type !== 'SEND' && type !== 'RECEIVE') throw { type: 'BAD_REQUEST', payload: 'type' }
		if (!message) throw { type: 'BAD_REQUEST', payload: 'message' }

		const messageValidated = validateFormat(message)
		if (!messageValidated) throw { type: 'BAD_REQUEST', payload: 'message'}

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
		}

		if (type === 'RECEIVE') {
			// insert receive operation here
		}

		const response = await messageDb.create(message.value, {
			raw: true
		})
		console.log(response)
		if (!response) throw { type: 'FAILED_OPERATION' }

		res.status(200).json({ message: 'success', value: response })
	} catch (err) {
		next(err)
	}
}

const checkInstance = async (req, res, next) => {
	try {
		const {
			sub_id,
			instance_id,
			recipient_id,
			message,
			room,
			selectedRoom,
			files,
			replyMessage
		} = req.body;


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


		// ++++++ TINGGAL DI UNCOMENT DAN DISESUAIKAN 

		// if(instance.phone_number_id) {
		// 	const endpoint = process.env.WA_CLOUD_ENDPOINT
		// 	const chatPayload = {
		// 		content: message,
		// 		sub_id,
		// 		instance_id,
		// 		room_id: room,
		// 		recipient_number: recipient_id
		// 	}

		// 	const response = await axios.post(endpoint, chatPayload);
			
		// 	console.log(response.data);
		// } else if (instance.username) {
		// 	const endpoint = process.env.TWITTER_ENDPOINT
		// 	const chatPayload = {
		// 		sub_id,
		// 		instance_id,
		// 		room_id: selectedRoom,
		// 		content: {
		// 			text: message
		// 		}
		// 	}
		// 	const response = await axios.post(endpoint, chatPayload)

		// 	console.log(response.data);

		// } else if (instance.id_page) {
		// 	const endpoint = process.env.FACEBOOK_ENDPOINT
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

		// 	const response = await axios.post(endpoint, chatPayload, {
		// 		params: messageParams
		// 	})

		// 	console.log(response.data);

		// 	//operation to facebook account
		// } else if (instance.id_instagram) {
		// 	const endpoint = process.env.INSTAGRAM_ENDPOINT
		// 	const chatPayload = {
		// 		to: recipient_id,
		// 		platform: 'instagram',
		// 		message,
		// 		pageAccessToken: instance.pageAccessToken
		// 	}
		// 	//operation to instagram account
		// }
		// ++++++ TINGGAL DI UNCOMENT DAN DISESUAIKAN 

		res.status(200).json({
			message: "OKEI"
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
	checkInstance
}