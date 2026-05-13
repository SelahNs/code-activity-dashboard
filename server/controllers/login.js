const User = require('../models/user')
loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const validator= require('validator')
const {githubFastQueue} = require('../utils/queue')

loginRouter.post('/', async (request, response) => {
  console.log('Incoming Request Body:',  request.body)
  const {username, email, password} = request.body;

  if (!password || (!email && !username)) {
    return response.status(400).json({
      error: 'Please provide email or username and password'
    })
  }

  if (
    (username && typeof username !== 'string') ||
    (email && typeof email !== 'string') ||
    (typeof password !== 'string')
  ) {
    return response.status(400).json({ error: 'Invalid input format'});
  }

  
  

  try {
    const user = await User.findOne({
      $or: [ ...(username ? [{ username }]: []), ...(email? [{email: validator.normalizeEmail(email)}] : [] )]
    }).select('+passwordHash +github.accessToken');

    const passwordCorrect = user === null ? false : await bcrypt.compare(password, user.passwordHash)
    if (!(user && passwordCorrect)){
      return response.status(401).send({error: 'Invalid credentials'})
    }
    if (user.github?.accessToken) {
    await githubFastQueue.add({
        userId: user._id,
        accessToken: user.github.accessToken,
        githubUsername: user.github.username
    })
    }
    const accessToken = jwt.sign(
  { id: user.id },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: '1h' }
);

const refreshToken = jwt.sign(
  { id: user.id },   // ← id only
  process.env.REFRESH_TOKEN_SECRET,
  { expiresIn: '7d' }
);

    return response.status(200).send({
      meta: {
        access_token: accessToken,
        refresh_token: refreshToken
      },
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          profile: {
            fullName: user.profile?.fullName || null,
            avatarUrl: user.profile?.avatarUrl || user.profile?.avatarId || null
          }
        }
      }
    })
  } catch (error) {
    console.log('Login error:', error);
    response.status(500).json({error: 'Something went wrong. Please try again'})
  }
  
})

module.exports = loginRouter