const errorHandler = (err, req, res, next) => {
	const { type, payload } = err
	switch(type) {
		case 'NOT_FOUND': 
			res.status(404).json({ message: 'Not found'})
			break;
		case 'BAD_REQUEST': 
			// console.log(err.payload)
			// res.status(401).json({ message: `${payload.join(', ')} is required`})
			res.status(401).json({ message: `Bad Request`})
			break;
		default:
			res.status(500).json({ message: 'Internal Server Error' })
	}
}

module.exports = errorHandler