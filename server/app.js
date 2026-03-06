const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const activitiesRouter = require('./controllers/activities')
const sessionLogRouter = require('./controllers/sessionLog')
const userRouter = require('./controllers/user')
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

app.use('/api/activities', activitiesRouter);
app.use('/api/session-logs', sessionLogRouter)
app.use('/api/singin', userRouter)

module.exports = app