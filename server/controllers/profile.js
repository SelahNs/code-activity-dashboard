const usersRouter = require('express').Router()
const User = require('../models/user')

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
        const fullUser = await User.findById(user.id)
        if (!fullUser) return response.status(404).json({ error: 'user not found' })

        return response.status(200).json(fullUser)
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