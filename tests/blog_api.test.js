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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Jest 27: New Defaults for Jest, 2021 edition ⏩',
    author: 'Tim Seckinger',
    url: 'https://jestjs.io/blog/2021/05/25/jest-27',
    likes: 0,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const urls = blogsAtEnd.map((r) => r.url)
  expect(urls).toContain('https://jestjs.io/blog/2021/05/25/jest-27')
})

test('default value of the "likes" property is 0', async () => {
  const newBlogWithoutLikes = {
    title: 'Jest 27: New Defaults for Jest, 2021 edition ⏩',
    author: 'Tim Seckinger',
    url: 'https://jestjs.io/blog/2021/05/25/jest-27',
  }

  await api
    .post('/api/blogs')
    .send(newBlogWithoutLikes)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const addedBlog = blogsAtEnd.find((r) => r.url === newBlogWithoutLikes.url)
  expect(addedBlog.likes).toBe(0)
})

test('cannot save malformed blog record', async () => {
  const malformedBlog = {
    author: 'Tim Seckinger',
  }

  await api.post('/api/blogs').send(malformedBlog).expect(400)
})
afterAll(() => mongoose.connection.close())
