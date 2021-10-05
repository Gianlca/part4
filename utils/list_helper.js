const _ = require('lodash')

const dummy = (blogs) => {
  if(blogs) return 1
}

const totalLikes  = (blogs) => {
  let likes = 0
  if(blogs.length === 1) likes = blogs[0].likes
  if(blogs.length > 1) blogs.reduce((prev, curr) => likes = prev + curr.likes, 0)
  return likes
}

const favoriteBlog = (blogs) => {
  const blog = blogs
    .reduce((prev, curr) => {
      return prev.likes < curr.likes ? curr : prev
    })
  return blog
}

const mostBlogs = (blogs) => {
  let authorWithMostBlog = {}
  const authors =  _.countBy(blogs, 'author')
  for(const [key, value] of Object.entries(authors)) {
    authorWithMostBlog = {
      author:key,
      blogs: value
    }
  }
  return authorWithMostBlog
}

const mostLikes = (blogs) => {
  let authorWithMostLikes = []
  const authors =  _.groupBy(blogs, 'author')
  for(const [key, value] of Object.entries(authors)) {
    const sumsOflikes = value.reduce((prev, curr) => prev + curr.likes, 0)
    const AuthorPerLikes = {
      author: key,
      likes: sumsOflikes
    }
    authorWithMostLikes.push(AuthorPerLikes)
  }
  authorWithMostLikes = _.maxBy(authorWithMostLikes, 'likes')
  return authorWithMostLikes
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }