const database = require("../models")
const registeredChannels = require("./channels.json")
const { validateFormat } = require('../helpers')

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

module.exports = {
	saveMessageToDatabase
}