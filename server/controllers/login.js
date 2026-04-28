const User = require('../models/user')
loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (request, response) => {
  console.log('Incoming Request Body:',  request.body)
  const {username, email, password} = request.body;
  
  const user = await User.findOne({
    $or: [ {username: username}, {email, email }]
  }).select('+passwordHash');

  const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
  if (!(user && passwordCorrect)){
    return response.status(401).send({error: 'Invalid username and/or password'})
  }
  const payload = { username: user.username, id: user.id}
  const token = jwt.sign(payload, process.env.SECRET, {expiresIn: 60*60*24})
  return response.status(200).send({username: user.username, name: user.profile.fullName , token})
})

module.exports = loginRouter