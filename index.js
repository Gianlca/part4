const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const blogsController = require('./controllers/Blog')
const mongoose = require('mongoose')

mongoose.connect(config.MONGODB_URI)

app.use(cors())
app.use(express.json())
app.use('/api/blogs', blogsController)
const PORT = config.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})