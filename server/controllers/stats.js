const statsRouter = require('express').Router()
const Activity = require('../models/activity')
const Commit = require('../models/commit')
const PullRequest = require('../models/pullRequest')
const Release = require('../models/release')
const Repo = require('../models/repo')
const User = require('../models/user')

// ================================================================
// GET /api/stats/github
// ================================================================
statsRouter.get('/github', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

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

// ================================================================
// GET /api/stats/bests
// ================================================================
statsRouter.get('/bests', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const fullUser = await User.findById(user._id)

    const [
        // extension bests
        bestDayByHours,
        bestWeekByHours,
        longestSession,
        mostKeystrokesDay,
        timeOfDayBreakdown,
        totalDaysCoded,

        // github bests
        bestDayByCommits,
        bestWeekByCommits,
        bestWeekByPRs,
        mostProlificRepo,
        firstCommit,
        commitStreak,
    ] = await Promise.all([

        // Best day by hours (extension)
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
                totalSeconds: { $sum: '$duration' },
                totalLines: { $sum: '$linesAdded' }
            }},
            { $sort: { totalSeconds: -1 } },
            { $limit: 1 }
        ]),

        // Best week by hours (extension)
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: {
                    year: { $isoWeekYear: '$capturedAt' },
                    week: { $isoWeek: '$capturedAt' }
                },
                totalSeconds: { $sum: '$duration' },
                firstDay: { $min: '$capturedAt' }
            }},
            { $sort: { totalSeconds: -1 } },
            { $limit: 1 }
        ]),

        // Longest single session (extension)
        Activity.findOne({ user: user._id }).sort({ duration: -1 }).lean(),

        // Most keystrokes in a day (extension)
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
                totalKeystrokes: { $sum: '$keystrokes' }
            }},
            { $sort: { totalKeystrokes: -1 } },
            { $limit: 1 }
        ]),

        // Time of day breakdown — count sessions by hour bucket
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $hour: '$capturedAt' },
                totalSeconds: { $sum: '$duration' },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]),

        // Total distinct days coded (extension)
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } }
            }},
            { $count: 'total' }
        ]),

        // Best day by commits (github)
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),

        // Best week by commits (github)
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: {
                    year: { $isoWeekYear: '$timestamp' },
                    week: { $isoWeek: '$timestamp' }
                },
                count: { $sum: 1 },
                firstDay: { $min: '$timestamp' }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),

        // Best week by PRs merged (github)
        PullRequest.aggregate([
            { $match: { user: user._id, merged: true } },
            { $group: {
                _id: {
                    year: { $isoWeekYear: '$mergedAt' },
                    week: { $isoWeek: '$mergedAt' }
                },
                count: { $sum: 1 },
                firstDay: { $min: '$mergedAt' }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),

        // Most prolific repo by commit count (github)
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: '$repo',
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),

        // First ever commit (github) — when did you start
        Commit.findOne({ user: user._id }).sort({ timestamp: 1 }).lean(),

        // Commit streak — consecutive days with at least one commit
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            }},
            { $sort: { _id: -1 } }
        ]),
    ])

    // Calculate favorite time of day from hour breakdown
    const morningSeconds = timeOfDayBreakdown
        .filter(h => h._id >= 6 && h._id < 12)
        .reduce((s, h) => s + h.totalSeconds, 0)
    const afternoonSeconds = timeOfDayBreakdown
        .filter(h => h._id >= 12 && h._id < 18)
        .reduce((s, h) => s + h.totalSeconds, 0)
    const eveningSeconds = timeOfDayBreakdown
        .filter(h => h._id >= 18 && h._id < 24)
        .reduce((s, h) => s + h.totalSeconds, 0)
    const nightSeconds = timeOfDayBreakdown
        .filter(h => h._id >= 0 && h._id < 6)
        .reduce((s, h) => s + h.totalSeconds, 0)

    const timeSlots = [
        { label: 'Morning', seconds: morningSeconds, emoji: '🌅' },
        { label: 'Afternoon', seconds: afternoonSeconds, emoji: '☀️' },
        { label: 'Evening', seconds: eveningSeconds, emoji: '🌆' },
        { label: 'Night', seconds: nightSeconds, emoji: '🌙' },
    ]
    const favoriteTimeOfDay = timeSlots.reduce((best, slot) =>
        slot.seconds > best.seconds ? slot : best,
        { label: 'Unknown', seconds: 0, emoji: '—' }
    )

    // Favorite language from extension (by seconds)
    const extensionLanguages = fullUser.skills?.languages
        ? Object.fromEntries(fullUser.skills.languages)
        : {}
    const favoriteLanguageByTime = Object.entries(extensionLanguages)
        .sort((a, b) => b[1] - a[1])[0] || null

    // Favorite language from github (by bytes)
    const githubLanguages = {}
    const repos = await Repo.find({ user: user._id }, { languages: 1 })
    for (const repo of repos) {
        const langMap = repo.languages instanceof Map
            ? Object.fromEntries(repo.languages)
            : (repo.languages || {})
        for (const [lang, bytes] of Object.entries(langMap)) {
            githubLanguages[lang] = (githubLanguages[lang] || 0) + bytes
        }
    }
    const favoriteLanguageBySize = Object.entries(githubLanguages)
        .sort((a, b) => b[1] - a[1])[0] || null

    // Calculate commit streak from sorted commit days
    const commitDays = commitStreak.map(d => d._id)
    let currentCommitStreak = 0
    let longestCommitStreak = 0
    let streakCount = 0
    for (let i = 0; i < commitDays.length; i++) {
        if (i === 0) {
            streakCount = 1
        } else {
            const prev = new Date(commitDays[i - 1])
            const curr = new Date(commitDays[i])
            const diffDays = (prev - curr) / (1000 * 60 * 60 * 24)
            if (diffDays === 1) {
                streakCount++
            } else {
                longestCommitStreak = Math.max(longestCommitStreak, streakCount)
                streakCount = 1
            }
        }
    }
    longestCommitStreak = Math.max(longestCommitStreak, streakCount)

    // Check if commit streak is current (last commit was today or yesterday)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const lastCommitDay = commitDays[0] ? new Date(commitDays[0]) : null
    if (lastCommitDay) {
        lastCommitDay.setHours(0, 0, 0, 0)
        if (lastCommitDay >= yesterday) {
            currentCommitStreak = streakCount
        }
    }

    const totalDaysCodedCount = totalDaysCoded[0]?.total || 0
    const totalSecondsAllTime = fullUser.stats?.totalSecondsCoded || 0
    const avgSecondsPerDay = totalDaysCodedCount > 0
        ? totalSecondsAllTime / totalDaysCodedCount
        : 0

    return response.json({
        // extension bests
        bestDayByHours: bestDayByHours[0] || null,
        bestWeekByHours: bestWeekByHours[0]
            ? { ...bestWeekByHours[0], firstDay: bestWeekByHours[0].firstDay }
            : null,
        longestSession: longestSession || null,
        mostKeystrokesDay: mostKeystrokesDay[0] || null,
        favoriteTimeOfDay,
        timeOfDayBreakdown: timeSlots,
        totalDaysCoded: totalDaysCodedCount,
        avgHoursPerDay: avgSecondsPerDay / 3600,

        // github bests
        bestDayByCommits: bestDayByCommits[0] || null,
        bestWeekByCommits: bestWeekByCommits[0] || null,
        bestWeekByPRs: bestWeekByPRs[0] || null,
        mostProlificRepo: mostProlificRepo[0] || null,
        firstCommit: firstCommit || null,
        currentCommitStreak,
        longestCommitStreak,

        // language favorites
        favoriteLanguageByTime,
        favoriteLanguageBySize,

        // streaks from user model
        currentCodingStreak: fullUser.stats?.currentStreak || 0,
        longestCodingStreak: fullUser.stats?.longestStreak || 0,
    })
})

