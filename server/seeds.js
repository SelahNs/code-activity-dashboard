// seed.js
const mongoose = require('mongoose')
const Activity = require('./models/activity')
const Commit = require('./models/commit')
const User = require('./models/user')
const Repo = require('./models/repo')
const Project = require('./models/project')


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


await Repo.deleteMany({ user: USER_ID })
await Repo.insertMany([
    {
        user: USER_ID,
        githubId: 111111,
        name: 'codedash-frontend',
        fullName: 'yourname/codedash-frontend',
        language: 'JavaScript',
        languages: { JavaScript: 450000, TypeScript: 120000, CSS: 80000, HTML: 30000 },
        stars: 12, forks: 2, private: false,
        pushedAt: new Date(), url: 'https://github.com', lastSyncedAt: new Date()
    },
    {
        user: USER_ID,
        githubId: 222222,
        name: 'codedash-backend',
        fullName: 'yourname/codedash-backend',
        language: 'JavaScript',
        languages: { JavaScript: 380000, Shell: 15000 },
        stars: 8, forks: 1, private: false,
        pushedAt: new Date(), url: 'https://github.com', lastSyncedAt: new Date()
    },
    {
        user: USER_ID,
        githubId: 333333,
        name: 'portfolio',
        fullName: 'yourname/portfolio',
        language: 'TypeScript',
        languages: { TypeScript: 200000, CSS: 95000, HTML: 40000 },
        stars: 5, forks: 0, private: false,
        pushedAt: new Date(), url: 'https://github.com', lastSyncedAt: new Date()
    }
])
console.log('Inserted repos')

await Project.deleteMany({ user: USER_ID })
await Project.insertMany([
    {
        user: USER_ID,
        title: 'CodeDash Frontend',
        description: 'The React frontend for CodeDash — developer activity tracker.',
        status: 'active',
        tags: ['react', 'tailwind', 'vite'],
        visibility: 'public',
        totalSecondsCoded: 120000,
        lastActiveDate: new Date(),
        github: {
            repoId: 111111,
            fullName: 'yourname/codedash-frontend',
            url: 'https://github.com',
            stars: 12,
            forks: 2,
            language: 'JavaScript',
            lastCommit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
    },
    {
        user: USER_ID,
        title: 'CodeDash Backend',
        description: 'Node.js + Express API for CodeDash.',
        status: 'active',
        tags: ['nodejs', 'express', 'mongodb'],
        visibility: 'private',
        totalSecondsCoded: 85000,
        lastActiveDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        github: {
            repoId: 222222,
            fullName: 'yourname/codedash-backend',
            url: 'https://github.com',
            stars: 8,
            forks: 1,
            language: 'JavaScript',
            lastCommit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        }
    },
    {
        user: USER_ID,
        title: 'Portfolio',
        description: 'Personal portfolio website.',
        status: 'completed',
        tags: ['typescript', 'nextjs'],
        visibility: 'public',
        totalSecondsCoded: 32000,
        lastActiveDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        github: {
            repoId: 333333,
            fullName: 'yourname/portfolio',
            url: 'https://github.com',
            stars: 5,
            forks: 0,
            language: 'TypeScript',
            lastCommit: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) // 40 days ago — will show red dot
        }
    }
])
console.log('Inserted projects')

const PullRequest = require('./models/pullRequest')
const Release = require('./models/release')

await PullRequest.deleteMany({ user: USER_ID })
const prMessages = ['Add dashboard layout', 'Fix auth bug', 'Add GitHub sync', 'Improve UI']
for (let daysAgo = 28; daysAgo >= 0; daysAgo -= 4) {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    await PullRequest.create({
        user: USER_ID,
        repo: projects[randomBetween(0, projects.length - 1)],
        repoId: randomBetween(100000, 999999),
        githubId: randomBetween(1000000, 9999999),
        title: prMessages[randomBetween(0, prMessages.length - 1)],
        state: 'merged',
        merged: true,
        mergedAt: date,
        openedAt: new Date(date.getTime() - 24 * 60 * 60 * 1000),
        isOwnRepo: true,
        role: 'author'
    })
}
console.log('Inserted PRs')

await Release.deleteMany({ user: USER_ID })
await Release.insertMany([
    {
        user: USER_ID,
        repo: 'yourname/codedash-frontend',
        repoId: 111111,
        githubId: 99991,
        tagName: 'v0.1.0',
        title: 'Initial Release',
        isPrerelease: false,
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
        user: USER_ID,
        repo: 'yourname/codedash-backend',
        repoId: 222222,
        githubId: 99992,
        tagName: 'v0.2.0',
        title: 'Beta Release',
        isPrerelease: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
])
console.log('Inserted releases')
// Generate 2 years of commits
await Commit.deleteMany({ user: USER_ID })
const commitMessages = [
    'feat: add dashboard layout', 'fix: correct token refresh logic',
    'refactor: clean up auth store', 'feat: add GitHub sync queue',
    'fix: socket disconnect on logout', 'chore: update dependencies',
    'feat: add activity tracking endpoint', 'fix: streak calculation edge case',
    'feat: shipping heatmap component', 'fix: language chart data source',
    'refactor: profile controller', 'chore: seed script improvements',
]
const commitDocs = []
for (let daysAgo = 730; daysAgo >= 0; daysAgo--) {
    if (Math.random() < 0.3) continue // skip ~30% of days
    const numCommits = randomBetween(1, 6)
    for (let c = 0; c < numCommits; c++) {
        const date = new Date()
        date.setDate(date.getDate() - daysAgo)
        commitDocs.push({
            user: USER_ID,
            sha: `fake${Math.random().toString(36).slice(2)}${c}`,
            message: commitMessages[randomBetween(0, commitMessages.length - 1)],
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
}
await Commit.insertMany(commitDocs)
console.log(`Inserted ${commitDocs.length} commits`)


    await mongoose.disconnect()
    console.log('Done!')
}

run().catch(console.error)