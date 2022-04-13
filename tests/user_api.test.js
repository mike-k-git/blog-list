const mongoose = require('mongoose')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')

beforeEach(async () => {
  await helper.dbInit()
})

describe('when the database is in initial state', () => {
  test('returns an array of initial users', async () => {
    const usersAtStart = await helper.usersInDb()
    const result = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toHaveLength(usersAtStart.length)
    expect(result.body).toEqual(usersAtStart)
  })
})

describe('adding a new user returns an appropriate response status and error message', () => {
  test('with invalid password', async () => {
    const invalidUser = {
      username: 'test',
      name: 'root',
      password: '12',
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400, { password: 'must be at least 3 symbol length' })
  })

  test('with invalid username', async () => {
    const invalidUser = {
      username: '12',
      name: 'rot',
      password: '1234567890',
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400, { username: 'must be at least 3 symbol length' })
  })

  test('with taken username', async () => {
    const invalidUser = {
      username: 'root',
      name: 'root',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(invalidUser)
      .expect(400, { username: 'already taken' })
  })
})

describe('adding a new blog', () => {
  test('by an anonymous user returns 401 status code', async () => {
    const blog = { title: 'title', url: 'url', author: 'author' }
    await api.post('/api/blogs').send(blog).expect(401)
  })

  test('by an authorized user returns a new blog', async () => {
    const blog = { title: 'title', url: 'url', author: 'author' }
    const token = await helper.validToken()

    const result = await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(blog)
      .expect(201)

    const expectedKeys = ['title', 'author', 'url', 'likes', 'user', 'id']
    expect(Object.keys(result.body)).toEqual(
      expect.arrayContaining(expectedKeys)
    )
  })
})

afterAll(async () => mongoose.connection.close())
