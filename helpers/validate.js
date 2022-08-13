/* Message format that needs to be fulfilled

	{
		type: STRING,
		content: STRING,
			
	}

*/

const validateFormat = (message) => {
	if (!message.hasOwnProperty('type')) {
		return false
	} else if (!message.hasOwnProperty('content')) {
		return false
	}
	return true
}

module.exports = validateFormat