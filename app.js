/* eslint-disable no-undef */
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const loginController = require('./controllers/login')
const blogsController = require('./controllers/blogs')
const usersController = require('./controllers/users')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)  
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/login', loginController)
app.use('/api/users', usersController)
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}
app.use(middleware.tokenExtractor)
app.use('/api/blogs', middleware.userExtractor, blogsController)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)
module.exports = app