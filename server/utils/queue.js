const Bull = require('bull');

const redisConfig = {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
}

const githubFastQueue = new Bull('github-fast', redisConfig)
const githubCommitQueue = new Bull('github-commits', redisConfig)
const githubPRQueue = new Bull('github-prs-releases', redisConfig)


module.exports = { githubFastQueue, githubCommitQueue, githubPRQueue }