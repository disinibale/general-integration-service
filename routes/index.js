const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.send('Hello World!')
})

/* Define Router Here */

module.exports = router