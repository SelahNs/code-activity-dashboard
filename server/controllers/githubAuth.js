const githubAuthRouter = require('express').Router()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET
const { githubFastQueue } = require('../utils/queue')

githubAuthRouter.get('/callback', async (request, response) => {
    const code = request.query.code;
    const installationId = request.query.installation_id;

    try {
        // ================================================================
        // 1. GET ACCESS TOKEN FROM GITHUB
        // ================================================================
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
        });

        const data = await githubResponse.json();
        if (data.error) {
            throw new Error(data.error_description || data.error || 'GitHub Auth Failed.');
        }

        const access_token = data.access_token;

        // ================================================================
        // 2. GET GITHUB USER PROFILE
        // ================================================================
        const userResponse = await fetch('https://api.github.com/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'User-Agent': 'CodeDash-App',
                'Accept': 'application/json'
            }
        });

        const userData = await userResponse.json();

        // ================================================================
        // 3. CASE A — user is already logged in, just linking GitHub
        // ================================================================
        if (request.user) {
            let updateData = {
                $set: {
                    "github.id": userData.id,
                    "github.username": userData.login,
                    "github.accessToken": access_token,
                    isVerified: true
                },
                $addToSet: {}
            };

            if (installationId) {
                updateData.$addToSet['github.installationId'] = installationId;
            }

            await User.updateOne({ _id: request.user.id }, updateData);
            await githubFastQueue.add({userId: request.user.id,accessToken: access_token, githubUsername: userData.login});
            return response.redirect('http://localhost:5173/settings?status=linked');
        }

        // ================================================================
        // 4. CASE B — GitHub login/signup flow
        // ================================================================

        // Check if this GitHub account is already connected to a user
        const foundUser = await User.findOne({ "github.id": userData.id });

        if (foundUser) {
            // ---- Existing user with this GitHub account ----
            let updateData = {
                $set: {
                    "github.id": userData.id,
                    "github.username": userData.login,
                    "github.accessToken": access_token,
                    isVerified: true
                },
                $addToSet: {}
            };

            if (installationId) {
                updateData.$addToSet['github.installationId'] = installationId;
            }

            await User.updateOne({ _id: foundUser._id }, updateData);
            await githubFastQueue.add({userId: foundUser._id, accessToken: access_token, githubUsername: userData.login});

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
                isVerified: true,
                profile: {
                    fullName: foundUser.profile?.fullName || null,
                    avatarUrl: foundUser.profile?.avatarUrl || null,
                }
            }));

            return response.redirect(
                `http://localhost:5173/auth-success?access_token=${accessToken}&refresh_token=${refreshToken}&user=${userPayload}`
            );
        }

        // ---- No existing GitHub account found — check by email ----
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "User-Agent": "CodeDash-App",
                "Accept": 'application/json'
            }
        });

        const emails = await emailsResponse.json();
        const primaryEmailObj = emails.find(e => e.primary && e.verified);
        const finalEmail = primaryEmailObj ? primaryEmailObj.email : null;

        if (!finalEmail) {
            return response.redirect('http://localhost:5173/login?error=no_email');
        }

        let newUser;
        const existingUserByEmail = await User.findOne({ email: finalEmail });

        if (existingUserByEmail) {
            // ---- Email already exists — link GitHub to this account ----
            let updateData = {
                $set: {
                    "github.id": userData.id,
                    "github.username": userData.login,
                    "github.accessToken": access_token,
                    isVerified: true
                },
                $addToSet: {}
            };

            if (installationId) {
                updateData.$addToSet['github.installationId'] = installationId;
            }

            newUser = await User.findOneAndUpdate(
                { _id: existingUserByEmail._id },
                updateData,
                { new: true }
            );

        } else {
            // ---- Brand new user — create account ----
            // Sanitize username — replace hyphens with underscores
            const sanitizedLogin = userData.login.replace(/-/g, '_');
            const isUsernameTaken = await User.findOne({ username: sanitizedLogin });
            const finalUsername = isUsernameTaken
                ? sanitizedLogin + '_' + userData.id
                : sanitizedLogin;

            newUser = await User.create({
                username: finalUsername,
                email: finalEmail,
                isVerified: true,
                github: {
                    id: userData.id,
                    username: userData.login,
                    accessToken: access_token,
                    installationId: installationId ? [installationId] : []
                },
                profile: {
                    fullName: userData.name || null,
                    avatarUrl: userData.avatar_url || null,
                    bio: userData.bio || null,
                    location: userData.location || null,
                    company: userData.company || null,
                    website: userData.blog || null,
                    socials: {
                        github: userData.html_url
                    }
                }
            });
        }

        await githubFastQueue.add({userId: newUser._id, accessToken: access_token, githubUsername: userData.login});

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

    } catch (error) {
        console.error('GitHub auth error:', error);
        return response.status(500).json({
            error: 'Something went wrong while connecting to GitHub. Please try again.'
        });
    }
});

module.exports = githubAuthRouter;