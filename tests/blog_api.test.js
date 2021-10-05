/* eslint-disable no-undef */
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

let token
beforeEach(async() => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ name:'root', username: 'root', passwordHash })

  await user.save()

  const userForToken = {
    username: user.username,
    id: user.id,
  }
  
  token = jwt.sign(userForToken, process.env.SECRET)
  
  await Blog.deleteMany({})
  const blogObjects = helper.initBlogs.map(blog => new Blog({...blog, user:user.id}))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there are blogs in list', () => {

  test('blog as json file', async() => {
    await api
      .get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `bearer ${token}`)
    expect(response.body).toHaveLength(helper.initBlogs.length)
  })
  
  test('a specific blog is within the returned blogs', async() => {
    const response = await api.get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
    const contents = response.body.map((blog) => blog.title)
    expect(contents).toContain('Go To Statement Considered Harmful')
  })
})

describe('specific blog added', () => {
  test('a  valid blog can be added', async() => {
    const newBlog = {
      title: 'new content for the blog',
      author: 'Gino Pino',
      url: 'http://www.test.com',
      likes: 12,
    }
    
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const response = await api.get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initBlogs.length + 1)
  
    const contents = response.body.map((blog) => blog.title)
  
    expect(contents).toContain('new content for the blog')
  
  })
  
  test('a blog with no likes can be added and likes are 0 as deafult', async() => {
    const newBlog = {
      title: 'new title',
      author: 'MIchele parri',
      url:'www.micher.com'
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-type', /application\/json/)
  
    const response = await api.get('/api/blogs')
      .set('Authorization', `bearer ${token}`)
    
    const blogAtEnd = await helper.blogsInDb()
    expect(blogAtEnd).toHaveLength(helper.initBlogs.length + 1)
  
    const likes = response.body.map(blog => blog.likes)
    expect(likes).toContain(0)
  })
  
  test('a blog without title and url is not added', async() => {
    const newBlog = {
      likes: 12,
    }
    
    await api
      .post('/api/blogs')
      .set('Authorization', `bearer ${token}`)
      .send(newBlog)
      .expect(400)
  
    const notesAtEnd = await helper.blogsInDb()
    expect(notesAtEnd).toHaveLength(helper.initBlogs.length)
  
  })
  
  test('a specific blog can be view', async() => {
    const blogAtStart = await helper.blogsInDb()
  
    const blogToView = blogAtStart[0]
    expect(blogToView.id).toBeDefined()
    const result = await api
      .get(`/api/blogs/${blogToView.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))
    console.log(processedBlogToView)
    expect(result.body).toEqual(processedBlogToView)
  })  
})

describe('when a blog can be removed', () => {
  test('a specific blog can be removed', async() => {
    const blogAtStart = await helper.blogsInDb()
    const blogToRemove = blogAtStart[0]
    await api
      .delete(`/api/blogs/${blogToRemove.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)
  
    const blogAtEnd = await helper.blogsInDb()
    expect(blogAtEnd).toHaveLength(helper.initBlogs.length - 1)
  
    const contents = blogAtEnd.map(b => b.title)
  
    expect(contents).not.toContain(blogToRemove.title)
  })  
})

describe('when update a blog', () => {
  test('a specific blog updating likes',  async() => {
    const newBlogLikes = {
      likes: 12
    }
    const blogAtStart = await helper.blogsInDb()
    const blogsToUpdate = blogAtStart[0]

    await api
      .put(`/api/blogs/${blogsToUpdate.id}`)
      .set('Authorization', `bearer ${token}`)
      .send(newBlogLikes)
      .expect(200)
      .expect('Content-type', /application\/json/)      
  })
})
/*AFTER ALL*/

afterAll(() => {
  mongoose.connection.close()
})

