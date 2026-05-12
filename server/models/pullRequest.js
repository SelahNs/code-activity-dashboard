const mongoose = require('mongoose')

const pullRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true  // the CodeDash user this PR belongs to
    },
    repo: String,       // full_name
    repoId: Number,
    githubId: {
        type: Number,
        unique: true
    },
    title: String,
    state: {
        type: String,
        enum: ['open', 'closed', 'merged']
    },
    merged: {
        type: Boolean,
        default: false
    },
    role: {
      type: String,
      enum: ['author', 'owner']  // is our user the PR author or the repo owner?
    },
    authorGithubId: Number,    // who wrote the PR
    authorUsername: String,
    repoOwnerId: Number,       // who owns the repo
    repoOwnerUsername: String,
    isOwnRepo: Boolean,        // did user PR their own repo?
    commits: Number,
    additions: Number,
    deletions: Number,
    changedFiles: Number,
    targetBranch: String,      // branch it merges INTO
    sourceBranch: String,      // branch the PR comes FROM
    openedAt: Date,
    mergedAt: Date,
    closedAt: Date,
}, { timestamps: true })

module.exports = mongoose.model('PullRequest', pullRequestSchema)