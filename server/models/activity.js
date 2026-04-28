const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  duration: Number,
  keystrokes: Number,
  charsAdded: Number,
  charsDeleted: Number,
  linesAdded: Number,
  linesDeleted: Number,
  language: String,
  editor: String,
  humanCyborgRatio: Number,
  project: String,
  independentFile: String,
  capturedAt: Date
}, {timestamps: true})

activitySchema.set('toJSON', {
  transform: (document, returnedObject)=> {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Activity', activitySchema)