const githubAuthRouter = require('express').Router()
const { json } = require('express')
const User = require('../models/user')
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

githubAuthRouter.get('/callback', async (request, response) => {
  const code = request.query.code;
  const installationId = request.query.installation_id
  let access_token;
  try {
    const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      "content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: clientID,
      client_secret: clientSecret
    })
  })
    const data = await githubResponse.json()
    if (data.error) {
      throw new Error(data.error_description || 'GitHub Auth Failed.')
    }

    access_token = data.access_token
    const userResponse = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'User-Agent': 'CodeTracker-App',
        'Accept': 'application/json'
      }
    })

    const userData = await userResponse.json()
    const foundUser = await User.findOne({ "github.id": userData.id});
    
    if (request.user) {
      await User.updateOne({_id: request.user.id}, { 
        $set: {
          "github.id": userData.id,
          "github.username": userData.login
        },
        $addToSet: {
         "github.installationId": installationId
        }
    })

    } else {
      if (foundUser) {

      } else {

      }
    }

  } catch(error) {
    console.log(error)
    return response.status(500).json({ error: 'Something went wrong while connecting to GitHub. Please try again.' })
  }
})