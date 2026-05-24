const commitsRouter = require('express').Router()
const Commit = require('../models/commit')

commitsRouter.get('/', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const { limit, repo } = request.query
        const filter = { user: user._id }
        if (repo) filter.repo = repo

        const query = Commit.find(filter).sort({ timestamp: -1 })
        if (limit) query.limit(parseInt(limit))

        const commits = await query
        response.json(commits)
    } catch (error) {
        console.error('GET /commits error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

module.exports = commitsRouter