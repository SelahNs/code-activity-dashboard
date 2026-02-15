const sessionLogRouter = require('express').Router();
const sessionLog = require('../models/sessionLog');


sessionLogRouter.get('/', (request, response) => {
  response.json({alldatas: sessionLog})
}) 


sessionLogRouter.post('/', async (request, response) => {
  const activity = new Activity(request.body);
  if (!activity) {
    return response.status(400).json({error: "empty request"}); 
  }
  await activity.save();
  response.status(201).json(activity);
})


module.export = sessionLogRouter