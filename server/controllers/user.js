const userRouter = require('express').Router();
const User = require('../models/user')
const bcrypt = require('bcrypt') 

userRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body) {
    return response.status(400).send({error: 'bad request'})
  }
  const {username, email, password} = body;
  if (!(username && email && password)) {
    return response.status(400).send({error: 'bad request'})
  }
  if (password.length < 8) {
    return response.status(400).send({error: "invalid password"})
  }

  const saltrounds = 10;
  const passwordHash = await bcrypt.hash(password, saltrounds)

})

module.exports = userRouter