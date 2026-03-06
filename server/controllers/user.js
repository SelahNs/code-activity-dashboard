const userRouter = require('express').Router();
const User = require('../models/user')
const bcrypt = require('bcrypt') 
const crypto = require('crypto')

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
  const existingUser = await User.findOne({ $or: [ { username }, { email } ] })
  
  if (existingUser) {
    if (existingUser.username === username){
      return response.status(400).send({error: 'Username already exists'})
    } else {
       return response.status(400).send({error: 'email already exists'})
    }
  }

  const saltrounds = 10;
  const passwordHash = await bcrypt.hash(password, saltrounds)

  const apiSecret = crypto.randomBytes(32).toString('hex')
  const verificationToken = crypto.randomBytes(32).toString('hex')

  const tokenExpiry = new Date (Date.now() + (24 * 60 * 60 * 1000))

  const user = new User ({
    username,
    email,
    passwordHash,
    apiSecret,
    verificationToken,
    verificationTokenExpires: tokenExpiry,
    profile: {fullName: username}
  })

  const savedUser = await user.save()

  response.status(201).send(savedUser)
})

module.exports = userRouter