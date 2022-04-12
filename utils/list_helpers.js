const _ = require('lodash')

const dummy = (blogs) => {
  blogs
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0
  blogs.forEach((b) => (sum += b.likes))

  return sum
}

const favoriteBlog = (blogs) => {
  blogs = blogs.sort((a, b) => b.likes - a.likes)
  delete blogs[0]._id
  delete blogs[0].__v
  delete blogs[0].url
  return blogs[0]
}

const mostBlogs = (blogs) => {
  return _.maxBy(
    _.map(_.countBy(blogs, 'author'), (key, value) => ({
      author: value,
      blogs: key,
    })),
    'blogs'
  )
}

const mostLikes = (blogs) => {
  return _.maxBy(
    _.map(_.groupBy(blogs, 'author'), (key, value) => ({
      author: value,
      likes: _.sumBy(key, 'likes'),
    })),
    'likes'
  )
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}
