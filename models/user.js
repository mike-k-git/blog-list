const mongoose = require('mongoose')

const userScheme = mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: [3, 'must be at least 3 symbol length'],
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
})

userScheme.set('toJSON', {
  transform: function (document, returnedObject) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  },
})

const User = mongoose.model('User', userScheme)

module.exports = User
