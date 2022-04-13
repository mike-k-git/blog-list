const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')
//const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({ username: 'root', name: 'root', passwordHash })

    await user.save()
  })

  test('returned list contains only this user', async () => {
    const result = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toHaveLength(1)
    expect(result.body).toMatchObject([{ username: 'root', name: 'root' }])
  })
})

afterAll(() => mongoose.connection.close())
