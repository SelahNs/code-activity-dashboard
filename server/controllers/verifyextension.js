const verifyRouter = require('express').Router()

verifyRouter.get('/', async (request, response) => {
  if(request.user) {
    response.status(200).send();
  } else {
    response.status(401).send({error: 'Invalid or expired key'})
  }
})

module.exports = verifyRouter;