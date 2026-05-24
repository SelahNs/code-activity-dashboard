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

        const githubLanguages = {}
        for (const repo of repos) {
            const langMap = repo.languages instanceof Map
                ? Object.fromEntries(repo.languages)
                : (repo.languages || {})
            for (const [lang, bytes] of Object.entries(langMap)) {
                githubLanguages[lang] = (githubLanguages[lang] || 0) + bytes
            }
        }

        const githubFrameworks = {}
        for (const repo of repos) {
            const fwMap = repo.frameworks instanceof Map
                ? Object.fromEntries(repo.frameworks)
                : (repo.frameworks || {})
            for (const [fw, count] of Object.entries(fwMap)) {
                githubFrameworks[fw] = (githubFrameworks[fw] || 0) + count
            }
        }

        const userJson = fullUser.toJSON()
        if (!userJson.skills) userJson.skills = {}
        userJson.skills.githubLanguages = githubLanguages
        userJson.skills.githubFrameworks = githubFrameworks
        
        return response.status(200).json(userJson)
    } catch (error) {
        console.error('GET /users/me error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

usersRouter.post('/me/password', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const { currentPassword, newPassword } = request.body
    if (!currentPassword || !newPassword) {
        return response.status(400).json({ error: 'currentPassword and newPassword are required' })
    }
    if (newPassword.length < 8) {
        return response.status(400).json({ error: 'Password must be at least 8 characters' })
    }

    try {
        const bcrypt = require('bcrypt')
        const fullUser = await User.findById(user._id).select('+passwordHash')
        if (!fullUser.passwordHash) {
            return response.status(400).json({ error: 'GitHub-only accounts cannot change password this way' })
        }
        const valid = await bcrypt.compare(currentPassword, fullUser.passwordHash)
        if (!valid) {
            return response.status(400).json({ error: 'Current password is incorrect' })
        }
        const newHash = await bcrypt.hash(newPassword, 10)
        await User.findByIdAndUpdate(user._id, { $set: { passwordHash: newHash } })
        return response.status(200).json({ message: 'Password changed successfully' })
    } catch (error) {
        console.error('Change password error:', error)
        return response.status(500).json({ error: 'Something went wrong.' })
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
                updateFields[`profile.${field}`] = value  
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