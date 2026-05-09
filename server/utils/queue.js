const Bull = require('bull');

const githubSyncQueue = new Bull('github-sync', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

module.exports = { githubSyncQueue }