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
    required: function() {
      return !this.github || !this.github.id; // this could be changed latter for marketing purposes
    },
    unique: true,
    lowercase: true,
    sparse: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  passwordHash: {
    type:String,
    required: function() {
      return !this.github || !this.github.id;
    },
    select: false
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
      default: 1.0
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
    projects: {
      type: Map,
      of: Number
    },
    independentFiles: {
      type: Map,
      of: Number
    }
  },
  github: {
    id: {
      type: Number,
      unique: true,
      sparse: true
    },
    installationId: [String],
    username: String
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