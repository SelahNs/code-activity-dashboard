const { githubSyncQueue} = require('./queue')
const { syncGitHubData } = require('./githubSync')
const {io} = require('../index')

githubSyncQueue.process(async (job) => {
  const { userId, accessToken, githubUsername } = job.data;
  await syncGitHubData(userId, accessToken, githubUsername);
  io.to(userId.toString()).emit('sync:complete')
})
