const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    validate: {
      validator: (value) => validator.isAlphanumeric(value),
      message: 'Username can only contain letters and numbers'
    }
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
    validate: {
      validator: (value) => validator.isEmail(value),
      message: 'Please provide a valid email'
    }
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
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  manuallyEdited: {
    type: [String], // list of field names the user edited themselves
    default: []
  },
  profile: {
    fullName: {
      type: String,
      trim: true,
      maxlength: [255, 'Full name cannot exceed 255 characters']
    },
    bio: {
      type: String,
      maxlength: [300, 'Bio cannot exceed 300 characters']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 100 characters']
    },
    socials: {
      github: { type: String, maxlength: [500, 'URL too long'] },
      linkedin: { type: String, maxlength: [500, 'URL too long'] },
      twitter: { type: String, maxlength: [500, 'URL too long'] }
    },
    company: {
      type: String,
      maxlength: [100, 'Company too long']
    },
    isHireable: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      maxlength: [500, 'URL too long']
    },
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
    username: String,
    accessToken: {
      type: String,
      select: false
    },
    blockedRepoIds: [Number]
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
    delete returnedObject.resetPasswordToken
    delete returnedObject.resetPasswordExpires
  }
})

const User= mongoose.model('User', userSchema)

module.exports = User