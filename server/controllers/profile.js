const usersRouter = require('express').Router()
const User = require('../models/user')
const Repo = require('../models/repo')

const ALLOWED_PROFILE_FIELDS = [
    'fullName', 'bio', 'location', 'company',
    'website', 'isHireable', 'avatarUrl', 'avatarPresetId',
    'socials.github', 'socials.linkedin', 'socials.twitter'
]

// ================================================================
// GET /api/users/me
// ================================================================
usersRouter.get('/me', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const [fullUser, repos] = await Promise.all([
            User.findById(user.id),
            Repo.find({ user: user.id }, { languages: 1 })
        ])
        if (!fullUser) return response.status(404).json({ error: 'user not found' })

        // Aggregate GitHub bytes across all repos per language
        const githubLanguages = {}
        for (const repo of repos) {
            const langMap = repo.languages instanceof Map
                ? Object.fromEntries(repo.languages)
                : (repo.languages || {})
            for (const [lang, bytes] of Object.entries(langMap)) {
                githubLanguages[lang] = (githubLanguages[lang] || 0) + bytes
            }
        }

        const userJson = fullUser.toJSON()
        if (!userJson.skills) userJson.skills = {}
        userJson.skills.githubLanguages = githubLanguages

        return response.status(200).json(userJson)
    } catch (error) {
        console.error('GET /users/me error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

// ================================================================
// PUT /api/users/me
// ================================================================
usersRouter.put('/me', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const body = request.body
        const updateFields = {}
        const newManuallyEdited = []

        for (const field of ALLOWED_PROFILE_FIELDS) {
            const isSocial = field.startsWith('socials.')
            const key = isSocial ? field.split('.')[1] : field
            const value = isSocial ? body.socials?.[key] : body[field]

            if (value !== undefined) {
                updateFields[isSocial ? `profile.${field}` : `profile.${field}`] = value
                const trackKey = isSocial ? field : field
                if (!newManuallyEdited.includes(trackKey)) {
                    newManuallyEdited.push(trackKey)
                }
            }
        }

        if (Object.keys(updateFields).length === 0) {
            return response.status(400).json({ error: 'no valid fields provided' })
        }

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            {
                $set: updateFields,
                $addToSet: { manuallyEdited: { $each: newManuallyEdited } }
            },
            { new: true }
        )

        return response.status(200).json(updatedUser)
    } catch (error) {
        console.error('PUT /users/me error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

module.exports = usersRouter