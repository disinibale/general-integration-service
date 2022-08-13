const cfg = require('../config/database.config')
const Sequelize = require('sequelize')
const sequelize = new Sequelize(cfg.DB, cfg.USER, cfg.PASSWORD, {
  host: cfg.HOST,
  port: cfg.PORT,
  dialect: cfg.dialect,
  operatorAliases: false,
  pool: cfg.pool
})

const database = {}
database.Sequelize = Sequelize
database.sequelize = sequelize
database.users_subscriptions = require('./user_subscriptions.models')(sequelize, Sequelize)


module.exports = database