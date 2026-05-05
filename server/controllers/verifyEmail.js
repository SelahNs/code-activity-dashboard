const express = require('express')
const verifyEmailRouter = express.Router();
const User = require('../models/user')
const jwt = require('jsonwebtoken')

verifyEmailRouter.post('/', async (request,response) => {
  const {token} = request.body;

  if (!token) {
    return response.status(400).json({ error: 'Verification token is required'});
  }

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    }).select('+verificationToken');

    if (!user) {
      return response.status(400).json({ error: 'Invalid or expired verification link.'})
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save()

    const accessToken = jwt.sign({id: user.id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    const refreshToken = jwt.sign({id: user.id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});

    response.status(200).json({
  meta: { access_token: accessToken, refresh_token: refreshToken },
  data: {          // add this wrapper
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
      profile: {
        fullName: user.profile?.fullName || null,
        avatarUrl: user.profile?.avatarUrl || null,
      }
    }
  }
})
  } catch (error) {
    console.error('Email verificaiton error:', error)
    return response.status(500).json( {error: 'Something went wrong. Please trye again.'})
  }
})

module.exports = verifyEmailRouter;