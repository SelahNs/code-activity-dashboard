const resendVerificationRouter = require('express').Router()
const User = require('../models/user');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

resendVerificationRouter.post('/', async (request, response) => {
  const {email} = request.body;

  if (!email || typeof email !== 'string') {
    return response.status(400).json({error: 'Email is requier'})
  }

  try {
    const user = await User.findOne({email})

    if (!user || user.isverified) {
      return response.status(200).json({message: 'If that email exists, a new link has been send.'})
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    sendVerificationEmail(user.email, verificationToken, user.username)
    .catch (err => console.error('Failed to resend verification email:', err))

    return response.status(200).json({message: 'If that email exits, a new link has been sent.'})
  } catch (error) {
    console.error('Resend verification error', error)
    response.status(500).json({ error: 'Something went wrong. Please try again.'})
  }
})

module.exports = resendVerificationRouter;