// ================================================================
// GET /api/stats/weekly-trend
// ================================================================
statsRouter.get('/weekly-trend', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const [activityWeeks, commitWeeks] = await Promise.all([
        Activity.aggregate([
            { $match: { user: user._id, capturedAt: { $gte: oneYearAgo } } },
            { $group: {
                _id: {
                    year: { $isoWeekYear: '$capturedAt' },
                    week: { $isoWeek: '$capturedAt' }
                },
                totalSeconds: { $sum: '$duration' },
                firstDay: { $min: '$capturedAt' }
            }},
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]),

        Commit.aggregate([
            { $match: { user: user._id, timestamp: { $gte: oneYearAgo } } },
            { $group: {
                _id: {
                    year: { $isoWeekYear: '$timestamp' },
                    week: { $isoWeek: '$timestamp' }
                },
                count: { $sum: 1 },
                firstDay: { $min: '$timestamp' }
            }},
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ])
    ])

    // Merge into one array keyed by week label
    const weekMap = {}

    for (const w of activityWeeks) {
        const label = new Date(w.firstDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const key = `${w._id.year}-${w._id.week}`
        weekMap[key] = {
            key,
            label,
            firstDay: w.firstDay,
            hours: w.totalSeconds / 3600,
            commits: 0
        }
    }

    for (const w of commitWeeks) {
        const key = `${w._id.year}-${w._id.week}`
        if (weekMap[key]) {
            weekMap[key].commits = w.count
        } else {
            const label = new Date(w.firstDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            weekMap[key] = {
                key,
                label,
                firstDay: w.firstDay,
                hours: 0,
                commits: w.count
            }
        }
    }

    const weeks = Object.values(weekMap).sort((a, b) =>
        new Date(a.firstDay) - new Date(b.firstDay)
    )

    return response.json({ weeks })
})

// ================================================================
// GET /api/stats/language-trend
// ================================================================
statsRouter.get('/language-trend', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyLanguages = await Activity.aggregate([
        { $match: { user: user._id, capturedAt: { $gte: sixMonthsAgo } } },
        { $group: {
            _id: {
                year: { $year: '$capturedAt' },
                month: { $month: '$capturedAt' },
                language: '$language'
            },
            totalSeconds: { $sum: '$duration' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Find top 5 languages overall to limit chart complexity
    const languageTotals = {}
    for (const entry of monthlyLanguages) {
        const lang = entry._id.language
        languageTotals[lang] = (languageTotals[lang] || 0) + entry.totalSeconds
    }
    const topLanguages = Object.entries(languageTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang]) => lang)

    // Build month buckets
    const monthMap = {}
    for (const entry of monthlyLanguages) {
        if (!topLanguages.includes(entry._id.language)) continue
        const date = new Date(entry._id.year, entry._id.month - 1, 1)
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (!monthMap[label]) {
            monthMap[label] = { label, date }
            for (const lang of topLanguages) monthMap[label][lang] = 0
        }
        monthMap[label][entry._id.language] = entry.totalSeconds / 3600
    }

    const months = Object.values(monthMap).sort((a, b) => a.date - b.date)

    return response.json({ months, topLanguages })
})

// ================================================================
// GET /api/stats/coding-rhythm
// ================================================================
statsRouter.get('/coding-rhythm', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const rhythm = await Activity.aggregate([
        { $match: { user: user._id } },
        { $group: {
            _id: {
                dayOfWeek: { $dayOfWeek: '$capturedAt' }, // 1=Sun, 2=Mon...7=Sat
                hour: { $hour: '$capturedAt' }
            },
            totalSeconds: { $sum: '$duration' },
            count: { $sum: 1 }
        }}
    ])

    // Build a 7x24 grid
    // dayOfWeek: MongoDB 1=Sun...7=Sat, we want Mon=0...Sun=6
    const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const grid = {}
    for (const day of DAYS) {
        grid[day] = {}
        for (let h = 0; h < 24; h++) {
            grid[day][h] = 0
        }
    }

    for (const entry of rhythm) {
        // MongoDB dayOfWeek: 1=Sun, 2=Mon...7=Sat
        const mongoDay = entry._id.dayOfWeek
        const dayIndex = mongoDay === 1 ? 6 : mongoDay - 2 // convert to Mon=0...Sun=6
        const dayName = DAYS[dayIndex]
        grid[dayName][entry._id.hour] = entry.totalSeconds / 3600
    }

    return response.json({ grid, days: DAYS })
})

module.exports = statsRouter