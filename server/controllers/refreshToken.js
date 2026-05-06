const refreshTokenRouter = require('express').Router()
const jwt = require('jsonwebtoken')

refreshTokenRouter.post('/', (request, response) => {
  const { refresh } = request.body;

  if (!refresh) {
    return response.status(400).json({ error: 'Refresh token required'})
  }

  try {
    const decoded = jwt.verify(refresh, process.env.REFRESH_TOKEN_SECRET)

    const newAccessToken = jwt.sign(
      {id: decoded.id},
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '1h'}
    )

    return response.status(200).json({ access: newAccessToken })
  } catch (error) {
    return response.status(401).json({ error: 'Invalid or expired token'})
  }


})

module.exports = refreshTokenRouter