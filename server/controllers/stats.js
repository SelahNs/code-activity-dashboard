const statsRouter = require('express').Router()
const Commit = require('../models/commit')
const PullRequest = require('../models/pullRequest')
const Release = require('../models/release')
const Repo = require('../models/repo')

statsRouter.get('/github', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    // All three aggregations run simultaneously — no date filter, frontend handles that
    const [commitsByDay, prsByDay, releasesByDay, totals] = await Promise.all([
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),
        PullRequest.aggregate([
            { $match: { user: user._id, merged: true } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$mergedAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),
        Release.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$publishedAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),
        Promise.all([
            Commit.countDocuments({ user: user._id }),
            Repo.countDocuments({ user: user._id }),
            PullRequest.countDocuments({ user: user._id, merged: true }),
            Repo.aggregate([
                { $match: { user: user._id } },
                { $group: { _id: null, total: { $sum: '$stars' } } }
            ])
        ])
    ])

    // Merge into one map — { '2026-05-10': { commits: 3, prs: 1, releases: 0 } }
    const dayMap = {}

    for (const c of commitsByDay) {
        if (!dayMap[c._id]) dayMap[c._id] = { commits: 0, prs: 0, releases: 0 }
        dayMap[c._id].commits = c.count
    }
    for (const p of prsByDay) {
        if (!dayMap[p._id]) dayMap[p._id] = { commits: 0, prs: 0, releases: 0 }
        dayMap[p._id].prs = p.count
    }
    for (const r of releasesByDay) {
        if (!dayMap[r._id]) dayMap[r._id] = { commits: 0, prs: 0, releases: 0 }
        dayMap[r._id].releases = r.count
    }

    const [totalCommits, totalRepos, totalMergedPRs, starsAgg] = totals

    return response.json({
        dailyActivity: dayMap,
        totals: {
            commits: totalCommits,
            repos: totalRepos,
            mergedPRs: totalMergedPRs,
            stars: starsAgg[0]?.total || 0
        }
    })
})

statsRouter.get('/bests', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    // Most productive day — day with most lines added
    const mostProductiveDay = await Activity.aggregate([
        { $match: { user: user._id } },
        { $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
            totalLines: { $sum: '$linesAdded' },
            totalSeconds: { $sum: '$duration' }
        }},
        { $sort: { totalLines: -1 } },
        { $limit: 1 }
    ])

    // Longest single session
    const longestSession = await Activity.findOne(
        { user: user._id },
        { duration: 1, capturedAt: 1 }
    ).sort({ duration: -1 })

    return response.json({
        mostProductiveDay: mostProductiveDay[0] || null,
        longestSession: longestSession || null
    })
})

module.exports = statsRouter