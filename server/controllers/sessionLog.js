const sessionLogRouter = require('express').Router();
const sessionLog = require('../models/sessionLog');


sessionLogRouter.get('/', (request, response) => {
  response.json({alldatas: sessionLog})
}) 


sessionLogRouter.get('//')