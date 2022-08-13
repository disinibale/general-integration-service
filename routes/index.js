const express = require('express')
const router = express.Router()
const { instanceController } = require('../controllers')

router.get('/', (req, res) => {
    res.send('Hello World!')
})

router.post('/message', instanceController.saveMessageToDatabase)


/* Define Router Here */

module.exports = router