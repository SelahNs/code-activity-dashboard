const forgotPasswordRouter = require('express').Router()
const User = require('../models/user')
const crypto = require('crypto')
const {sendPasswordResetEmail} = require('../utils/email')

forgotPasswordRouter.post('/', async (request, response) => {
  const {email} = request.body;

  if (!email || typeof email !== 'string') {
    return response.status(400).json({error: 'Email is required'})
  }

  try {
    const user = await User.findOne({email});

    if (!user) {
      return response.status(200).json({message: 'If that email exists, a reset link has been sent.'})
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    sendPasswordResetEmail(user.email, resetToken, user.username)
    .catch (err => console.error('Failed to send reset email:', err))

    return response.status(200).json({message: 'If that email exists, a reset link has been sent.'})

  } catch (error) {
    console.error('Forgot password error:', error);
    response.status(500).json({error: 'Something went wrong.'})
  }
})

module.exports = forgotPasswordRouter;