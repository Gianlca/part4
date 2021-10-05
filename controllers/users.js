const {Router} = require('express')
const bcrypt = require('bcrypt')
const router = Router()
const User = require('../models/user')

router.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

router.post('/', async(request, response) => {
  const body = request.body
  console.log('body', body.passwordHash.length)
  if(body.passwordHash.length < 3) {
    return response.status(400).json({error: 'The password must contain at least three character'})
  }
  const saltRouds = 10
  const passwordHash = await bcrypt.hash(body.passwordHash, saltRouds)

  const user = new User({
    name: body.name,
    username: body.username,
    passwordHash
  })
  const savedUser = await user.save()
  response.json(savedUser)
})

module.exports = router