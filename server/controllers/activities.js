const activitiesRouter = require('express').Router()
const Activity = require('../models/activity')

activitiesRouter.get('/', async (request, response) => {
  const activities = await Activity.find({})
  response.json(activities);
})

module.exports = activitiesRouter