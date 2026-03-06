const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type:String,
    required: true,
  },
  apiSecret: {
    type: String,
    unique: true,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActiveDate: {
    type: Date,
    default: Date.now,
  },
  verificationToken: {
    type: String,
    select: false
  },
  verificationTokenExpires: Date,
  profile: {
    fullName: String,
    bio: {
      type: String,
      maxlength: 300
    },
    location: String,
    socials: {
      github: String,
      linkedin: String,
      twitter: String
    },
    isHireable: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    website: String,
    avatarPresetId: {
      type: String,
      default: 'default'
    }
  },
  stats: {
    xp: {
      type: Number,
      default: 0,
    },
    totalLinesAdded: {
      type: Number,
      default: 0,
    },
    totalLinesDeleted: {
      type: Number,
      default: 0,
    },
    totalCharsDeleted: {
      type: Number,
      default: 0
    },totalCharsAdded: {
      type: Number,
      default: 0
    },totalKeystrokes: {
      type: Number,
      default: 0
    },
    totalSecondsCoded: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    humanCyborgRatio: {
      type: Number,
      default: 100
    },
    
    level: {
      type: Number,
      default: 1
    },
    
    
  },
    skills: {
      editors: {
      type: Map,
      of: Number
    },
    languages: {
      type: Map,
      of: Number
    },
  }
}, { timestamps: true})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.passwordHash
    delete returnedObject.__v
    delete returnedObject.verificationToken
    delete returnedObject.apiSecret
  }
})

const User= mongoose.model('User', userSchema)

module.exports = User