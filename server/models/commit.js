const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sha: {
        type: String,
        unique: true,
        required: true
    },
    message: String,
    timestamp: Date,
    branch: String,
    repo: String,           // full_name like 'username/project'
    repoId: Number,
    filesAdded: [String],
    filesRemoved: [String],
    filesModified: [String],
    additions: Number,
    deletions: Number,
    url: String,
    installationId: String
}, { timestamps: true });

commitSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Commit', commitSchema);