const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await helper.dbInit()
})

describe('when there is initially some blog posts saved', () => {
  test('posts are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all posts are returned', async () => {
    const blogs = await api.get('/api/blogs')
    expect(blogs.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a blog record identified by property named "id"', async () => {
    const blog = await helper.blogInDb()
    expect(blog.id).toBeDefined()
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = {
      title: 'Jest 27: New Defaults for Jest, 2021 edition ⏩',
      author: 'Tim Seckinger',
      url: 'https://jestjs.io/blog/2021/05/25/jest-27',
      likes: 0,
    }

    const validUser = await helper.validUser()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${validUser.token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const urls = blogsAtEnd.map((r) => r.url)
    expect(urls).toContain('https://jestjs.io/blog/2021/05/25/jest-27')
  })

  test('fails with status code 400 if data invalid', async () => {
    const newBlog = {
      author: 'Tim Seckinger',
    }

    const validUser = await helper.validUser()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${validUser.token}`)
      .send(newBlog)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('uses the appropriate default value for likes', async () => {
    const newBlogWithoutLikes = {
      title: 'Jest 27: New Defaults for Jest, 2021 edition ⏩',
      author: 'Tim Seckinger',
      url: 'https://jestjs.io/blog/2021/05/25/jest-27',
    }

    const validUser = await helper.validUser()

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${validUser.token}`)
      .send(newBlogWithoutLikes)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const addedBlog = blogsAtEnd.find((r) => r.url === newBlogWithoutLikes.url)
    expect(addedBlog.likes).toBe(0)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const validUser = await helper.validUser()

    const blogToDelete = blogsAtStart.find(
      (blog) => blog.user.id === validUser.id
    )

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${validUser.token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

    const urls = blogsAtEnd.map((r) => r.url)

    expect(urls).not.toContain(blogToDelete.url)
  })

  test('failed with status code 401 if the operation is not authorized', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToDelete = blogsAtStart[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const urls = blogsAtEnd.map((r) => r.url)
    expect(urls).toContain(blogToDelete.url)
  })
})

describe('update a blog', () => {
  test('succeeds with status code 200 and returns the updated blog', async () => {
    const blog = await helper.blogInDb()
    const newBlog = { ...blog, likes: blog.likes + 1 }
    delete newBlog.id

    const response = await api
      .put(`/api/blogs/${blog.id}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(blog.id).toBe(response.body.id)
    expect(newBlog.likes).toBe(response.body.likes)
  })
})

afterAll(() => mongoose.connection.close())
