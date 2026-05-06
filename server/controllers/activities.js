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

    const updatedUser = await User.findByIdAndUpdate(
    user.id,
    updateInstruction,
    { new: true }
);

// --- Calculate everything first ---

// 1. Human cyborg ratio
const newRatio = updatedUser.stats.totalCharsAdded === 0
    ? 1
    : updatedUser.stats.totalKeystrokes / updatedUser.stats.totalCharsAdded;

// 2. Streak
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const lastActive = updatedUser.lastActiveDate
    ? new Date(
        updatedUser.lastActiveDate.getFullYear(),
        updatedUser.lastActiveDate.getMonth(),
        updatedUser.lastActiveDate.getDate()
    )
    : null;

const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

let newCurrentStreak = updatedUser.stats.currentStreak;
let newLongestStreak = updatedUser.stats.longestStreak;

if (!lastActive) {
    newCurrentStreak = 1;
} else if (lastActive.getTime() === today.getTime()) {
    // already coded today, no change
} else if (lastActive.getTime() === yesterday.getTime()) {
    newCurrentStreak = updatedUser.stats.currentStreak + 1;
    newLongestStreak = Math.max(newCurrentStreak, updatedUser.stats.longestStreak);
} else {
    newCurrentStreak = 1;
}

// 3. XP and level
const baseXP =
    (totalSecondsBatch * 0.3) +
    (totalLinesAdded * 1.5) +
    (totalLinesDeleted * 0.8) +
    (totalKeystrokes * 0.05);

const streakBonus = newCurrentStreak * 5;
const earnedXP = Math.round((baseXP + streakBonus) * newRatio);
const newTotalXP = updatedUser.stats.xp + earnedXP;
const newLevel = Math.floor(Math.sqrt(newTotalXP / 100)) + 1;

// --- One single $set for everything ---
await User.findByIdAndUpdate(user.id, {
    $set: {
        'stats.humanCyborgRatio': newRatio,
        'stats.currentStreak': newCurrentStreak,
        'stats.longestStreak': newLongestStreak,
        'stats.xp': newTotalXP,
        'stats.level': newLevel,
        'lastActiveDate': now
    }
});

    return response.status(201).json(sendActivities)

  } else {
    return response.status(401).json({error: 'unauthorized'})
  }

})

module.exports = activitiesRouter