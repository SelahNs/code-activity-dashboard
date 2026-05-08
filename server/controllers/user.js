const userRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email')
const jwt = require('jsonwebtoken');

userRouter.post('/', async (request, response) => {
  const body = request.body;

  if (!body) {
    return response.status(400).json({ error: 'Bad request' });
  }

  const { fullname, username, email, password } = body;

  // Check required fields exist
  if (!username || !email || !password) {
    return response.status(400).json({ error: 'Username, email and password are required' });
  }

  // NoSQL injection protection
  if (
    typeof username !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    (fullname && typeof fullname !== 'string')
  ) {
    return response.status(400).json({ error: 'Invalid input format' });
  }

  // Validate
  const errors = {};

  if (!validator.isEmail(email)) {
    errors.email = ['Please provide a valid email address'];
  }
  if (!validator.isLength(username, { min: 3, max: 20 })) {
    errors.username = ['Username must be between 3 and 20 characters'];
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.username = ['Username can only contain letters, numbers, underscores and hyphens'];
  }
  if (password.length < 8) {
    errors.password = ['Password must be at least 8 characters'];
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({ errors });
  }

  try {
    // Check duplicates
    const existingUser = await User.findOne({
      $or: [{ username }, { email: validator.normalizeEmail(email) }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return response.status(400).json({
          errors: { username: ['Username already taken'] }
        });
      }
      return response.status(400).json({
        errors: { email: ['Email already registered'] }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate tokens
    const apiSecret = crypto.randomBytes(32).toString('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user
    const user = new User({
      username,
      email: validator.normalizeEmail(email),
      passwordHash,
      apiSecret,
      verificationToken,
      verificationTokenExpires,
      profile: {
        fullName: fullname || null
      }
    });

    await user.save();

    sendVerificationEmail(user.email, verificationToken, username)
      .catch(error => {
        console.error('Failed to send verification email:', error);
      });

    // Generate tokens exactly like login does
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    response.status(201).json({
      meta: {
        access_token: accessToken,
        refresh_token: refreshToken,
      },
      data: {
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
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return response.status(400).json({
        errors: { [field]: [`This ${field} is already taken`] }
      });
    }
    console.error('Signup error:', error);
    response.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = userRouter;