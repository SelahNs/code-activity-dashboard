const jwt = require('jsonwebtoken')
const User = require('../models/user')

const errorHandler = (error, request, response, next) => {
  const name = error.name
  if (name === 'CastError') {
    response.status(400).send({error: 'malinformed id'})
  } else if (name === 'ValidationError') {
    response.status(400).send({error: 'invalid entry'})
  } else if (name === 'MongoServerError') {
    response.status(400).send({error: 'invalid key'})
  } else {
   return next(error)
  }
}

const userExtractor = async (request, response, next) => {
  const token = request.get('authorization');
  const key = request.get('x-api-key');
  if (token && token.startsWith('Bearer')) {
    const mainToken = token.replace('Bearer ', '')
    let decodedToken = null;
    try {
      decodedToken = jwt.verify(mainToken, process.env.SECRET)
    } catch (error) {

    }
    if (decodedToken) {
      request.user = await User.findById(decodedToken.id)
    }
  } else if (key) {
    request.user = await User.findOne({ apiSecret: key})
  }

  next()
}
module.exports = {
  errorHandler,
  userExtractor
}