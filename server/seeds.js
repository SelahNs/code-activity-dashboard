const mongoose = require('mongoose')
const Activity = require('./models/activity')
const Commit = require('./models/commit')
const User = require('./models/user')
const Repo = require('./models/repo')
const Project = require('./models/project')
const PullRequest = require('./models/pullRequest')
const Release = require('./models/release')

require('dotenv').config()

// Replace with your real MongoDB user _id (must be 24 chars)
const USER_ID = '69f9da58eb9f40d1a572f90f'

const languages = ['JavaScript', 'TypeScript', 'Python', 'CSS', 'HTML']
const projects = ['codedash-frontend', 'codedash-backend', 'portfolio']

const randomBetween = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

const generateActivities = () => {
    const activities = []

    for (let daysAgo = 365; daysAgo >= 0; daysAgo--) {
        if (daysAgo % 5 === 0) continue

        const sessionsToday = randomBetween(2, 5)

        for (let i = 0; i < sessionsToday; i++) {
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)

            const keystrokes = randomBetween(3000, 20000)
            const charsAdded = randomBetween(
                Math.floor(keystrokes * 0.6),
                Math.floor(keystrokes * 1.2)
            )

            date.setHours(randomBetween(8, 23), randomBetween(0, 59), 0, 0)
            
            activities.push({
                user: USER_ID,
                duration: randomBetween(10, 90) * 60 * 1000,
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
    const messages = [
        'feat: add dashboard layout',
        'fix: correct token refresh logic',
        'refactor: clean up auth store',
        'feat: add GitHub sync queue',
        'fix: socket disconnect on logout',
        'chore: update dependencies',
        'feat: add activity tracking endpoint',
        'fix: streak calculation edge case',
        'feat: shipping heatmap component',
        'fix: language chart data source',
        'refactor: profile controller',
        'chore: seed improvements',
    ]

    const commits = []

    for (let daysAgo = 730; daysAgo >= 0; daysAgo--) {
        if (Math.random() < 0.3) continue

        const numCommits = randomBetween(1, 6)

        for (let c = 0; c < numCommits; c++) {
            const date = new Date()
            date.setDate(date.getDate() - daysAgo)

            commits.push({
                user: USER_ID,
                sha: `fake${Math.random().toString(36).slice(2)}${c}`,
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
    }

    return commits
}

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB')

        // Clear old data
        await Promise.all([
            Activity.deleteMany({ user: USER_ID }),
            Commit.deleteMany({ user: USER_ID }),
            Repo.deleteMany({ user: USER_ID }),
            Project.deleteMany({ user: USER_ID }),
            PullRequest.deleteMany({ user: USER_ID }),
            Release.deleteMany({ user: USER_ID }),
        ])

        // Activities
        const activities = generateActivities()
        await Activity.insertMany(activities)
        console.log(`Inserted ${activities.length} activities`)

        // Commits
        const commits = generateCommits()
        await Commit.insertMany(commits)
        console.log(`Inserted ${commits.length} commits`)

        // Stats
        const totalSeconds = activities.reduce(
            (sum, a) => sum + a.duration / 1000,
            0
        )
        const totalKeystrokes = activities.reduce(
            (sum, a) => sum + a.keystrokes,
            0
        )
        const totalCharsAdded = activities.reduce(
            (sum, a) => sum + a.charsAdded,
            0
        )
        const totalLinesAdded = activities.reduce(
            (sum, a) => sum + a.linesAdded,
            0
        )

        await User.findByIdAndUpdate(USER_ID, {
            $set: {
                'stats.totalSecondsCoded': Math.round(totalSeconds),
                'stats.totalKeystrokes': totalKeystrokes,
                'stats.totalCharsAdded': totalCharsAdded,
                'stats.totalLinesAdded': totalLinesAdded,
                'stats.humanCyborgRatio':
                    totalKeystrokes / totalCharsAdded,
                'stats.currentStreak': 12,
                'stats.longestStreak': 18,
                'stats.xp': 4200,
                'stats.level': 7,

                'skills.languages': {
                    javascript: 120000,
                    typescript: 80000,
                    python: 45000,
                    css: 30000,
                    html: 20000,
                },

                'skills.frameworksTime': {
                    react: 180000,
                    vite: 40000,
                    tailwindcss: 220000,
                    zustand: 60000,
                    express: 95000,
                    mongoose: 45000,
                    nextjs: 130000,
                    prisma: 30000,
                },
            },
        })

        console.log('Updated user stats')

        // Repositories
        await Repo.insertMany([
            {
                user: USER_ID,
                githubId: 111111,
                name: 'codedash-frontend',
                fullName: 'yourname/codedash-frontend',
                language: 'JavaScript',
                languages: {
                    javascript: 450000,
                    typescript: 120000,
                    css: 80000,
                    html: 30000,
                },
                frameworks: {
                    react: 1,
                    vite: 1,
                    tailwindcss: 1,
                    zustand: 1,
                    reactquery: 1,
                },
                stars: 12,
                forks: 2,
                private: false,
                pushedAt: new Date(),
                url: 'https://github.com',
                lastSyncedAt: new Date(),
            },
            {
                user: USER_ID,
                githubId: 222222,
                name: 'codedash-backend',
                fullName: 'yourname/codedash-backend',
                language: 'JavaScript',
                languages: {
                    javascript: 380000,
                    shell: 15000,
                },
                frameworks: {
                    express: 1,
                    mongoose: 1,
                    socketio: 1,
                    jest: 1,
                },
                stars: 8,
                forks: 1,
                private: false,
                pushedAt: new Date(),
                url: 'https://github.com',
                lastSyncedAt: new Date(),
            },
            {
                user: USER_ID,
                githubId: 333333,
                name: 'portfolio',
                fullName: 'yourname/portfolio',
                language: 'TypeScript',
                languages: {
                    typescript: 200000,
                    css: 95000,
                    html: 40000,
                },
                frameworks: {
                    nextjs: 1,
                    tailwindcss: 1,
                    prisma: 1,
                },
                stars: 5,
                forks: 0,
                private: false,
                pushedAt: new Date(),
                url: 'https://github.com',
                lastSyncedAt: new Date(),
            },
        ])

        console.log('Inserted repos')

        // Projects
        await Project.insertMany([
            {
                user: USER_ID,
                title: 'CodeDash Frontend',
                description: 'React frontend for CodeDash.',
                status: 'active',
                tags: ['react', 'tailwind', 'vite'],
                visibility: 'public',
                totalSecondsCoded: 120000,
                lastActiveDate: new Date(),
            },
            {
                user: USER_ID,
                title: 'CodeDash Backend',
                description: 'Node + Express backend API.',
                status: 'active',
                tags: ['nodejs', 'express', 'mongodb'],
                visibility: 'private',
                totalSecondsCoded: 85000,
                lastActiveDate: new Date(),
            },
            {
                user: USER_ID,
                title: 'Portfolio',
                description: 'Personal portfolio website.',
                status: 'completed',
                tags: ['typescript', 'nextjs'],
                visibility: 'public',
                totalSecondsCoded: 32000,
                lastActiveDate: new Date(
                    Date.now() - 40 * 24 * 60 * 60 * 1000
                ),
            },
        ])

        console.log('Inserted projects')

        // Pull requests
        const prMessages = [
            'Add dashboard layout',
            'Fix auth bug',
            'Add GitHub sync',
            'Improve UI',
        ]

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
                openedAt: new Date(
                    date.getTime() - 24 * 60 * 60 * 1000
                ),
                isOwnRepo: true,
                role: 'author',
            })
        }

        console.log('Inserted PRs')

        // Releases
        await Release.insertMany([
            {
                user: USER_ID,
                repo: 'yourname/codedash-frontend',
                repoId: 111111,
                githubId: 99991,
                tagName: 'v0.1.0',
                title: 'Initial Release',
                isPrerelease: false,
                publishedAt: new Date(
                    Date.now() - 15 * 24 * 60 * 60 * 1000
                ),
            },
            {
                user: USER_ID,
                repo: 'yourname/codedash-backend',
                repoId: 222222,
                githubId: 99992,
                tagName: 'v0.2.0',
                title: 'Beta Release',
                isPrerelease: true,
                publishedAt: new Date(
                    Date.now() - 5 * 24 * 60 * 60 * 1000
                ),
            },
        ])

        console.log('Inserted releases')
        console.log('Done!')
    } catch (error) {
        console.error(error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    }
}

run()