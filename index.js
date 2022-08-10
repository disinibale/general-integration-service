require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const server =  app.listen(5000, () => {
    const port = server.address().port

    console.log(`App listening at http://localhost:${port}`)
})