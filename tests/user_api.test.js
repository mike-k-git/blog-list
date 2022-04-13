const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
//const helper = require('./test_helper')

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('secret', 10)
  const user = new User({ username: 'root', name: 'root', passwordHash })

  await user.save()
})

describe('when there is initially one user in db', () => {
  test('returned list contains only this user', async () => {
    const result = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toHaveLength(1)
    expect(result.body).toMatchObject([{ username: 'root', name: 'root' }])
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
