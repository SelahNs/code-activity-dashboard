const mongoose = require('mongoose')

const releaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    repo: {
        type: String,
        required: true
    },
    repoId: {
        type: Number,
        required: true
    },
    githubId: {
        type: Number,
        unique: true  // prevents duplicates
    },
    tagName: String,   // v1.0.0
    title: String,
    description: String,
    isPrerelease: {
        type: Boolean,
        default: false
    },
    publishedAt: Date,
}, { timestamps: true })

module.exports = mongoose.model('Release', releaseSchema)