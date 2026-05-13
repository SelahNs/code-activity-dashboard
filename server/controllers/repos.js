const reposRouter = require('express').Router()
const Repo = require('../models/repo')

reposRouter.get('/', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    try {
        const repos = await Repo.find({ user: user.id })
            .select('-readme') // exclude readme — too heavy for a list
            .sort({ pushedAt: -1 }) // most recently pushed first

        return response.status(200).json(repos)
    } catch (error) {
        console.error('GET /repos error:', error.message)
        return response.status(500).json({ error: 'something went wrong' })
    }
})

module.exports = reposRouter