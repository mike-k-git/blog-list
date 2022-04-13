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

afterAll(async () => mongoose.connection.close())
