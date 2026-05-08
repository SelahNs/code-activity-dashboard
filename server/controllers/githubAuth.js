const githubAuthRouter = require('express').Router()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET

githubAuthRouter.get('/callback', async (request, response) => {
  console.log('clientSecret:', clientSecret)
  console.log('cleintId:', clientID)
  const code = request.query.code;
  const installationId = request.query.installation_id
  let access_token;
  try {
    const githubResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      code,
      client_id: clientID,
      client_secret: clientSecret
    })
  })
    const data = await githubResponse.json()
    console.log(data)
    if (data.error) {
      throw new Error(data.error_description || data.error || 'GitHub Auth Failed.')
    }

    access_token = data.access_token
    // right after you get access_token from GitHub
    await User.findByIdAndUpdate(foundUser._id, {
        $set: { 'github.accessToken': access_token }
    });
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
      //const thisUser = await User.findOne({_id: request.user.id})
      let updateData ={ $set: {
        "github.id": userData.id,
        "github.username": userData.login,
        isVerified: true    
      },
        $addToSet: {}
      }
      if (installationId) {
        updateData.$addToSet['github.installationId'] = installationId;
      }
      await User.updateOne({_id: request.user.id}, updateData)
      return response.redirect('http://localhost:5173/settings?status=linked')
      } else {
      if (foundUser) {
        let updateData = { 
          $set: {
            "github.id": userData.id,
            "github.username": userData.login,
            isVerified: true
          },
          $addToSet: {}
        }
        if (installationId) {
        updateData.$addToSet['github.installationId'] = installationId;
        }
        await User.updateOne({_id: foundUser._id}, updateData)
      // ✅ new way — two tokens, right secrets
const accessToken = jwt.sign(
    { id: foundUser._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
);

const refreshToken = jwt.sign(
    { id: foundUser._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
);
const userPayload = encodeURIComponent(JSON.stringify({
    id: foundUser._id,
    username: foundUser.username,
    email: foundUser.email,
    isVerified: foundUser.isVerified,
    profile: {
        fullName: foundUser.profile?.fullName || null,
        avatarUrl: foundUser.profile?.avatarUrl || null,
    }
}));

return response.redirect(
    `http://localhost:5173/auth-success?access_token=${accessToken}&refresh_token=${refreshToken}&user=${userPayload}`
);
      } else {
        const res = await fetch('https://api.github.com/user/emails', {
          method: 'GET',
          headers: {
            "Authorization": `Bearer ${access_token}`,
            "User-Agent": `CodeTracker-App`,
            "Accept": 'application/json'
          }
        })
        const emails = await res.json();
        console.log('emials:', emails)
        const primaryEmailObj = emails.find(e => e.primary && e.verified)
        const finalEmail = primaryEmailObj ? primaryEmailObj.email : null;
        let user = null;
        if (!finalEmail) {
          return response.redirect('http://localhost:5173/login?error=no_email');
        }

        user = await User.findOne({email: finalEmail})

        let newUser;
        if(user) {
          let updateData = { 
            $set: {
              "github.id": userData.id,
              "github.username": userData.login,
              isVerified: true
            },
            $addToSet: {}
          }
          if (installationId) {
            updateData.$addToSet['github.installationId'] = installationId;
          }
          newUser = await User.findOneAndUpdate({_id: user.id}, updateData, {new: true})
        } else {
          const isUsernameTaken = await User.findOne({ username: userData.login})
          let finalUsername;
          if (isUsernameTaken) {
            finalUsername = userData.login + '_' + userData.id;
          } else {
            finalUsername = userData.login;
          }
          newUser = await User.create({
            username: finalUsername, 
            email: finalEmail,
            isVerified: true,   
            github: {
              id: userData.id,
              username: userData.login,
              installationId: installationId ? [installationId] : []
            },
            profile: {
              fullName: userData.name,
              avatarUrl: userData.avatar_url,
              bio: userData.bio,
              location: userData.location,
              company: userData.company,
              website: userData.blog,
              socials: {
                github: userData.html_url
              }
            }
          })

        }
    const accessToken = jwt.sign(
        { id: newUser._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
        { id: newUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );

    const userPayload = encodeURIComponent(JSON.stringify({
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    isVerified: newUser.isVerified,
    profile: {
        fullName: newUser.profile?.fullName || null,
        avatarUrl: newUser.profile?.avatarUrl || null,
    }
}));

return response.redirect(
    `http://localhost:5173/auth-success?access_token=${accessToken}&refresh_token=${refreshToken}&user=${userPayload}`
);
    }
    }

  } catch(error) {
    console.log(error)
    return response.status(500).json({ error: 'Something went wrong while connecting to GitHub. Please try again.' })
  }
})


module.exports = githubAuthRouter