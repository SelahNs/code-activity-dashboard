const usersRouter = require('express').Router()
const User = require('../models/user')
const Repo = require('../models/repo')

const ALLOWED_PROFILE_FIELDS = [
    'fullName', 'bio', 'location', 'company',
    'website', 'isHireable', 'avatarUrl', 'avatarPresetId',
    'socials.github', 'socials.linkedin', 'socials.twitter'
]

usersRouter.get('/me', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const [fullUser, repos] = await Promise.all([
            User.findById(user.id),
            Repo.find({ user: user.id }, { languages: 1, frameworks: 1 })
        ])
        if (!fullUser) return response.status(404).json({ error: 'user not found' })

        // Aggregate GitHub bytes per language across all repos
        const githubLanguages = {}
        for (const repo of repos) {
            const langMap = repo.languages instanceof Map
                ? Object.fromEntries(repo.languages)
                : (repo.languages || {})
            for (const [lang, bytes] of Object.entries(langMap)) {
                githubLanguages[lang] = (githubLanguages[lang] || 0) + bytes
            }
        }

        // Aggregate framework repo counts across all repos
        const githubFrameworks = {}
        for (const repo of repos) {
            const fwMap = repo.frameworks instanceof Map
                ? Object.fromEntries(repo.frameworks)
                : (repo.frameworks || {})
            for (const [fw, count] of Object.entries(fwMap)) {
                githubFrameworks[fw] = (githubFrameworks[fw] || 0) + count
            }
        }

        // userJson must be declared BEFORE we attach things to it
        const userJson = fullUser.toJSON()
        if (!userJson.skills) userJson.skills = {}
        userJson.skills.githubLanguages = githubLanguages
        userJson.skills.githubFrameworks = githubFrameworks
        // skills.languages (extension seconds) and skills.frameworksTime
        // already come from the DB via fullUser.toJSON()

        return response.status(200).json(userJson)
    } catch (error) {
        console.error('GET /users/me error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

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
                updateFields[`profile.${field}`] = value  // fixed — both cases identical
                if (!newManuallyEdited.includes(field)) {
                    newManuallyEdited.push(field)
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