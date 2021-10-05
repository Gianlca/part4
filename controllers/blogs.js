/* eslint-disable no-undef */
const { Router } = require('express')
const router = Router()
const Blog = require('../models/blog')

router.get('/', async(request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

router.post('/', async (request, response) => {
  const body = request.body

  const user = request.user

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })
  const blogSave = await blog.save()
  user.blogs = user.blogs.concat(blogSave._id)
  await user.save()
  response.json(blogSave)
})

router.get('/:id', async(request, response) => {
  const blog = await Blog.findById(request.params.id)
  if(blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

router.delete('/:id', async(request, response) => {

  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if(blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } else {
    response.status(401).json({ error: 'invalid user' })
  }
})

router.put('/:id', async(request, response) => {
  const body = request.body

  const blog = {
    likes: body.likes
  }

  const blogUpdated = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(blogUpdated)

})

module.exports = router