const mongoose = require('mongoose');


const sessionLogSchema = mongoose.Schema({
  user: { 
    //type: mongoose.Schema.Types.ObjectId, //ref: 'User'
    type: String, default: "selha",
    },
  project: {
    //type: mongoose.Schema.Types.ObjectId, ref: 'Project'
    type: String, required: true
    },

  startTime: Date,
  endTime: Date,
  durationSeconds: Number,

  keystrokes: { type: Number, default: 0},
  linesAdded: {type: Number, default: 0},
  linesDeleted: { type: Number, default: 0},

  editor: {type: String , default: "Vs Code"},
  language: String
})

sessionLogSchema.set('toJSON', {
  transform: (document, returnedObject)=> {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

module.exports = mongoose.model("SessionLog", sessionLogSchema)

