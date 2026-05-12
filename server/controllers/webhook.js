const crypto = require('crypto')
const Commit = require('../models/commit')
const User = require('../models/user')
const Repo = require('../models/repo')
const PullRequest = require('../models/pullRequest')
const Release = require('../models/release')

const webhookRouter = require('express').Router()

// ================================================================
// VERIFY SIGNATURE
// ================================================================
const verifyWebhookSignature = (req) => {
    const signature = req.headers['x-hub-signature-256']
    if (!signature) return false
    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// ================================================================
// FIND USER BY GITHUB ID
// ================================================================
const findUser = async (githubUserId) => {
    return await User.findOne({ 'github.id': githubUserId })
}

// ================================================================
// HANDLE PUSH EVENT
// ================================================================
const handlePush = async (payload) => {
    try {
        const repoOwnerId = payload.repository?.owner?.id
        const user = await findUser(repoOwnerId)
        if (!user) return

        const repoId = payload.repository?.id
        const isBlocked = user.github.blockedRepoIds?.includes(repoId)
        if (isBlocked) return

        const branch = payload.ref?.replace('refs/heads/', '')
        const repoFullName = payload.repository?.full_name
        const commits = payload.commits || []

        for (const commit of commits) {
            await Commit.findOneAndUpdate(
                { sha: commit.id },
                {
                    $setOnInsert: {
                        user: user._id,
                        sha: commit.id,
                        message: commit.message,
                        timestamp: new Date(commit.timestamp),
                        branch,
                        repo: repoFullName,
                        repoId,
                        additions: 0,
                        deletions: 0,
                        detailsFetched: false,
                        url: commit.url
                    }
                },
                { upsert: true, new: true }
            )
        }
    } catch (error) {
        console.error('handlePush error:', error.message)
    }
}

// ================================================================
// HANDLE PULL REQUEST EVENT
// ================================================================
const handlePullRequest = async (payload) => {
    try {
        const action = payload.action
        const pr = payload.pull_request
        const repoOwnerId = payload.repository?.owner?.id
        const authorGithubId = pr.user?.id

        let user = await findUser(repoOwnerId)
        let role = 'owner'

        if (!user) {
            user = await findUser(authorGithubId)
            role = 'author'
        }

        if (!user) return

        const isOwnRepo = user.github.id === repoOwnerId

        if (action === 'opened') {
            await PullRequest.findOneAndUpdate(
                { githubId: pr.id },
                {
                    $setOnInsert: {
                        user: user._id,
                        repo: payload.repository?.full_name,
                        repoId: payload.repository?.id,
                        githubId: pr.id,
                        title: pr.title,
                        state: 'open',
                        merged: false,
                        role,
                        authorGithubId,
                        authorUsername: pr.user?.login,
                        repoOwnerId,
                        repoOwnerUsername: payload.repository?.owner?.login,
                        isOwnRepo,
                        commits: pr.commits,
                        additions: pr.additions,
                        deletions: pr.deletions,
                        changedFiles: pr.changed_files,
                        targetBranch: pr.base?.ref,
                        sourceBranch: pr.head?.ref,
                        openedAt: new Date(pr.created_at),
                    }
                },
                { upsert: true, new: true }
            )
        }

        if (action === 'closed') {
            const merged = pr.merged === true
            await PullRequest.findOneAndUpdate(
                { githubId: pr.id },
                {
                    $set: {
                        state: merged ? 'merged' : 'closed',
                        merged,
                        mergedAt: merged ? new Date(pr.merged_at) : null,
                        closedAt: new Date(pr.closed_at)
                    }
                }
            )
        }

        if (action === 'reopened') {
            await PullRequest.findOneAndUpdate(
                { githubId: pr.id },
                { $set: { state: 'open', merged: false, closedAt: null } }
            )
        }

        if (action === 'synchronize') {
            await PullRequest.findOneAndUpdate(
                { githubId: pr.id },
                {
                    $set: {
                        commits: pr.commits,
                        additions: pr.additions,
                        deletions: pr.deletions,
                        changedFiles: pr.changed_files
                    }
                }
            )
        }
    } catch (error) {
        console.error('handlePullRequest error:', error.message)
    }
}

// ================================================================
// HANDLE RELEASE EVENT
// ================================================================
const handleRelease = async (payload) => {
    try {
        if (payload.action !== 'published') return

        const repoOwnerId = payload.repository?.owner?.id
        const user = await findUser(repoOwnerId)
        if (!user) return

        const release = payload.release

        await Release.findOneAndUpdate(
            { githubId: release.id },
            {
                $setOnInsert: {
                    user: user._id,
                    repo: payload.repository?.full_name,
                    repoId: payload.repository?.id,
                    githubId: release.id,
                    tagName: release.tag_name,
                    title: release.name,
                    description: release.body,
                    isPrerelease: release.prerelease,
                    publishedAt: new Date(release.published_at)
                }
            },
            { upsert: true, new: true }
        )
    } catch (error) {
        console.error('handleRelease error:', error.message)
    }
}

// ================================================================
// HANDLE STAR EVENT
// ================================================================
const handleStar = async (payload) => {
    try {
        const repoId = payload.repository?.id
        const starCount = payload.repository?.stargazers_count

        await Repo.findOneAndUpdate(
            { githubId: repoId },
            { $set: { stars: starCount } }
        )
    } catch (error) {
        console.error('handleStar error:', error.message)
    }
}

// ================================================================
// HANDLE FORK EVENT
// ================================================================
const handleFork = async (payload) => {
    try {
        const repoId = payload.repository?.id
        const forkCount = payload.repository?.forks_count

        await Repo.findOneAndUpdate(
            { githubId: repoId },
            { $set: { forks: forkCount } }
        )
    } catch (error) {
        console.error('handleFork error:', error.message)
    }
}

// ================================================================
// HANDLE REPOSITORY CREATED EVENT
// ================================================================
const handleRepository = async (payload) => {
    try {
        if (payload.action !== 'created') return

        const repoOwnerId = payload.repository?.owner?.id
        const user = await findUser(repoOwnerId)
        if (!user) return

        const repo = payload.repository
        const isBlocked = user.github.blockedRepoIds?.includes(repo.id)
        if (isBlocked) return

        await Repo.findOneAndUpdate(
            { githubId: repo.id },
            {
                $setOnInsert: {
                    user: user._id,
                    githubId: repo.id,
                    name: repo.name,
                    fullName: repo.full_name,
                    description: repo.description,
                    private: repo.private,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    defaultBranch: repo.default_branch,
                    url: repo.html_url,
                    createdAt: new Date(repo.created_at),
                }
            },
            { upsert: true, new: true }
        )
    } catch (error) {
        console.error('handleRepository error:', error.message)
    }
}

// ================================================================
// MAIN WEBHOOK ROUTE
// ================================================================
webhookRouter.post('/github', async (request, response) => {
    try {
        if (!verifyWebhookSignature(request)) {
            return response.status(401).json({ error: 'Invalid signature' })
        }

        response.status(200).json({ message: 'ok' })

        const event = request.headers['x-github-event']
        const payload = request.body

        if (event === 'push') await handlePush(payload)
        if (event === 'pull_request') await handlePullRequest(payload)
        if (event === 'release') await handleRelease(payload)
        if (event === 'star') await handleStar(payload)
        if (event === 'fork') await handleFork(payload)
        if (event === 'repository') await handleRepository(payload)

    } catch (error) {
        console.error('Webhook error:', error.message)
    }
})

module.exports = webhookRouter