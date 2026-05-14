// seed.js
const mongoose = require('mongoose')
const Activity = require('./models/activity')
const Commit = require('./models/commit')
const User = require('./models/user')
require('dotenv').config()

const USER_ID = '69f9da58eb9f40d1a572f90f' // paste your _id here

const languages = ['JavaScript', 'TypeScript', 'Python', 'CSS', 'HTML']
const projects = ['codedash-frontend', 'codedash-backend', 'portfolio']
const editors = ['vscode']

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generateActivities = () => {
    const activities = []
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
        // skip some days to make streak realistic
        if (daysAgo % 5 === 0) continue
        const sessionsToday = randomBetween(2, 5)
        for (let s = 0; s < sessionsToday; s++) {
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)
            const keystrokes = randomBetween(3000, 20000)
            const charsAdded = randomBetween(keystrokes * 0.6, keystrokes * 1.2)
            activities.push({
                user: USER_ID,
                duration: randomBetween(10, 90) * 60 * 1000, // ms
                keystrokes,
                charsAdded,
                charsDeleted: randomBetween(100, 2000),
                linesAdded: randomBetween(20, 300),
                linesDeleted: randomBetween(5, 80),
                language: languages[randomBetween(0, languages.length - 1)],
                editor: 'vscode',
                project: projects[randomBetween(0, projects.length - 1)],
                humanCyborgRatio: keystrokes / charsAdded,
                capturedAt: date,
            })
        }
    }
    return activities
}

const generateCommits = () => {
    const commits = []
    const messages = [
        'feat: add dashboard layout',
        'fix: correct token refresh logic',
        'refactor: clean up auth store',
        'feat: add GitHub sync queue',
        'fix: socket disconnect on logout',
        'chore: update dependencies',
        'feat: add activity tracking endpoint',
        'fix: streak calculation edge case',
    ]
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
        if (daysAgo % 3 === 0) continue
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        commits.push({
            user: USER_ID,
            sha: `fake${Math.random().toString(36).slice(2)}`,
            message: messages[randomBetween(0, messages.length - 1)],
            timestamp: date,
            branch: 'main',
            repo: projects[randomBetween(0, projects.length - 1)],
            repoId: randomBetween(100000, 999999),
            additions: randomBetween(10, 200),
            deletions: randomBetween(5, 80),
            url: 'https://github.com',
            detailsFetched: true,
        })
    }
    return commits
}

const run = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    await Activity.deleteMany({ user: USER_ID })
    await Commit.deleteMany({ user: USER_ID })

    const activities = generateActivities()
    await Activity.insertMany(activities)
    console.log(`Inserted ${activities.length} activities`)

    const commits = generateCommits()
    await Commit.insertMany(commits)
    console.log(`Inserted ${commits.length} commits`)

    // Update user stats to match
    const totalSeconds = activities.reduce((s, a) => s + a.duration / 1000, 0)
    const totalKeystrokes = activities.reduce((s, a) => s + a.keystrokes, 0)
    const totalCharsAdded = activities.reduce((s, a) => s + a.charsAdded, 0)
    const totalLinesAdded = activities.reduce((s, a) => s + a.linesAdded, 0)

    await User.findByIdAndUpdate(USER_ID, {
        $set: {
            'stats.totalSecondsCoded': Math.round(totalSeconds),
            'stats.totalKeystrokes': totalKeystrokes,
            'stats.totalCharsAdded': totalCharsAdded,
            'stats.totalLinesAdded': totalLinesAdded,
            'stats.humanCyborgRatio': totalKeystrokes / totalCharsAdded,
            'stats.currentStreak': 12,
            'stats.longestStreak': 18,
            'stats.xp': 4200,
            'stats.level': 7,
            'skills.languages': {
                JavaScript: 120000,
                TypeScript: 80000,
                Python: 45000,
                CSS: 30000,
                HTML: 20000,
            }
        }
    })
    console.log('Updated user stats')

    await mongoose.disconnect()
    console.log('Done!')
}

run().catch(console.error)