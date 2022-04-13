const logger = require('./logger')

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    let errors = {}

    Object.keys(error.errors).forEach(
      (key) => (errors[key] = error.errors[key].message)
    )
    return response.status(400).send(errors)
  }

  next(error)
}

module.exports = {
  unknownEndpoint,
  errorHandler,
}
