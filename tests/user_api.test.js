const mongoose = require('mongoose')
const supertest= require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const User = require('../models/user')
const api = supertest(app)
const helper = require('./test_helper')

beforeEach(async() => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ name:'root', username: 'root', passwordHash })

  await user.save()
})

describe('when create a new user', () => {
  test('create a user', async() => {
    const usersAtStart = await helper.usersInDb()

    const newUser1 = {
      name: 'Gino Pino3',
      username: 'GinoPino3',
      passwordHash: 'sekretsaaa111',
    }

    await api
      .post('/api/users')
      .send(newUser1)
      .expect(200)
      .expect('Content-type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser1.username)      
  })

  test('create a user with the same username expect error', async() => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Gino Pino',
      username: 'root',
      passwordHash: 'sekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  
  })  

  test('create a user with the username with no 3 characters', async() => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Gi',
      username: 'Gi',
      passwordHash: 'sekret',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('User validation failed: username: Path `username` (`Gi`) is shorter than the minimum allowed length (3).')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  
  })    

  test('create a user with the password with no 3 characters', async() => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'Gino',
      username: 'Gino',
      passwordHash: 'se',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body.error).toContain('The password must contain at least three character')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  
  })    

})

afterAll(() => {
  mongoose.connection.close()
})
