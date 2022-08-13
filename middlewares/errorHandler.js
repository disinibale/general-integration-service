const errorHandler = (err, req, res, next) => {
	console.log("=======================================")
	console.log(err)
	console.log("=======================================")
	const { type, payload } = err
	switch (type) {
		case 'NOT_FOUND':
			res.status(404).json({ message: 'Not found' })
			break;
		case 'BAD_REQUEST':
			if (err.payload === 'channel') {
				res.status(400).json({ message: 'Channel is incorrect or not registered' })
			} else if (err.payload === 'message') {
				res.status(400).json({ message: 'Message format is incorrect' })
			} else if (err.payload === 'type') {
				res.status(400).json({ message: "type must be 'SEND' or 'RECEIVE'" })
			} else {
				res.status(400).json({ message: `${err.payload} is required` })
			}
			break;
		case 'NOT_AUTHORIZED':
			res.status(401).json({ message: 'User is not registered in marketa'})
			break;
		default:
			res.status(500).json({ message: 'Internal Server Error' })
	}
}

module.exports = errorHandler