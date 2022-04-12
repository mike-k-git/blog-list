const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('app returns the correct amount of blog posts', async () => {
  const blogs = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(blogs.body).toHaveLength(helper.initialBlogs.length)
})

test('a blog record identified by property named "id"', async () => {
  const blog = await helper.blogInDb()

  expect(blog.id).toBeDefined()
})

afterAll(() => mongoose.connection.close())
