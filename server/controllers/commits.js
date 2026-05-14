const commitsRouter = require('express').Router()
const Commit = require('../models/commit')

commitsRouter.get('/', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const limit = parseInt(request.query.limit) || 20

        const commits = await Commit.find({ user: user.id })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('-detailsFetched')

        return response.status(200).json(commits)
    } catch (error) {
        console.error('GET /commits error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

module.exports = commitsRouter