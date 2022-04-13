const User = require('../models/user')
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
]

const initialUsers = [
  {
    username: 'admin',
    name: 'admin',
    passwordHash: 'admin',
  },
  {
    username: 'root',
    name: 'root',
    passwordHash: 'root',
  },
]

const dbInit = async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const users = []

  for (let user of initialUsers) {
    const passwordHash = await bcrypt.hash(user.passwordHash, 10)
    const newUser = new User({
      username: user.username,
      name: user.name,
      passwordHash,
    })
    users.push(await newUser.save())
  }

  for (let blog of initialBlogs) {
    const user = users[Math.floor(Math.random() * users.length)]
    const newBlog = new Blog({ ...blog, user: user._id })
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
  }
}

const blogInDb = async () => {
  const blog = await Blog.findOne()
  return blog.toJSON()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return blogs.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    author: 1,
    url: 1,
  })
  return users.map((user) => user.toJSON())
}

const userInDb = async () => {
  const user = User.findOne()
  return user.toJSON()
}

const validUser = async () => {
  const user = await User.findOne({ username: 'admin' })
  const token = jwt.sign(
    { username: user.username, id: user._id },
    process.env.SECRET,
    { expiresIn: 60 * 60 }
  )
  return { ...user.toJSON(), token }
}

module.exports = {
  initialBlogs,
  blogInDb,
  blogsInDb,
  usersInDb,
  userInDb,
  dbInit,
  validUser,
}
