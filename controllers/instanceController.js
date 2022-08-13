const database = require("../models")

const saveMessageToDatabase = async (req, res, next) => {
	try {
		const { sub_id, instance_id, room_id, content, recipient_id } = req.body

		if (!sub_id) throw { type: 'BAD_REQUEST', payload: 'sub_id' }
		if (!instance_id) throw { type: 'BAD_REQUEST', payload: 'instance_id' }
		if (!room_id) throw { type: 'BAD_REQUEST', payload: 'room_id' }
		if (!recipient_id) throw { type: 'BAD_REQUEST', payload: 'recipient_id' }

		if (content.type === 'send') {
			// insert send operation here
		}

		if (content.type === 'receive') {
			// insert receive operation here
		}

		res.status(200).json({ message: 'ok' })
	} catch (err) {
		next(err)
	}
}

module.exports = {
	saveMessageToDatabase
}