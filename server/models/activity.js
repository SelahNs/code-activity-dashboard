const mongoose = require('mongoose');

const activitySchema = mongoose.Schema({
  date: Date,
  duration: Number,
  keystrokes: Number,
  linesAdded: Number,
  language: String,
  project: String
})

activitySchema.set('toJSON', {
  transform: (document, returnedObject)=> {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model('Activity', activitySchema)