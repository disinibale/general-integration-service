const errorHandler = (err, req, res, next) => {
	const { type, payload } = err
	switch(type) {
		case 'NOT_FOUND': 
			res.status(404).json({ message: 'Not found'})
			break;
		case 'BAD_REQUEST': 
			res.status(401).json({ message: `${err.payload} is required`})
			break;
		default:
			res.status(500).json({ message: 'Internal Server Error' })
	}
}

module.exports = errorHandler