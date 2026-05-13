const { githubFastQueue, githubCommitQueue, githubPRQueue } = require('./queue')
const { syncFast, syncCommits, syncPRsAndReleases } = require('./githubSync')
const { getIO } = require('./socketManager')

githubFastQueue.process(10, async (job) => {
    const { userId, accessToken, githubUsername } = job.data
    await syncFast(userId, accessToken, githubUsername)
})

githubCommitQueue.process(10, async (job) => {
    const { userId, accessToken, githubUsername } = job.data
    await syncCommits(userId, accessToken, githubUsername)
})

githubPRQueue.process(10, async (job) => {
    const { userId, accessToken } = job.data
    await syncPRsAndReleases(userId, accessToken)
    // notify frontend only after ALL layers complete
    const io = getIO()
    if (io) io.to(userId.toString()).emit('sync:complete')
})