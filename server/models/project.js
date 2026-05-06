const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived', 'in-progress'],
        default: 'active'
    },
    tags: [String],
    isPinned: {
        type: Boolean,
        default: false
    },

    // GitHub — optional, filled on import
    github: {
        repoId: Number,
        fullName: String,   // 'username/repo'
        url: String,
        stars: Number,
        forks: Number,
        language: String,
        lastCommit: Date,
        readme: String      // markdown content
    },

    // User enriched — optional
    liveUrl: {
        type: String,
        maxlength: [500, 'URL too long']
    },
    docsUrl: {
        type: String,
        maxlength: [500, 'URL too long']
    },
    gallery: [{
        url: String,
        alt: String,
        type: {
            type: String,
            enum: ['image', 'gif'],
            default: 'image'
        }
    }],

    // Auto-calculated from VSCode activities
    totalSecondsCoded: {
        type: Number,
        default: 0
    },
    lastActiveDate: Date,

}, { timestamps: true });

projectSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Project', projectSchema);