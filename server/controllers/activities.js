const activitiesRouter = require('express').Router()
const Activity = require('../models/activity')

activitiesRouter.get('/', async (request, response) => {
  const activities = await Activity.find({})
  response.json(activities);
})

activitiesRouter.post('/', async (request, response) => {
  const activity = new Activity(request.body);
  if (!activity) {
    return response.status(400).json({error: "empty request"}); 
  }
  await activity.save();
  response.status(201).json(activity);
})

module.exports = activitiesRouter