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
        bestDayByHours,
        bestWeekByHours,
        longestSession,
        mostKeystrokesDay,
        timeOfDayBreakdown,
        totalDaysCoded,
        bestDayByCommits,
        bestWeekByCommits,
        bestWeekByPRs,
        mostProlificRepo,
        firstCommit,
        commitDays,
    ] = await Promise.all([
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
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { year: { $isoWeekYear: '$capturedAt' }, week: { $isoWeek: '$capturedAt' } },
                totalSeconds: { $sum: '$duration' },
                firstDay: { $min: '$capturedAt' }
            }},
            { $sort: { totalSeconds: -1 } },
            { $limit: 1 }
        ]),
        Activity.findOne({ user: user._id }).sort({ duration: -1 }).lean(),
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
                totalKeystrokes: { $sum: '$keystrokes' }
            }},
            { $sort: { totalKeystrokes: -1 } },
            { $limit: 1 }
        ]),
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $hour: '$capturedAt' },
                totalSeconds: { $sum: '$duration' }
            }},
            { $sort: { _id: 1 } }
        ]),
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } } } },
            { $count: 'total' }
        ]),
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                count: { $sum: 1 }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { year: { $isoWeekYear: '$timestamp' }, week: { $isoWeek: '$timestamp' } },
                count: { $sum: 1 },
                firstDay: { $min: '$timestamp' }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),
        PullRequest.aggregate([
            { $match: { user: user._id, merged: true } },
            { $group: {
                _id: { year: { $isoWeekYear: '$mergedAt' }, week: { $isoWeek: '$mergedAt' } },
                count: { $sum: 1 },
                firstDay: { $min: '$mergedAt' }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: '$repo', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]),
        Commit.findOne({ user: user._id }).sort({ timestamp: 1 }).lean(),
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } } } },
            { $sort: { _id: -1 } }
        ]),
    ])

    // time of day buckets
    const slots = [
        { label: 'Morning', emoji: '🌅', hours: [6,7,8,9,10,11] },
        { label: 'Afternoon', emoji: '☀️', hours: [12,13,14,15,16,17] },
        { label: 'Evening', emoji: '🌆', hours: [18,19,20,21,22,23] },
        { label: 'Night', emoji: '🌙', hours: [0,1,2,3,4,5] },
    ]
    const hourMap = {}
    for (const h of timeOfDayBreakdown) hourMap[h._id] = h.totalSeconds

    const timeOfDaySlots = slots.map(slot => ({
        label: slot.label,
        emoji: slot.emoji,
        seconds: slot.hours.reduce((s, h) => s + (hourMap[h] || 0), 0)
    }))
    const favoriteTimeOfDay = timeOfDaySlots.reduce((best, s) =>
        s.seconds > best.seconds ? s : best,
        { label: 'Unknown', seconds: 0, emoji: '—' }
    )

    // peak 2-hour window
    const windowSize = 2
    let bestWindowStart = 0
    let bestWindowSeconds = 0
    for (let h = 0; h < 24; h++) {
        const windowSeconds = Array.from({ length: windowSize }, (_, i) =>
            hourMap[(h + i) % 24] || 0
        ).reduce((s, v) => s + v, 0)
        if (windowSeconds > bestWindowSeconds) {
            bestWindowSeconds = windowSeconds
            bestWindowStart = h
        }
    }
    const fmt = (h) => {
        if (h === 0) return '12 AM'
        if (h === 12) return '12 PM'
        return h < 12 ? `${h} AM` : `${h - 12} PM`
    }
    const peakWindow = `${fmt(bestWindowStart)} – ${fmt((bestWindowStart + windowSize) % 24)}`

    // commit streak
    const days = commitDays.map(d => d._id)
    let longestCommitStreak = 0
    let currentCommitStreak = 0
    let streak = 0
    for (let i = 0; i < days.length; i++) {
        if (i === 0) { streak = 1; continue }
        const diff = (new Date(days[i-1]) - new Date(days[i])) / 86400000
        if (diff === 1) streak++
        else { longestCommitStreak = Math.max(longestCommitStreak, streak); streak = 1 }
    }
    longestCommitStreak = Math.max(longestCommitStreak, streak)
    const today = new Date(); today.setHours(0,0,0,0)
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1)
    const lastDay = days[0] ? new Date(days[0]) : null
    if (lastDay) { lastDay.setHours(0,0,0,0); currentCommitStreak = lastDay >= yesterday ? streak : 0 }

    // language favorites
    const extensionLanguages = fullUser.skills?.languages
        ? Object.fromEntries(fullUser.skills.languages) : {}
    const favoriteLanguageByTime = Object.entries(extensionLanguages)
        .sort((a,b) => b[1]-a[1])[0] || null

    const repos = await Repo.find({ user: user._id }, { languages: 1 })
    const githubLanguages = {}
    for (const repo of repos) {
        const lm = repo.languages instanceof Map
            ? Object.fromEntries(repo.languages) : (repo.languages || {})
        for (const [lang, bytes] of Object.entries(lm)) {
            githubLanguages[lang] = (githubLanguages[lang] || 0) + bytes
        }
    }
    const favoriteLanguageBySize = Object.entries(githubLanguages)
        .sort((a,b) => b[1]-a[1])[0] || null

    const totalDaysCodedCount = totalDaysCoded[0]?.total || 0

    return response.json({
        bestDayByHours: bestDayByHours[0] || null,
        bestWeekByHours: bestWeekByHours[0] || null,
        longestSession: longestSession || null,
        mostKeystrokesDay: mostKeystrokesDay[0] || null,
        favoriteTimeOfDay,
        timeOfDaySlots,
        peakWindow,
        totalDaysCoded: totalDaysCodedCount,
        bestDayByCommits: bestDayByCommits[0] || null,
        bestWeekByCommits: bestWeekByCommits[0] || null,
        bestWeekByPRs: bestWeekByPRs[0] || null,
        mostProlificRepo: mostProlificRepo[0] || null,
        firstCommit: firstCommit || null,
        currentCommitStreak,
        longestCommitStreak,
        favoriteLanguageByTime,
        favoriteLanguageBySize,
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
                _id: { year: { $isoWeekYear: '$capturedAt' }, week: { $isoWeek: '$capturedAt' } },
                totalSeconds: { $sum: '$duration' },
                firstDay: { $min: '$capturedAt' }
            }},
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ]),
        Commit.aggregate([
            { $match: { user: user._id, timestamp: { $gte: oneYearAgo } } },
            { $group: {
                _id: { year: { $isoWeekYear: '$timestamp' }, week: { $isoWeek: '$timestamp' } },
                count: { $sum: 1 },
                firstDay: { $min: '$timestamp' }
            }},
            { $sort: { '_id.year': 1, '_id.week': 1 } }
        ])
    ])

    const weekMap = {}
    for (const w of activityWeeks) {
        const key = `${w._id.year}-${w._id.week}`
        weekMap[key] = {
            key, label: new Date(w.firstDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            firstDay: w.firstDay, hours: w.totalSeconds / 3600, commits: 0
        }
    }
    for (const w of commitWeeks) {
        const key = `${w._id.year}-${w._id.week}`
        if (weekMap[key]) {
            weekMap[key].commits = w.count
        } else {
            weekMap[key] = {
                key, label: new Date(w.firstDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                firstDay: w.firstDay, hours: 0, commits: w.count
            }
        }
    }

    const weeks = Object.values(weekMap).sort((a,b) => new Date(a.firstDay) - new Date(b.firstDay))
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

    const monthly = await Activity.aggregate([
        { $match: { user: user._id, capturedAt: { $gte: sixMonthsAgo } } },
        { $group: {
            _id: { year: { $year: '$capturedAt' }, month: { $month: '$capturedAt' }, language: '$language' },
            totalSeconds: { $sum: '$duration' }
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const languageTotals = {}
    for (const e of monthly) {
        languageTotals[e._id.language] = (languageTotals[e._id.language] || 0) + e.totalSeconds
    }
    const topLanguages = Object.entries(languageTotals)
        .sort((a,b) => b[1]-a[1])
        .slice(0, 6)
        .map(([lang]) => lang)

    const monthMap = {}
    for (const e of monthly) {
        if (!topLanguages.includes(e._id.language)) continue
        const date = new Date(e._id.year, e._id.month - 1, 1)
        const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (!monthMap[label]) {
            monthMap[label] = { label, date }
            for (const lang of topLanguages) monthMap[label][lang] = 0
        }
        monthMap[label][e._id.language] = e.totalSeconds / 3600
    }

    const months = Object.values(monthMap).sort((a,b) => a.date - b.date)
    return response.json({ months, topLanguages })
})

// ================================================================
// GET /api/stats/work-style
// ================================================================
statsRouter.get('/work-style', async (request, response) => {
    const { user } = request
    if (!user) return response.status(401).json({ error: 'unauthorized' })

    const fullUser = await User.findById(user._id)
    const now = new Date()
    const thirtyDaysAgo = new Date(now - 30 * 86400000)
    const sixtyDaysAgo = new Date(now - 60 * 86400000)

    const [
        allActivities,
        weekdayAgg,
        projectPerDayAgg,
        thisMonthSeconds,
        lastMonthSeconds,
        githubThisMonth,
        githubLastMonth,
        prStats,
        repoActivity,
    ] = await Promise.all([
        // all activities for work style calculations
        Activity.find({ user: user._id }, {
            duration: 1, keystrokes: 1, charsAdded: 1,
            charsDeleted: 1, capturedAt: 1, project: 1, language: 1, editor: 1
        }).lean(),

        // weekday productivity
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dayOfWeek: '$capturedAt' },
                totalSeconds: { $sum: '$duration' },
                dayCount: { $sum: 1 }
            }}
        ]),

        // project switches per day
        Activity.aggregate([
            { $match: { user: user._id } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$capturedAt' } },
                projects: { $addToSet: '$project' }
            }},
            { $project: { projectCount: { $size: '$projects' } } }
        ]),

        // this month total seconds
        Activity.aggregate([
            { $match: { user: user._id, capturedAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]),

        // last month total seconds
        Activity.aggregate([
            { $match: { user: user._id, capturedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$duration' } } }
        ]),

        // github this month
        Commit.countDocuments({ user: user._id, timestamp: { $gte: thirtyDaysAgo } }),

        // github last month
        Commit.countDocuments({ user: user._id, timestamp: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),

        // PR stats — opened vs merged per month last 6 months
        PullRequest.aggregate([
            { $match: { user: user._id, openedAt: { $gte: new Date(now - 180 * 86400000) } } },
            { $group: {
                _id: { year: { $year: '$openedAt' }, month: { $month: '$openedAt' } },
                opened: { $sum: 1 },
                merged: { $sum: { $cond: ['$merged', 1, 0] } },
                firstDay: { $min: '$openedAt' }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),

        // most active repos
        Commit.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: '$repo', commits: { $sum: 1 }, additions: { $sum: '$additions' } } },
            { $sort: { commits: -1 } },
            { $limit: 5 }
        ]),
    ])

    // ── Compute from allActivities ──
    const totalSessions = allActivities.length
    const totalSeconds = allActivities.reduce((s, a) => s + a.duration, 0)
    const avgSessionSeconds = totalSessions > 0 ? totalSeconds / totalSessions : 0

    // deep work
    const DEEP_WORK_MS = 45 * 60 * 1000
    const deepSessions = allActivities.filter(a => a.duration >= DEEP_WORK_MS)
    const deepWorkRatio = totalSessions > 0 ? deepSessions.length / totalSessions : 0
    const avgDeepSessionSeconds = deepSessions.length > 0
        ? deepSessions.reduce((s, a) => s + a.duration, 0) / deepSessions.length : 0

    // session buckets
    const sessionBuckets = { '<15m': 0, '15-30m': 0, '30-60m': 0, '1-2h': 0, '2h+': 0 }
    for (const a of allActivities) {
        const mins = a.duration / 60000
        if (mins < 15) sessionBuckets['<15m']++
        else if (mins < 30) sessionBuckets['15-30m']++
        else if (mins < 60) sessionBuckets['30-60m']++
        else if (mins < 120) sessionBuckets['1-2h']++
        else sessionBuckets['2h+']++
    }

    // keyboard intensity
    const totalHours = totalSeconds / 3600000
    const totalKeystrokes = allActivities.reduce((s, a) => s + a.keystrokes, 0)
    const keystrokesPerHour = totalHours > 0 ? Math.round(totalKeystrokes / totalHours) : 0

    // delete ratio
    const totalCharsAdded = allActivities.reduce((s, a) => s + (a.charsAdded || 0), 0)
    const totalCharsDeleted = allActivities.reduce((s, a) => s + (a.charsDeleted || 0), 0)
    const deleteRatio = totalCharsAdded > 0 ? totalCharsDeleted / totalCharsAdded : 0
    const deleteLabel = deleteRatio < 0.15 ? 'Clean writer'
        : deleteRatio < 0.35 ? 'Iterative builder' : 'Chaotic refactorer'

    // editor loyalty
    const editorTotals = {}
    for (const a of allActivities) {
        editorTotals[a.editor] = (editorTotals[a.editor] || 0) + a.duration
    }
    const totalEditorSeconds = Object.values(editorTotals).reduce((s, v) => s + v, 0)
    const editorBreakdown = Object.entries(editorTotals)
        .map(([editor, seconds]) => ({
            editor,
            pct: totalEditorSeconds > 0 ? Math.round((seconds / totalEditorSeconds) * 100) : 0
        }))
        .sort((a, b) => b.pct - a.pct)

    // weekend vs weekday
    let weekdaySeconds = 0, weekendSeconds = 0
    for (const a of allActivities) {
        const day = new Date(a.capturedAt).getDay()
        if (day === 0 || day === 6) weekendSeconds += a.duration
        else weekdaySeconds += a.duration
    }
    const totalWeekSeconds = weekdaySeconds + weekendSeconds
    const weekendPct = totalWeekSeconds > 0
        ? Math.round((weekendSeconds / totalWeekSeconds) * 100) : 0

    // weekday productivity — MongoDB dayOfWeek 1=Sun...7=Sat → Mon-Sun
    const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const weekdayMap = {}
    for (const d of DAY_NAMES) weekdayMap[d] = { label: d, hours: 0 }
    for (const w of weekdayAgg) {
        const mongoDay = w._id // 1=Sun
        const idx = mongoDay === 1 ? 6 : mongoDay - 2
        weekdayMap[DAY_NAMES[idx]].hours = parseFloat((w.totalSeconds / 3600).toFixed(2))
    }
    const weekdayHours = Object.values(weekdayMap)
    const bestWeekday = weekdayHours.reduce((best, d) => d.hours > best.hours ? d : best, { hours: 0 })

    // project switching
    const avgProjectsPerDay = projectPerDayAgg.length > 0
        ? projectPerDayAgg.reduce((s, d) => s + d.projectCount, 0) / projectPerDayAgg.length : 0
    const projectSwitchLabel = avgProjectsPerDay < 1.5 ? 'Focus mode'
        : avgProjectsPerDay < 3 ? 'Explorer mode' : 'Chaos mode'

    // consistency score
    const firstActivity = allActivities.length > 0
        ? new Date(Math.min(...allActivities.map(a => new Date(a.capturedAt))))
        : null
    const possibleDays = firstActivity
        ? Math.max(1, Math.round((now - firstActivity) / 86400000))
        : 1
    const distinctDays = new Set(
        allActivities.map(a => new Date(a.capturedAt).toISOString().split('T')[0])
    ).size
    const consistencyScore = Math.min(100, Math.round((distinctDays / possibleDays) * 100))

    // momentum — combine coding hours + commits
    const thisMonthMs = thisMonthSeconds[0]?.total || 0
    const lastMonthMs = lastMonthSeconds[0]?.total || 0
    let codingMomentumPct = 0
    if (lastMonthMs > 0) {
        codingMomentumPct = Math.round(((thisMonthMs - lastMonthMs) / lastMonthMs) * 100)
    }
    let commitMomentumPct = 0
    if (githubLastMonth > 0) {
        commitMomentumPct = Math.round(((githubThisMonth - githubLastMonth) / githubLastMonth) * 100)
    }

    // commit velocity (commits per hour coded) per week
    // already computed in weekly-trend, here we return a simplified version
    const velocityWeeks = []
    // we need both per week — reuse weeklyTrend logic inline
    const oneYearAgo = new Date(now - 365 * 86400000)
    const [velocityActivity, velocityCommits] = await Promise.all([
        Activity.aggregate([
            { $match: { user: user._id, capturedAt: { $gte: oneYearAgo } } },
            { $group: {
                _id: { year: { $isoWeekYear: '$capturedAt' }, week: { $isoWeek: '$capturedAt' } },
                totalSeconds: { $sum: '$duration' },
                firstDay: { $min: '$capturedAt' }
            }}
        ]),
        Commit.aggregate([
            { $match: { user: user._id, timestamp: { $gte: oneYearAgo } } },
            { $group: {
                _id: { year: { $isoWeekYear: '$timestamp' }, week: { $isoWeek: '$timestamp' } },
                count: { $sum: 1 },
                firstDay: { $min: '$timestamp' }
            }}
        ])
    ])

    const velMap = {}
    for (const w of velocityActivity) {
        const key = `${w._id.year}-${w._id.week}`
        velMap[key] = { key, firstDay: w.firstDay, hours: w.totalSeconds / 3600, commits: 0 }
    }
    for (const w of velocityCommits) {
        const key = `${w._id.year}-${w._id.week}`
        if (velMap[key]) velMap[key].commits = w.count
    }
    const velocityData = Object.values(velMap)
        .filter(w => w.hours > 0 && w.commits > 0)
        .map(w => ({
            label: new Date(w.firstDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            firstDay: w.firstDay,
            velocity: parseFloat((w.commits / w.hours).toFixed(2)),
            hours: parseFloat(w.hours.toFixed(1)),
            commits: w.commits
        }))
        .sort((a, b) => new Date(a.firstDay) - new Date(b.firstDay))

    // PR merge rate per month
    const prTrend = prStats.map(p => ({
        label: new Date(p.firstDay).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        opened: p.opened,
        merged: p.merged,
        mergeRate: p.opened > 0 ? Math.round((p.merged / p.opened) * 100) : 0
    }))

    // most active repos
    const topRepos = repoActivity.map(r => ({
        name: r._id?.split('/').pop() || r._id,
        fullName: r._id,
        commits: r.commits,
        additions: r.additions || 0
    }))

    // coding archetype
    let archetype = 'The Builder'
    let archetypeDesc = 'Steady, productive, gets things done'
    if (avgDeepSessionSeconds / 60 > 90 && avgSessionSeconds / 60 > 45 && avgProjectsPerDay < 2) {
        archetype = 'The Marathoner'
        archetypeDesc = 'Long focused sessions, few distractions'
    } else if (totalSessions > 0 && (totalSessions / possibleDays) > 8 && avgSessionSeconds / 60 < 30) {
        archetype = 'The Sprinter'
        archetypeDesc = 'Many short bursts of intense activity'
    } else if (new Set(allActivities.map(a => a.language)).size > 3 && avgProjectsPerDay > 3) {
        archetype = 'The Explorer'
        archetypeDesc = 'Curious across languages and projects'
    } else if (deleteRatio < 0.15 && avgSessionSeconds / 60 > 60 && consistencyScore > 70) {
        archetype = 'The Architect'
        archetypeDesc = 'Deliberate, precise, consistent'
    } else if (deleteRatio > 0.35 && avgSessionSeconds / 60 > 45) {
        archetype = 'The Refactor Goblin'
        archetypeDesc = 'You write it, then rewrite it better'
    }

    // night owl score
    const nightHourSeconds = allActivities
        .filter(a => { const h = new Date(a.capturedAt).getHours(); return h >= 21 || h < 4 })
        .reduce((s, a) => s + a.duration, 0)
    const nightOwlScore = totalSeconds > 0
        ? Math.round((nightHourSeconds / totalSeconds) * 100) : 0

    return response.json({
        // consistency
        consistencyScore,
        totalDaysCoded: distinctDays,
        possibleDays,

        // sessions
        totalSessions,
        avgSessionSeconds,
        deepWorkRatio: Math.round(deepWorkRatio * 100),
        avgDeepSessionSeconds,
        sessionBuckets,

        // keyboard + style
        keystrokesPerHour,
        deleteRatio: parseFloat(deleteRatio.toFixed(3)),
        deleteLabel,
        editorBreakdown,

        // time patterns
        weekdayHours,
        bestWeekday: bestWeekday.label,
        weekendPct,
        nightOwlScore,

        // switching
        avgProjectsPerDay: parseFloat(avgProjectsPerDay.toFixed(1)),
        projectSwitchLabel,

        // momentum
        codingMomentumPct,
        commitMomentumPct,
        thisMonthHours: parseFloat((thisMonthMs / 3600000).toFixed(1)),
        lastMonthHours: parseFloat((lastMonthMs / 3600000).toFixed(1)),

        // commit velocity
        velocityData,

        // github
        prTrend,
        topRepos,
        githubThisMonth,
        githubLastMonth,

        // personality
        archetype,
        archetypeDesc,
    })
})

module.exports = statsRouter