const blogsRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const user = await User.findById(request.user._id)

  const blog = new Blog(request.body)
  blog.user = user._id

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }
  const comment = new Comment(request.body)
  const savedComment = await comment.save()
  blog.comments = blog.comments.concat(savedComment)
  const savedBlog = await blog.save()

  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const isOwner = request.user.blogs.find(
    (id) => id.toString() === request.params.id
  )

  if (!isOwner) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  await Blog.findByIdAndDelete(request.params.id)

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true }
  )
  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
