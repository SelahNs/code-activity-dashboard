const sessionLogRouter = require('express').Router();
const sessionLog = require('../models/sessionLog');


sessionLogRouter.get('/', async (request, response) => {
  const toSend = await sessionLog.find({})
  response.json(toSend)
}) 


sessionLogRouter.post('/', async (request, response) => {
  const body = request.body;
  if (!body) {
    return response.status(400).json({error: "empty request"}); 
  }
  if (Array.isArray(body)) {
    await sessionLog.insertMany(body);
    return response.status(201).end()
  } else {
    const session = new sessionLog(body);
    await session.save();
    return response.status(201).end();
  }
})


module.exports = sessionLogRouter