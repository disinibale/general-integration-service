require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const router = require('./routes')
const { errorHandler } = require('./middlewares')

const app = express()

app.use(cors({ origin: '*' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(router)

app.use(errorHandler)

const { PORT } = process.env

const server = app.listen(PORT, () => {
    const LogStatus = { 'status': 'running', 'host': server.address().address, 'port': server.address().port, env: process.env.NODE_ENV }
    console.table({ LogStatus })
})