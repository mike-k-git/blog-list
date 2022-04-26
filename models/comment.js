const mongoose = require('mongoose')

const commentScheme = mongoose.Schema({
  text: {
    type: String,
    required: true,
    minLength: [10, 'must be at least 10 symbols length'],
  },
})

commentScheme.set('toJSON', {
  transform: function (document, returnedObject) {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

const Comment = mongoose.model('Comment', commentScheme)

module.exports = Comment
