const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const activitiesRouter = require('./controllers/activities')
const sessionLogRouter = require('./controllers/sessionLog')
const userRouter = require('./controllers/user')
const middleware = require('./utils/middleware')
const loginRouter = require('./controllers/login')
const verifyRouter = require('./controllers/verifyextension')
const githubAuthRouter = require('./controllers/githubAuth')
const verifyEmailRouter = require('./controllers/verifyEmail')
const resendVerificationRouter = require('./controllers/resendVerification')
const refreshTokenRouter = require('./controllers/refreshToken')
const forgotPasswordRouter = require('./controllers/forgotPassword');
const resetPasswordRouter = require('./controllers/resetPassword');
const projectsRouter = require('./controllers/projects')
const webhookRouter = require('./controllers/webhook')
const usersRouter = require('./controllers/profile')
const reposRouter = require('./controllers/repos')
const commitsRouter = require('./controllers/commits')

require('dotenv').config();

const app = express();

const url = process.env.MONGODB_URI;

mongoose.connect(url).then(()=> {
  console.log('Database connected')
})
.catch(error => {
  console.log("Connection fault", error.message);
}) 


app.use(cors());
app.use(express.json());

app.use(middleware.userExtractor)
app.use('/api/activities', activitiesRouter);
app.use('/api/session-logs', sessionLogRouter)
app.use('/api/signup', userRouter)
app.use('/api/verify', verifyRouter)
app.use('/api/login', loginRouter)
app.use('/api/auth/github', githubAuthRouter)
app.use('/api/verify-email', verifyEmailRouter)
app.use('/api/resend-verification', resendVerificationRouter)
app.use('/api/token/refresh', refreshTokenRouter)
app.use('/api/forgot-password', forgotPasswordRouter);
app.use('/api/reset-password', resetPasswordRouter);
app.use('/api/projects', projectsRouter)
app.use('/api/webhook', webhookRouter)
app.use('/api/users', usersRouter)
app.use('/api/repos', reposRouter)
app.use('/api/commits', commitsRouter)
app.use(middleware.errorHandler)
module.exports = app