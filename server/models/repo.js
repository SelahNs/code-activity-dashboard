const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    githubId: {
        type: Number,
        unique: true
    },
    name: String,
    fullName: String,
    description: String,
    private: Boolean,
    language: String,
    stars: Number,
    forks: Number,
    openIssues: Number,
    topics: [String],
    size: Number,
    defaultBranch: String,
    pushedAt: Date,
    createdAt: Date,
    updatedAt: Date,
    url: String,
    readme: String,
    languages: {type: Map, of: Number, default: {}},
    frameworks: { type: Map, of: Number, default: {} }          // markdown content fetched from GitHub
}, { timestamps: true });

repoSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Repo', repoSchema);