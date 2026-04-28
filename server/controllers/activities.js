const activitiesRouter = require('express').Router()
const Activity = require('../models/activity')
const User = require('../models/user')

activitiesRouter.get('/', async (request, response) => {
  const activities = await Activity.find({})
  response.json(activities);
})

activitiesRouter.post('/', async (request, response) => {
  const {body,user} = request;
  if (user) {
    const preparedActivities = body.map(element => {
      return {
        ...element,
        user: user._id,
        humanCyborgRatio: element.charsAdded === 0? 1: element.keystrokes/ element.charsAdded,
        capturedAt: element.timeStamp
      }
    })
    const sendActivities = await Activity.insertMany(preparedActivities)

    const totalKeystrokes = preparedActivities.reduce((sum, p) => sum + p.keystrokes, 0)
    const totalCharsAdded = preparedActivities.reduce((sum, p) => sum + p.charsAdded, 0)
    const totalCharsDeleted = preparedActivities.reduce((sum, p) => sum + p.charsDeleted, 0)
    const totalLinesAdded = preparedActivities.reduce((sum, p) => sum + p.linesAdded, 0)
    const totalLinesDeleted = preparedActivities.reduce((sum, p) => sum + p.linesDeleted, 0)
    const totalSecondsBatch = preparedActivities.reduce((sum, p) => sum + p.duration/1000, 0)
    const languageTotals = {}
    const editorTotals = {}
    const projectTotals = {}
    const independentFileTotals = {}
    
    const updateInstruction = { $inc: {
        "stats.totalKeystrokes": totalKeystrokes,
        "stats.totalCharsAdded": totalCharsAdded,
        "stats.totalCharsDeleted": totalCharsDeleted,
        "stats.totalLinesAdded": totalLinesAdded,
        "stats.totalLinesDeleted": totalLinesDeleted,
        "stats.totalSecondsCoded": totalSecondsBatch
    }}
    
    preparedActivities.forEach(p => {
      languageTotals[p.language] = (languageTotals[p.language] || 0) + p.duration/1000
      editorTotals[p.editor] = (editorTotals[p.editor] || 0) + p.duration/1000

      if (p.project) {
        projectTotals[p.project] = (projectTotals[p.project] || 0) + p.duration/1000
      } else {
        independentFileTotals[p.independentFile] = (independentFileTotals[p.independentFile] || 0) + p.duration/1000
      }

    })

    if (Object.entries(projectTotals).length > 0) {
      Object.entries(projectTotals).forEach(([keyword, value]) => {
        updateInstruction.$inc[`skills.projects.${keyword}`] = value
      })
    } 

    if (Object.entries(independentFileTotals).length > 0) {
      Object.entries(independentFileTotals).forEach(([keyword, value]) => {
      updateInstruction.$inc[`skills.independentFiles.${keyword}`] = value
    })
    }
    
    Object.entries(languageTotals).forEach(([keyword, value]) => {
      updateInstruction.$inc[`skills.languages.${keyword}`] = value
    })

    Object.entries(editorTotals).forEach(([keyword, value]) => {
      updateInstruction.$inc[`skills.editors.${keyword}`] = value
    })

    await User.findByIdAndUpdate(user.id, updateInstruction)
    return response.status(201).json(sendActivities)
  } else {
    return response.status(401).json({error: 'unauthorized'})
  }

})

module.exports = activitiesRouter