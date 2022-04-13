const mongoose = require('mongoose')

const userScheme = mongoose.Schema({
  username: String,
  name: String,
  password: String,
})

userScheme.set('toJSON', {
  transform: function (document, returnedObject) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.password
  },
})

const User = mongoose.model('User', userScheme)

module.exports = User
