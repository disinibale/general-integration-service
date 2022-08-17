const express = require('express')
const router = express.Router()
const { instanceController } = require('../controllers')
const fs = require('fs')
const Showdown = require('showdown');

router.get('/', (req, res) => {
    res.send('Hello World!')
})

router.get('/docs', (req, res) => {
    const markdownContent = fs.readFileSync('./docs.md', 'utf-8', (err, data) => {
        console.log(markdownContent)
    })
    const converter = new Showdown.Converter()
    res.send(converter.makeHtml(markdownContent))
})

router.post('/message', instanceController.saveMessageToDatabase)

router.post('/check-instances', instanceController.checkInstance);

/* Define Router Here */

module.exports = router